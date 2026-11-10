import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, 
         IsEnum, 
         IsInt,
         IsNotEmpty, 
         IsOptional, 
         IsString, 
         Max, 
         IsArray,
         ArrayUnique,
         Min,
         MaxLength,
         isBoolean,
         IsPositive
 } from "class-validator";
import { CarStatus } from '../entities/car-status.enums.js';



export class CreateCarDto {

    @ApiProperty({example: "ABC123"})
    @IsString()
    @IsNotEmpty()
    @MaxLength(10)
    plate: string;

    @ApiProperty({example: "Toyota"})
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    brand: string;

    @ApiProperty({example: "Corolla"})
    @IsString()
    @IsNotEmpty()
    @MaxLength(50)
    model: string;

    @ApiProperty({example: 2020})
    @IsInt()
    @Min(1990)
    @Max(2027)
    year: number;

    @ApiProperty({example: 20000})
    @IsInt()
    @IsPositive()
    price: number;

    @ApiPropertyOptional({enum: CarStatus, example: CarStatus.AVAILABLE})
    @IsOptional()
    @IsEnum(CarStatus)
    status?: CarStatus;
    
    @ApiProperty({example: 1})
    @IsInt()
    @IsPositive()
    dealership_id: number;




}
