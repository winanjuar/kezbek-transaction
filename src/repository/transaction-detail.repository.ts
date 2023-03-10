import { Injectable } from '@nestjs/common';
import { INewTransactionDetail } from 'src/core/new-transaction-detail.interface';
import { TransactionDetail } from 'src/entity/transaction-detail.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class TransactionDetailRepository extends Repository<TransactionDetail> {
  constructor(private readonly dataSource: DataSource) {
    super(TransactionDetail, dataSource.createEntityManager());
  }

  async createNewTransaction(data: INewTransactionDetail) {
    return await this.save(data);
  }
}
