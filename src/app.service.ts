import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(
    @Inject('CustomerService') private readonly customerClient: ClientProxy,
    @Inject('WalletService') private readonly walletClient: ClientProxy,
  ) {
    this.customerClient.connect();
  }

  getHello(): string {
    return 'Hello world';
  }

  async getHello2(): Promise<any> {
    const data = { email: 'eno.windasari@gmail.com' };
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
      customer_id: '932f90b4-0d78-4a05-a93a-22e5d3e4e72e',
      transaction_type: 'IN',
      transaction_description: 'Coba aja',
      amount: 5000,
    };
    this.walletClient.emit('ep_write_wallet', data);
    this.logger.log(
      `Data new transaction ${data.customer_id} sent to ServiceWallet`,
    );
  }
}
