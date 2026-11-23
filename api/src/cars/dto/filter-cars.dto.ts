import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';
import { CarStatus } from '../entities/car-status.enums.js';

// DTO de FILTROS para GET /cars?status=...&dealershipId=...
// Se recibe con @Query() en el controlador. Todo es opcional: sin filtros se listan todos.
// Con ValidationPipe, un filtro inválido (?status=ROTO) responde 400.
export class FilterCarsDto {
  @ApiPropertyOptional({ enum: CarStatus })
  @IsOptional()
  @IsEnum(CarStatus)
  status?: CarStatus;

  // Los query params SIEMPRE llegan como texto ("2"). @Type(() => Number) lo convierte a número
  // antes de que @IsInt lo valide.
  @ApiPropertyOptional({ type: Number, example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  dealershipId?: number;
}
