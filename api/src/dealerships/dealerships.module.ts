import { Module } from '@nestjs/common';
import { DealershipsService } from './dealerships.service.js';
import { DealershipsController } from './dealerships.controller.js';

@Module({
  controllers: [DealershipsController],
  providers: [DealershipsService],
})
export class DealershipsModule {}
