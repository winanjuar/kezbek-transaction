import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, NotFoundError } from 'rxjs';

@Injectable()
export class AppService {
  constructor(
    @Inject('CustomerService') private readonly customerClient: ClientProxy,
  ) {
    this.customerClient.connect();
  }

  async getHello(): Promise<any> {
    const data = { email: 'eno.windasari@gmail.com' };
    const customer = await firstValueFrom(
      this.customerClient.send('mp_info_customer', data),
    );
    if (!customer) {
      throw new NotFoundException('gak ada');
    }
    return customer;
  }
}
