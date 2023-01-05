import { Injectable } from '@nestjs/common';
import { INewTransaction } from 'src/core/new-transaction.interface';
import { TransactionDetail } from 'src/entity/transaction-detail.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class TransactionDetailRepository extends Repository<TransactionDetail> {
  constructor(private readonly dataSource: DataSource) {
    super(TransactionDetail, dataSource.createEntityManager());
  }

  async createNewTransaction(data: INewTransaction) {
    return await this.save(data);
  }
}
