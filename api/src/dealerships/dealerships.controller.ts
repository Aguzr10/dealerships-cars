import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { DealershipsService } from './dealerships.service.js';
import { CreateDealershipDto } from './dto/create-dealership.dto.js';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('dealerships')
@Controller('dealerships')
export class DealershipsController {
  constructor(private readonly dealershipsService: DealershipsService) {}

  @Post()
  create(@Body() createDealershipDto: CreateDealershipDto) {
    return this.dealershipsService.create(createDealershipDto);
  }

  @Get()
  findAll() {
    return this.dealershipsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.dealershipsService.findOne(id);
  }
  
  @Get(':id/cars')
    findCars(@Param('id', ParseIntPipe)id:number){
      return this.dealershipsService.findCars(id);
    }


  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.dealershipsService.remove(id);
  }
}
