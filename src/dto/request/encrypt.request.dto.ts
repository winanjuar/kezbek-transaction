import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class EncryptRequestDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  transaction_origin_id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  partner_api_key: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  partner_api_secret: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  promo_code: string;
}
