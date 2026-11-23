import { Module } from '@nestjs/common';
import { CarsService } from './cars.service.js';
import { CarsController } from './cars.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm'; 
import { Car } from './entities/car.entity.js';
import { Dealership } from '../dealerships/entities/dealership.entity.js';

@Module({
  controllers: [CarsController],
  providers: [CarsService],
  // Dealership también: CarsService lo necesitará para la regla 4 (concesionario existe y está activo).
  imports: [TypeOrmModule.forFeature([Car, Dealership])],
})
export class CarsModule {}
