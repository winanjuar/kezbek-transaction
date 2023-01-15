import { ApiProperty } from '@nestjs/swagger';
import { IsBase64 } from 'class-validator';

export class JourneyIdDto {
  @ApiProperty()
  @IsBase64()
  journey_id: string;
}
