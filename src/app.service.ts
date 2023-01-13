import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import * as crypto from 'crypto';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { EPatternMessage } from './core/pattern-message.enum';
import { IResponseInfoCustomer } from './core/response-info-customer.interface';
import { IRequestInfoCustomer } from './core/request-info-customer.interface';
import { IRequestInfoPartner } from './core/request-info-partner.interface';
import { IResponseInfoPartner } from './core/response-info-partner.interface';
import { IResponseInfoLoyalty } from './core/response-info-loyalty.interface';
import { IRequestInfoLoyalty } from './core/request-info-loyalty.interface';
import { IResponseInfoPromo } from './core/response-info-promo.interface';
import { IRequestInfoPromo } from './core/request-info-promo.interface';
import { INewTransactionDetail } from './core/new-transaction-detail.interface';
import { TransactionDetailRepository } from './repository/transaction-detail.repository';
import { IWalletData } from './core/wallet-data.interface';
import { IMailData } from './core/mail-data.interface';

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
  ) {
    this.customerClient.connect();
  }

  async __sendWallet(data: IWalletData): Promise<void> {
    this.walletClient.emit(EPatternMessage.WRITE_WALLET, data);
    this.logger.log(
      `[MessagePattern ${EPatternMessage.WRITE_WALLET}] [${data.transaction_id}] Data transaction sent to ServiceWallet`,
    );
  }

  async __sendEmail(data: IMailData): Promise<void> {
    this.mailerClient.emit(EPatternMessage.SEND_EMAIL, data);
    this.logger.log(
      `[MessagePattern ${EPatternMessage.SEND_EMAIL}] [${data.transaction_id}] Data transaction sent to ServiceMailer`,
    );
  }

  async __infoCustomer(
    transaction_id: string,
    email: string,
  ): Promise<IResponseInfoCustomer> {
    try {
      const dataReqCustomer: IRequestInfoCustomer = { transaction_id, email };
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
    transaction_id: string,
    api_key: string,
  ): Promise<IResponseInfoPartner> {
    try {
      const dataReqPartner: IRequestInfoPartner = {
        transaction_id,
        api_key,
      };

      const partner = await firstValueFrom(
        this.partnerClient.send(EPatternMessage.INFO_PARTNER, dataReqPartner),
      );
      return partner as IResponseInfoPartner;
    } catch (error) {
      throw new InternalServerErrorException(error.response.message);
    }
  }

  async __infoLoyaltyPoint(
    transaction_id: string,
    transaction_time: Date,
    customer_id: string,
  ): Promise<IResponseInfoLoyalty> {
    try {
      const dataReqLoyaltyPoint: IRequestInfoLoyalty = {
        transaction_id,
        transaction_time,
        customer_id,
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

  async __infoPromoPoint(
    transaction_id: string,
    quantity: number,
    act_trx: number,
    promo_code: string,
  ): Promise<IResponseInfoPromo> {
    try {
      const dataReqTransactionPoint: IRequestInfoPromo = {
        transaction_id,
        quantity,
        act_trx,
        promo_code,
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

  async createNewTransaction(transactionDto: CreateTransactionDto) {
    try {
      const transaction_id = crypto.randomUUID();
      const transaction_time = new Date();

      const customer = await this.__infoCustomer(
        transaction_id,
        transactionDto.customer_email,
      );

      if (customer) {
        const result = await Promise.all([
          this.__infoPartner(transaction_id, transactionDto.partner_api_key),
          this.__infoLoyaltyPoint(
            transaction_id,
            transaction_time,
            customer.customer_id,
          ),
          this.__infoPromoPoint(
            transaction_id,
            transactionDto.quantity,
            transactionDto.act_trx,
            transactionDto.promo_code,
          ),
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
            transaction_id: dataTransaction.transaction_id,
            mail_to: dataTransaction.customer_email,
            partner_name: dataTransaction.partner_name,
            cashback_total: stringCashback,
          };

          await this.__sendWallet(dataWallet);
          await this.__sendEmail(dataEmail);

          return await this.transactionRepository.createNewTransaction(
            dataTransaction,
          );
        }
      }
    } catch (error) {
      throw new InternalServerErrorException(error.response.message);
    }
  }
}
