import {
  Body,
  Controller,
  HttpStatus,
  InternalServerErrorException,
  Logger,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AppService } from './app.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { BadRequestResponseDto } from './dto/response/bad-request.response.dto';
import { CreateTransactionDetailResponseDto } from './dto/response/create-transaction-detail.response.dto';
import { InternalServerErrorResponseDto } from './dto/response/internal-server-error.response.dto';

@ApiTags('Transaction')
@Controller({ version: '1' })
@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);
  constructor(private readonly appService: AppService) {}

  @ApiBody({ type: CreateTransactionDto })
  @ApiBadRequestResponse({ type: BadRequestResponseDto })
  @ApiInternalServerErrorResponse({ type: InternalServerErrorResponseDto })
  @ApiCreatedResponse({ type: CreateTransactionDetailResponseDto })
  @Post()
  async createTransaction(@Body() transactionDto: CreateTransactionDto) {
    try {
      const transactionDetail = await this.appService.createNewTransaction(
        transactionDto,
      );
      this.logger.log(
        `[POST, /] ${transactionDetail.transaction_id} Transaction written successfully`,
      );
      return new CreateTransactionDetailResponseDto(
        HttpStatus.CREATED,
        `Transaction written successfully`,
        transactionDetail,
      );
    } catch (error) {
      this.logger.log(`[POST, /] ${error}`);
      throw new InternalServerErrorException();
    }
  }
}
