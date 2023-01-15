import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { faker } from '@faker-js/faker';
import { TransactionDetailRepository } from './transaction-detail.repository';
import { INewTransactionDetail } from 'src/core/new-transaction-detail.interface';
import { TransactionDetail } from 'src/entity/transaction-detail.entity';

describe('PromoConfigRepository', () => {
  let transactionDetailRepository: TransactionDetailRepository;
  let transactionData: INewTransactionDetail;
  let mockTransactionDetail: TransactionDetail;

  const dataSource = {
    createEntityManager: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionDetailRepository,
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();

    transactionDetailRepository = module.get<TransactionDetailRepository>(
      TransactionDetailRepository,
    );

    transactionData = {
      transaction_id: faker.datatype.uuid(),
      transaction_origin_id: faker.datatype.uuid(),
      transaction_time: new Date(),
      customer_id: faker.datatype.uuid(),
      customer_name: faker.datatype.string(),
      customer_email: faker.datatype.string(),
      customer_phone: faker.datatype.string(),
      tier: faker.datatype.string(),
      remark: faker.datatype.string(),
      total_trx: faker.datatype.number(),
      partner_id: faker.datatype.uuid(),
      partner_api_key: faker.datatype.string(),
      partner_name: faker.datatype.string(),
      quantity: faker.datatype.number(),
      act_trx: faker.datatype.number(),
      promo_code: faker.datatype.string(),
      prosentase: faker.datatype.number(),
      point_transaction: faker.datatype.number(),
      point_loyalty: faker.datatype.number(),
      point_total: faker.datatype.number(),
    };

    mockTransactionDetail = {
      ...transactionData,
      created_at: new Date(),
      updated_at: new Date(),
    };
  });

  afterEach(() => jest.clearAllMocks());

  describe('createNewTransaction', () => {
    it('should write single transaction', async () => {
      // arrange
      const spySave = jest
        .spyOn(transactionDetailRepository, 'save')
        .mockResolvedValue(mockTransactionDetail);

      // act
      const transactionDetail =
        await transactionDetailRepository.createNewTransaction(transactionData);

      // assert
      expect(transactionDetail).toEqual(mockTransactionDetail);
      expect(spySave).toHaveBeenCalledTimes(1);
      expect(spySave).toHaveBeenCalledWith(transactionData);
    });
  });
});
