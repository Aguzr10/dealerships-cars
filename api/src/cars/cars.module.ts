import { Module } from '@nestjs/common';
import { CarsService } from './cars.service.js';
import { CarsController } from './cars.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm'; 
import { Car } from './entities/car.entity.js';
import { Dealership } from '../dealerships/entities/dealership.entity.js';

@Module({
  controllers: [CarsController],
  providers: [CarsService],
  imports: [TypeOrmModule.forFeature([Car, Dealership])],
})
export class CarsModule {}
