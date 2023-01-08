import { faker } from '@faker-js/faker';
import { HttpStatus, InternalServerErrorException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CreateTransactionDetailResponseDto } from './dto/response/create-transaction-detail.response.dto';

describe('AppController', () => {
  let controller: AppController;

  const appService = {
    createNewTransaction: jest.fn(),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [{ provide: AppService, useValue: appService }],
    }).compile();

    controller = app.get<AppController>(AppController);
  });

  afterEach(() => jest.clearAllMocks());

  describe('createTransaction', () => {
    it('should write transaction', async () => {
      // arrange
      const transactionDto = {
        partner_api_key: faker.datatype.string(),
        customer_email: faker.internet.email(),
        promo_code: faker.datatype.string(),
        quantity: faker.datatype.number(),
        act_trx: faker.datatype.number(),
      };

      const mockTransactionDetail = {
        transaction_id: faker.datatype.uuid(),
        transaction_time: new Date(),
        customer_id: faker.datatype.uuid(),
        customer_name: faker.datatype.string(),
        customer_email: transactionDto.customer_email,
        customer_phone: faker.datatype.string(),
        tier: faker.datatype.string(),
        remark: faker.datatype.string(),
        total_trx: faker.datatype.number(),
        partner_id: faker.datatype.uuid(),
        partner_api_key: transactionDto.partner_api_key,
        partner_name: faker.datatype.string(),
        quantity: transactionDto.quantity,
        act_trx: transactionDto.act_trx,
        promo_code: transactionDto.promo_code,
        prosentase: faker.datatype.number(),
        point_transaction: faker.datatype.number(),
        point_loyalty: faker.datatype.number(),
        point_total: faker.datatype.number(),
        created_at: new Date(),
        updated_at: new Date(),
      };

      const spyCreateNewTransaction = jest
        .spyOn(appService, 'createNewTransaction')
        .mockResolvedValue(mockTransactionDetail);

      const mockResponse = new CreateTransactionDetailResponseDto(
        HttpStatus.CREATED,
        `Transaction written successfully`,
        mockTransactionDetail,
      );

      // act
      const response = await controller.createTransaction(transactionDto);

      // assert
      expect(response).toEqual(mockResponse);
      expect(spyCreateNewTransaction).toHaveBeenCalledTimes(1);
      expect(spyCreateNewTransaction).toHaveBeenCalledWith(transactionDto);
    });

    it('should throw internal server error when unknown error occured', async () => {
      // arrange
      const transactionDto = {
        partner_api_key: faker.datatype.string(),
        customer_email: faker.internet.email(),
        promo_code: faker.datatype.string(),
        quantity: faker.datatype.number(),
        act_trx: faker.datatype.number(),
      };

      const spyCreateNewTransaction = jest
        .spyOn(appService, 'createNewTransaction')
        .mockRejectedValue(new InternalServerErrorException());

      // act
      const funCreateTransaction = controller.createTransaction(transactionDto);

      // assert
      await expect(funCreateTransaction).rejects.toEqual(
        new InternalServerErrorException(),
      );
      expect(spyCreateNewTransaction).toHaveBeenCalledTimes(1);
      expect(spyCreateNewTransaction).toHaveBeenCalledWith(transactionDto);
    });
  });
});
