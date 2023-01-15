import { ApiProperty } from '@nestjs/swagger';
import { JourneyIdDto } from '../journey-id.dto';
import { BaseResponseDto } from './base.response.dto';

export class JourneyIdResponseDto extends BaseResponseDto {
  constructor(statusCode: number, message: string, data: JourneyIdDto) {
    super(statusCode, message);
    this.data = data;
  }

  @ApiProperty({ example: 201 })
  statusCode: number;

  @ApiProperty({
    example: 'This is sample message generate journey id successfully',
  })
  message: string;

  @ApiProperty({ type: JourneyIdDto })
  data: JourneyIdDto;
}
