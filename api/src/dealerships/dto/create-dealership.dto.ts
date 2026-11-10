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
         isBoolean
 } from "class-validator";

 

export class CreateDealershipDto {

    @ApiProperty({example: "Autos Norte"})
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    name: string;

    @ApiProperty({example: "Bogotá"})
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    city: string;

    @ApiPropertyOptional({example: true})
    @IsOptional()
    @IsBoolean()
    active?: boolean;

}



