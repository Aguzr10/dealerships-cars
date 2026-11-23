import { Module } from '@nestjs/common';
import { DealershipsService } from './dealerships.service.js';
import { DealershipsController } from './dealerships.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dealership } from './entities/dealership.entity.js';
import { Car } from '../cars/entities/car.entity.js';

@Module({
  controllers: [DealershipsController],
  providers: [DealershipsService],
  // forFeature = qué repositorios se pueden inyectar en este módulo. Car está para listar/contar los carros.
  imports: [TypeOrmModule.forFeature([Dealership, Car])],
})
export class DealershipsModule {}
