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
import { JourneyIdDto } from './dto/journey-id.dto';
import { EncryptRequestDto } from './dto/request/encrypt.request.dto';
import { BadRequestResponseDto } from './dto/response/bad-request.response.dto';
import { CreateTransactionDetailResponseDto } from './dto/response/create-transaction-detail.response.dto';
import { InternalServerErrorResponseDto } from './dto/response/internal-server-error.response.dto';
import { JourneyIdResponseDto } from './dto/response/journey-id.response.dto';

@ApiTags('Transaction')
@Controller({ version: '1' })
export class AppController {
  private readonly logger = new Logger(AppController.name);
  constructor(private readonly appService: AppService) {}

  @ApiBody({ type: EncryptRequestDto })
  @ApiCreatedResponse({ type: JourneyIdResponseDto })
  @ApiBadRequestResponse({ type: BadRequestResponseDto })
  @ApiInternalServerErrorResponse({ type: InternalServerErrorResponseDto })
  @Post('generate-journey-id')
  async generateJourneyId(@Body() data: EncryptRequestDto) {
    const logIdentifier = 'POST generate-journey-id';
    try {
      const journeyIdString = await this.appService.genereateJourneyId(data);
      const journeyId: JourneyIdDto = {
        journey_id: journeyIdString,
      };
      this.logger.log(
        `[${logIdentifier}] [${data.transaction_origin_id}] Generate journey id successfully`,
      );
      return new JourneyIdResponseDto(
        HttpStatus.CREATED,
        'Generate journey id successfully',
        journeyId,
      );
    } catch (error) {
      this.logger.log(`[${logIdentifier}] ${error}`);
      throw new InternalServerErrorException();
    }
  }

  @ApiBody({ type: CreateTransactionDto })
  @ApiBadRequestResponse({ type: BadRequestResponseDto })
  @ApiInternalServerErrorResponse({ type: InternalServerErrorResponseDto })
  @ApiCreatedResponse({ type: CreateTransactionDetailResponseDto })
  @Post('new-transaction')
  async createTransaction(@Body() transactionDto: CreateTransactionDto) {
    const logIdentifier = 'POST new-transaction';
    try {
      const transactionDetail = await this.appService.createNewTransaction(
        transactionDto,
      );
      this.logger.log(
        `[${logIdentifier}] ${transactionDetail.transaction_id} Transaction written successfully`,
      );
      return new CreateTransactionDetailResponseDto(
        HttpStatus.CREATED,
        `Transaction written successfully`,
        transactionDetail,
      );
    } catch (error) {
      this.logger.log(`[${logIdentifier}] ${error}`);
      throw new InternalServerErrorException();
    }
  }
}
