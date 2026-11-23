import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CarsService } from './cars.service.js';
import { CreateCarDto } from './dto/create-car.dto.js';
import { UpdateCarStatusDto } from './dto/update-car-status.dto.js';
import { FilterCarsDto } from './dto/filter-cars.dto.js';

// CONTROLADOR = una fila de la tabla de endpoints → un método. Sin lógica: recibe y delega al servicio.
// @Controller('cars') es el prefijo; en cada método va solo lo que sigue después de /cars.
@ApiTags('cars')
@Controller('cars')
export class CarsController {
  constructor(private readonly carsService: CarsService) {}

  // GET /cars?status=&dealershipId= → 200 | 400 (filtro inválido)
  // Lo que va después de "?" se recibe con @Query(); aquí todo en un DTO de filtros.
  @Get()
  findAll(@Query() filters: FilterCarsDto) {
    return this.carsService.findAll(filters);
  }

  // GET /cars/:id → 200 (incluye su concesionario) | 400 (id no numérico) | 404
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.carsService.findOne(id);
  }

  // POST /cars → 201 | 400 (DTO inválido o concesionario inactivo) | 404 (concesionario no existe) | 409 (plate repetida)
  @Post()
  create(@Body() dto: CreateCarDto) {
    return this.carsService.create(dto);
  }

  // PATCH /cars/:id/status → 200 | 400 (status inválido o el carro ya está SOLD) | 404
  // Ruta con id + body: @Param para el :id y @Body para { status }.
  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCarStatusDto,
  ) {
    return this.carsService.updateStatus(id, dto);
  }

  // DELETE /cars/:id → 200 | 404
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.carsService.remove(id);
  }
}
