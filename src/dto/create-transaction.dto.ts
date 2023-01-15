import { ApiProperty } from '@nestjs/swagger';
import {
  IsBase64,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

export class CreateTransactionDto {
  @ApiProperty()
  @IsString()
  transaction_origin_id: string;

  @ApiProperty()
  @IsString()
  partner_api_key: string;

  @ApiProperty()
  @IsEmail()
  customer_email: string;

  @ApiProperty()
  @IsString()
  promo_code: string;

  @ApiProperty()
  @IsNumber()
  quantity: number;

  @ApiProperty()
  @IsNumber()
  act_trx: number;

  @ApiProperty()
  @IsBase64()
  @IsNotEmpty()
  journey_id: string;
}
