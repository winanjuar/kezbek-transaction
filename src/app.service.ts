import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import * as crypto from 'crypto';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { EPatternMessage } from './core/pattern-message.enum';
import { IResponseInfoCustomer } from './core/response-info-customer.interface';
import { IRequestInfoCustomer } from './core/request-info-customer.interface';
import { IRequestInfoPartnerKey } from './core/request-info-partner-key.interface';
import { IResponseInfoPartner } from './core/response-info-partner.interface';
import { IResponseInfoLoyalty } from './core/response-info-loyalty.interface';
import { IResponseInfoPromo } from './core/response-info-promo.interface';
import { IRequestInfoPromo } from './core/request-info-promo.interface';
import { INewTransactionDetail } from './core/new-transaction-detail.interface';
import { TransactionDetailRepository } from './repository/transaction-detail.repository';
import { IWalletData } from './core/wallet-data.interface';
import { IMailData } from './core/mail-data.interface';
import { EncryptRequestDto } from './dto/request/encrypt.request.dto';
import { decryptData, encryptData } from './utils/encrypt';
import { IDecryptedMessage } from './core/decrypted-message.interface';
import { IRequestCalculateLoyalty } from './core/request-calculate-loyalty.interface';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(
    @Inject('CustomerService') private readonly customerClient: ClientProxy,
    @Inject('LoyaltyService') private readonly loyaltyClient: ClientProxy,
    @Inject('PartnerService') private readonly partnerClient: ClientProxy,
    @Inject('PromoService') private readonly promoClient: ClientProxy,
    @Inject('WalletService') private readonly walletClient: ClientProxy,
    @Inject('MailerService') private readonly mailerClient: ClientProxy,
    private readonly transactionRepository: TransactionDetailRepository,
  ) {}

  async __sendWallet(data: IWalletData): Promise<void> {
    this.walletClient.emit(EPatternMessage.WRITE_WALLET, data);
    this.logger.log(
      `[${EPatternMessage.WRITE_WALLET}] [${data.transaction_id}] Data transaction sent to ServiceWallet`,
    );
  }

  async __sendEmail(data: IMailData): Promise<void> {
    this.mailerClient.emit(EPatternMessage.SEND_EMAIL, data);
    this.logger.log(
      `[${EPatternMessage.SEND_EMAIL}] [${data.transaction_id}] Send data email to ServiceMailer`,
    );
  }

  async __infoCustomer(
    data: IRequestInfoCustomer,
  ): Promise<IResponseInfoCustomer> {
    try {
      const dataReqCustomer: IRequestInfoCustomer = {
        transaction_id: data.transaction_id,
        email: data.email,
      };
      const customer = await firstValueFrom(
        this.customerClient.send(
          EPatternMessage.INFO_CUSTOMER,
          dataReqCustomer,
        ),
      );
      return customer as IResponseInfoCustomer;
    } catch (error) {
      throw new InternalServerErrorException(error.response.message);
    }
  }

  async __infoPartner(
    data: IRequestInfoPartnerKey,
  ): Promise<IResponseInfoPartner> {
    try {
      const dataReqPartner: IRequestInfoPartnerKey = {
        transaction_id: data.transaction_id,
        api_key: data.api_key,
      };
      const partner = await firstValueFrom(
        this.partnerClient.send(
          EPatternMessage.INFO_PARTNER_KEY,
          dataReqPartner,
        ),
      );
      return partner as IResponseInfoPartner;
    } catch (error) {
      throw new InternalServerErrorException(error.response.message);
    }
  }

  async __infoLoyaltyPoint(
    data: IRequestCalculateLoyalty,
  ): Promise<IResponseInfoLoyalty> {
    try {
      const dataReqLoyaltyPoint: IRequestCalculateLoyalty = {
        transaction_id: data.transaction_id,
        transaction_time: data.transaction_time,
        customer_id: data.customer_id,
      };
      const loyaltyPoint = await firstValueFrom(
        this.loyaltyClient.send(
          EPatternMessage.CALCULATE_LOYALTY_POINT,
          dataReqLoyaltyPoint,
        ),
      );
      return loyaltyPoint as IResponseInfoLoyalty;
    } catch (error) {
      throw new InternalServerErrorException(error.response.message);
    }
  }

  async __infoPromoPoint(data: IRequestInfoPromo): Promise<IResponseInfoPromo> {
    try {
      const dataReqTransactionPoint: IRequestInfoPromo = {
        transaction_id: data.transaction_id,
        transaction_time: data.transaction_time,
        customer_id: data.customer_id,
        quantity_origin: data.quantity_origin,
        act_trx: data.act_trx,
        promo_code: data.promo_code,
      };
      const trxPoint = await firstValueFrom(
        this.promoClient.send(
          EPatternMessage.CALCULATE_TRANSACTION_POINT,
          dataReqTransactionPoint,
        ),
      );

      return trxPoint as IResponseInfoPromo;
    } catch (error) {
      throw new InternalServerErrorException(error.response.message);
    }
  }

  __isTransactionValid(
    transactionDto: CreateTransactionDto,
    decryptedMessage: IDecryptedMessage,
  ): boolean {
    if (
      transactionDto.transaction_origin_id ===
        decryptedMessage.transaction_origin_id &&
      transactionDto.partner_api_key === decryptedMessage.partner_api_key &&
      transactionDto.promo_code === decryptedMessage.promo_code
    )
      return true;
    return false;
  }

  async createNewTransaction(transactionDto: CreateTransactionDto) {
    try {
      const journeyId = transactionDto.journey_id;
      const decryptedJourneyId = await this.__tryDecrypt(journeyId);
      if (this.__isTransactionValid(transactionDto, decryptedJourneyId)) {
        const transaction_id = crypto.randomUUID();
        const transaction_time = new Date();

        const dataReqInfoCustomer: IRequestInfoCustomer = {
          transaction_id,
          email: transactionDto.customer_email,
        };

        const dataReqInfoPartnerKey: IRequestInfoPartnerKey = {
          transaction_id,
          api_key: transactionDto.partner_api_key,
        };

        const customer = await this.__infoCustomer(dataReqInfoCustomer);

        if (customer) {
          const dataReqCalculateLoyalty: IRequestCalculateLoyalty = {
            transaction_id,
            transaction_time,
            customer_id: customer.customer_id,
          };

          const dataReqInfoPromo: IRequestInfoPromo = {
            transaction_id,
            transaction_time,
            customer_id: customer.customer_id,
            quantity_origin: transactionDto.quantity,
            act_trx: transactionDto.act_trx,
            promo_code: transactionDto.promo_code,
          };

          const result = await Promise.all([
            this.__infoPartner(dataReqInfoPartnerKey),
            this.__infoLoyaltyPoint(dataReqCalculateLoyalty),
            this.__infoPromoPoint(dataReqInfoPromo),
          ]);

          const partner = result[0];
          const loyalty = result[1];
          const promo = result[2];

          if (
            transaction_id === customer.transaction_id &&
            transaction_id === partner.transaction_id &&
            transaction_id === loyalty.transaction_id &&
            transaction_id === promo.transaction_id
          ) {
            const dataTransaction: INewTransactionDetail = {
              transaction_id,
              transaction_origin_id: transactionDto.transaction_origin_id,
              transaction_time,
              customer_id: customer.customer_id,
              customer_name: customer.name,
              customer_email: customer.email,
              customer_phone: customer.phone,
              partner_id: partner.partner_id,
              partner_name: partner.name,
              partner_api_key: transactionDto.partner_api_key,
              total_trx: loyalty.total_trx,
              point_loyalty: loyalty.point,
              tier: loyalty.tier,
              remark: loyalty.remark,
              quantity: transactionDto.quantity,
              act_trx: transactionDto.act_trx,
              promo_code: transactionDto.promo_code,
              prosentase: Number(promo.prosentase),
              point_transaction: promo.point,
              point_total: loyalty.point + promo.point,
            };

            const dataWallet: IWalletData = {
              transaction_id: dataTransaction.transaction_id,
              transaction_time: dataTransaction.transaction_time,
              customer_id: dataTransaction.customer_id,
              amount: dataTransaction.point_total,
            };

            const stringCashback = dataTransaction.point_total.toLocaleString(
              'id-ID',
              { style: 'currency', currency: 'IDR' },
            );

            const dataEmail: IMailData = {
              transaction_id: transactionDto.transaction_origin_id,
              mail_to: dataTransaction.customer_email,
              partner_name: dataTransaction.partner_name,
              cashback_total: stringCashback,
            };

            await this.__sendWallet(dataWallet);
            await this.__sendEmail(dataEmail);

            return await this.transactionRepository.createNewTransaction(
              dataTransaction,
            );
          } else {
            throw new UnprocessableEntityException(
              'Transaction does not synchronized',
            );
          }
        } else {
          throw new UnprocessableEntityException('Customer does not valid');
        }
      } else {
        throw new UnprocessableEntityException('Transaction does not valid');
      }
    } catch (error) {
      throw new InternalServerErrorException(error.response.message);
    }
  }

  async genereateJourneyId(data: EncryptRequestDto) {
    const messageArray = Object.values(data);
    const message = messageArray.join('|');
    return await encryptData(message);
  }

  async __tryDecrypt(data: string) {
    const message = await decryptData(data);
    const resultArray = message.split('|');
    return {
      transaction_origin_id: resultArray[0],
      partner_api_key: resultArray[1],
      partner_api_secret: resultArray[2],
      promo_code: resultArray[3],
    } as IDecryptedMessage;
  }
}
