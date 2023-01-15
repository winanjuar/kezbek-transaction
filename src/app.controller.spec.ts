import { faker } from '@faker-js/faker';
import { HttpStatus, InternalServerErrorException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EncryptRequestDto } from './dto/request/encrypt.request.dto';
import { CreateTransactionDetailResponseDto } from './dto/response/create-transaction-detail.response.dto';
import { JourneyIdResponseDto } from './dto/response/journey-id.response.dto';

describe('AppController', () => {
  let controller: AppController;

  const appService = {
    createNewTransaction: jest.fn(),
    genereateJourneyId: jest.fn(),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [{ provide: AppService, useValue: appService }],
    }).compile();

    controller = app.get<AppController>(AppController);
  });

  afterEach(() => jest.clearAllMocks());

  describe('generateJourneyId', () => {
    it('should generate journey id', async () => {
      // arrange
      const encryptRequestDto: EncryptRequestDto = {
        transaction_origin_id: faker.datatype.uuid(),
        partner_api_key: faker.datatype.string(),
        partner_api_secret: faker.datatype.string(),
        promo_code: faker.datatype.string(),
      };

      const mockJourneyIdStr =
        '7vG2AkbglhqGrfM6JJui3POKlz9IEYRTAracdPx3QFhuqbz5mKU3/bUG8t4K1jlnruF9J2TGgKxVHliR46G2m3gVf0lBykX/pThJyZzVunlTTzAgvsSMDX1+4ztwQf5EfCjjp/OFSWwK8aDM88r58lF0W+LluJ190eEOAb0kF3+Vc0JSWXjlQ4ev8Q==';

      const spyGenereateJourneyId = jest
        .spyOn(appService, 'genereateJourneyId')
        .mockResolvedValue(mockJourneyIdStr);

      const mockResponse = new JourneyIdResponseDto(
        HttpStatus.CREATED,
        `Generate journey id successfully`,
        { journey_id: mockJourneyIdStr },
      );

      // act
      const response = await controller.generateJourneyId(encryptRequestDto);

      // assert
      expect(response).toEqual(mockResponse);
      expect(spyGenereateJourneyId).toHaveBeenCalledTimes(1);
      expect(spyGenereateJourneyId).toHaveBeenCalledWith(encryptRequestDto);
    });

    it('should throw internal server error when unknown error occured', async () => {
      // arrange
      const encryptRequestDto: EncryptRequestDto = {
        transaction_origin_id: faker.datatype.uuid(),
        partner_api_key: faker.datatype.string(),
        partner_api_secret: faker.datatype.string(),
        promo_code: faker.datatype.string(),
      };

      const spyGenereateJourneyId = jest
        .spyOn(appService, 'genereateJourneyId')
        .mockRejectedValue(new InternalServerErrorException());

      // act
      const funGenerateJourneyId =
        controller.generateJourneyId(encryptRequestDto);

      // assert
      await expect(funGenerateJourneyId).rejects.toEqual(
        new InternalServerErrorException(),
      );
      expect(spyGenereateJourneyId).toHaveBeenCalledTimes(1);
      expect(spyGenereateJourneyId).toHaveBeenCalledWith(encryptRequestDto);
    });
  });

  describe('createTransaction', () => {
    it('should write transaction', async () => {
      // arrange
      const transactionDto = {
        transaction_origin_id: faker.datatype.uuid(),
        partner_api_key: faker.datatype.string(),
        customer_email: faker.internet.email(),
        promo_code: faker.datatype.string(),
        quantity: faker.datatype.number(),
        act_trx: faker.datatype.number(),
        journey_id:
          '7vG2AkbglhqGrfM6JJui3POKlz9IEYRTAracdPx3QFhuqbz5mKU3/bUG8t4K1jlnruF9J2TGgKxVHliR46G2m3gVf0lBykX/pThJyZzVunlTTzAgvsSMDX1+4ztwQf5EfCjjp/OFSWwK8aDM88r58lF0W+LluJ190eEOAb0kF3+Vc0JSWXjlQ4ev8Q==',
      };

      const mockTransactionDetail = {
        transaction_id: faker.datatype.uuid(),
        transaction_origin_id: faker.datatype.uuid(),
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
        transaction_origin_id: faker.datatype.uuid(),
        partner_api_key: faker.datatype.string(),
        customer_email: faker.internet.email(),
        promo_code: faker.datatype.string(),
        quantity: faker.datatype.number(),
        act_trx: faker.datatype.number(),
        journey_id:
          '7vG2AkbglhqGrfM6JJui3POKlz9IEYRTAracdPx3QFhuqbz5mKU3/bUG8t4K1jlnruF9J2TGgKxVHliR46G2m3gVf0lBykX/pThJyZzVunlTTzAgvsSMDX1+4ztwQf5EfCjjp/OFSWwK8aDM88r58lF0W+LluJ190eEOAb0kF3+Vc0JSWXjlQ4ev8Q==',
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
