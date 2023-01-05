import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import * as crypto from 'crypto';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(
    @Inject('CustomerService') private readonly customerClient: ClientProxy,
    @Inject('WalletService') private readonly walletClient: ClientProxy,
    @Inject('LoyaltyService') private readonly loyaltyClient: ClientProxy,
    @Inject('PartnerService') private readonly partnerClient: ClientProxy,
  ) {
    this.customerClient.connect();
  }

  getHello(): string {
    return 'Hello world';
  }

  async getHello2(): Promise<any> {
    const data = {
      email: 'eno.windasari@gmail.com',
      transaction_id: '3566c7c5-0f66-4b0c-9b24-2de75adf1d4e',
    };
    const customer = await firstValueFrom(
      this.customerClient.send('mp_info_customer', data),
    );
    if (!customer) {
      throw new NotFoundException('gak ada');
    }
    return customer;
  }

  getHello3() {
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

  async getHello4(): Promise<any> {
    const data = {
      transaction_id: crypto.randomUUID(),
      customer_id: '2cb1aae6-30bd-49e3-ad09-aa32af926066',
      transaction_time: new Date(),
    };
    const point = await firstValueFrom(
      this.loyaltyClient.send('mp_loyalty_point', data),
    );
    if (!point) {
      throw new NotFoundException('gak ada');
    }
    return point;
  }

  async getHello5(): Promise<any> {
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
}
