import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { DealershipsService } from './dealerships.service.js';
import { CreateDealershipDto } from './dto/create-dealership.dto.js';
import { ApiTags } from '@nestjs/swagger';

// CONTROLADOR = una fila de la tabla de endpoints → un método. Sin lógica: solo recibe y delega al servicio.
// @Controller('dealerships') es el prefijo: en los métodos solo va lo que sigue después de /dealerships.
@ApiTags('dealerships')
@Controller('dealerships')
export class DealershipsController {
  constructor(private readonly dealershipsService: DealershipsService) {}

  // POST /dealerships → 201 | 400 (DTO inválido) | 409 (name repetido)
  @Post()
  create(@Body() createDealershipDto: CreateDealershipDto) {
    return this.dealershipsService.create(createDealershipDto);
  }

  // GET /dealerships → 200
  @Get()
  findAll() {
    return this.dealershipsService.findAll();
  }

  // GET /dealerships/:id → 200 | 400 (id no numérico, por ParseIntPipe) | 404
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.dealershipsService.findOne(id);
  }
  
  // GET /dealerships/:id/cars → 200 | 404   (ruta anidada: {id} del enunciado = ':id' en Nest)
  @Get(':id/cars')
    findCars(@Param('id', ParseIntPipe)id:number){
      return this.dealershipsService.findCars(id);
    }


  // DELETE /dealerships/:id → 200 | 404 | 409 (tiene carros asociados)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.dealershipsService.remove(id);
  }
}
