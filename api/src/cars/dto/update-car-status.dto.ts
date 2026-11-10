import { ApiProperty } from '@nestjs/swagger';
import { IsEnum} from 'class-validator';
import { CarStatus } from '../entities/car-status.enums.js';

export class UpdateCarStatusDto {
    @ApiProperty({enum: CarStatus, example: CarStatus.SOLD})
    @IsEnum(CarStatus)
    status: CarStatus;
}
