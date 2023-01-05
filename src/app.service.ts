import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
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
import { INewTransaction } from './core/new-transaction.interface';
import { TransactionDetailRepository } from './repository/transaction-detail.repository';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(
    @Inject('CustomerService') private readonly customerClient: ClientProxy,
    @Inject('WalletService') private readonly walletClient: ClientProxy,
    @Inject('LoyaltyService') private readonly loyaltyClient: ClientProxy,
    @Inject('PartnerService') private readonly partnerClient: ClientProxy,
    @Inject('PromoService') private readonly promoClient: ClientProxy,
    private readonly transactionRepository: TransactionDetailRepository,
  ) {
    this.customerClient.connect();
  }

  async wallet(): Promise<any> {
    const data = {
      transaction_id: crypto.randomUUID(),
      customer_id: crypto.randomUUID(),
      transaction_time: new Date(),
      transaction_type: 'IN',
      transaction_description: 'Coba aja',
      amount: 5000,
    };
    this.walletClient.emit('ep_write_wallet', data);
    this.logger.log(
      `[MessagePattern ep_write_wallet] [${data.transaction_id}] Data transaction sent to ServiceWallet`,
    );
  }

  async partnerid(): Promise<any> {
    const data = {
      transaction_id: crypto.randomUUID(),
      partner_id: 'c5fa09b5-b255-4e6f-93fb-b407c107ceab',
    };
    const partner = await firstValueFrom(
      this.partnerClient.send('mp_info_partner', data),
    );
    if (!partner) {
      throw new NotFoundException('gak ada');
    }
    return partner;
  }

  async __infoCustomer(
    transaction_id: string,
    email: string,
  ): Promise<IResponseInfoCustomer> {
    const dataReqCustomer: IRequestInfoCustomer = { transaction_id, email };
    const customer = await firstValueFrom(
      this.customerClient.send(EPatternMessage.INFO_CUSTOMER, dataReqCustomer),
    );
    return customer as IResponseInfoCustomer;
  }

  async __infoPartner(
    transaction_id: string,
    api_key: string,
  ): Promise<IResponseInfoPartner> {
    const dataReqPartner: IRequestInfoPartner = {
      transaction_id,
      api_key,
    };

    const partner = await firstValueFrom(
      this.partnerClient.send(EPatternMessage.INFO_PARTNER, dataReqPartner),
    );
    return partner as IResponseInfoPartner;
  }

  async __infoLoyaltyPoint(
    transaction_id: string,
    transaction_time: Date,
    customer_id: string,
  ): Promise<IResponseInfoLoyalty> {
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
  }

  async __infoPromoPoint(
    transaction_id: string,
    quantity: number,
    act_trx: number,
    promo_code: string,
  ): Promise<IResponseInfoPromo> {
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
  }

  async createNewTransaction(transactionDto: CreateTransactionDto) {
    const transaction_id = crypto.randomUUID();
    const transaction_time = new Date();

    const customer = await this.__infoCustomer(
      transaction_id,
      transactionDto.customer_email,
    );

    if (customer) {
      const result = await Promise.all([
        this.__infoPartner(transaction_id, transactionDto.partner_api_key),
        this.__infoLoyaltyPoint(transaction_id, transaction_time, customer.id),
        this.__infoPromoPoint(
          transaction_id,
          transactionDto.quantity,
          transactionDto.act_trx,
          transactionDto.promo_code,
        ),
      ]);
      const data: INewTransaction = {
        transaction_id,
        transaction_time,
        customer_id: customer.id,
        customer_name: customer.name,
        customer_email: customer.email,
        customer_phone: customer.phone,
        partner_id: result[0].id,
        partner_name: result[0].name,
        partner_api_key: transactionDto.partner_api_key,
        total_trx: result[1].total_trx,
        point_loyalty: result[1].point,
        tier: result[1].tier,
        remark: result[1].remark,
        quantity: transactionDto.quantity,
        act_trx: transactionDto.act_trx,
        promo_code: transactionDto.promo_code,
        prosentase: Number(result[2].prosentase),
        point_transaction: result[2].point,
        point_total: result[1].point + result[2].point,
      };
      return await this.transactionRepository.createNewTransaction(data);
    } else {
      throw new InternalServerErrorException();
    }
  }
}
