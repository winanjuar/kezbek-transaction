import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNumber, IsString } from 'class-validator';

export class CreateTransactionDto {
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
}
