import { Body, Controller, Get, Logger, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@ApiTags('Transaction')
@Controller({ version: '1' })
@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);
  constructor(private readonly appService: AppService) {}

  @Get('partnerid')
  parnerid() {
    return this.appService.partnerid();
  }

  @Post()
  async createTransaction(@Body() transactionDto: CreateTransactionDto) {
    return await this.appService.createNewTransaction(transactionDto);
  }
}
