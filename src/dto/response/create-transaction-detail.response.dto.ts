import { ApiProperty } from '@nestjs/swagger';
import { TransactionDetailDto } from '../transaction-detail.dto';
import { BaseResponseDto } from './base.response.dto';

export class CreateTransactionDetailResponseDto extends BaseResponseDto {
  constructor(statusCode: number, message: string, data: TransactionDetailDto) {
    super(statusCode, message);
    this.data = data;
  }

  @ApiProperty({ example: 201 })
  statusCode: number;

  @ApiProperty({
    example: 'This is sample message create new entity successfully',
  })
  message: string;

  @ApiProperty({ type: TransactionDetailDto })
  data: TransactionDetailDto;
}
