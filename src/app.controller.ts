import { Controller, Get, Logger } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('Transaction')
@Controller({ version: '1' })
@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello() {
    return this.appService.getHello();
  }

  @Get('2')
  getHello2() {
    return this.appService.getHello2();
  }

  @Get('3')
  getHello3() {
    return this.appService.getHello3();
  }
}
