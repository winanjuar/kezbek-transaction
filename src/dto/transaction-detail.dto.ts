import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsEmail, IsNumber, IsString, IsUUID } from 'class-validator';

export class TransactionDetailDto {
  @ApiProperty()
  @IsUUID()
  transaction_id: string;

  @ApiProperty()
  @IsDate()
  transaction_time: Date;

  @ApiProperty()
  @IsUUID()
  customer_id: string;

  @ApiProperty()
  @IsString()
  customer_name: string;

  @ApiProperty()
  @IsEmail()
  customer_email: string;

  @ApiProperty()
  @IsString()
  customer_phone: string;

  @ApiProperty()
  @IsString()
  tier: string;

  @ApiProperty()
  @IsString()
  remark: string;

  @ApiProperty()
  @IsNumber()
  total_trx: number;

  @ApiProperty()
  @IsUUID()
  partner_id: string;

  @ApiProperty()
  @IsString()
  partner_api_key: string;

  @ApiProperty()
  @IsString()
  partner_name: string;

  @ApiProperty()
  @IsNumber()
  quantity: number;

  @ApiProperty()
  @IsNumber()
  act_trx: number;

  @ApiProperty()
  @IsString()
  promo_code: string;

  @ApiProperty()
  @IsNumber()
  prosentase: number;

  @ApiProperty()
  @IsNumber()
  point_transaction: number;

  @ApiProperty()
  @IsNumber()
  point_loyalty: number;

  @ApiProperty()
  @IsNumber()
  point_total: number;

  @ApiProperty()
  @IsDate()
  created_at: Date;

  @ApiProperty()
  @IsDate()
  updated_at: Date;
}
