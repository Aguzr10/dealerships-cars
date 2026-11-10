import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Dealership } from './entities/dealership.entity.js';
import { CreateDealershipDto } from './dto/create-dealership.dto.js';
import { UpdateDealershipDto } from './dto/update-dealership.dto.js';
import { Car } from '../cars/entities/car.entity.js'


@Injectable()
export class DealershipsService{
    constructor(
        @InjectRepository(Dealership)
        private readonly dealershipRepo: Repository<Dealership>,
        @InjectRepository(Car)
        private readonly carRepo: Repository<Car>
    ) {}
  
    async findAll(): Promise<Dealership[]> {
    return await this.dealershipRepo.find({
        relations: {cars: true},
        order: {id: "ASC"},
        });
    }

      async findOne(id: number): Promise<Dealership> {
        const dealership = await this.dealershipRepo.findOne({
            where: { id },
            relations: { cars: true },
        });

        if (!dealership) {
            throw new NotFoundException(`El dealership con id ${id} no encontrado`);
        }

        return dealership;
    }
      async findCars(id: number): Promise<Car[]> {
        const dealership = await this.findOne(id);
        return dealership.cars;
    }

      async create(dto: CreateDealershipDto): Promise<Dealership> {
        const name = dto.name;
        const city = dto.city;
        const active = dto.active ?? true;

        if (await this.dealershipRepo.findOne({ where: { name } })) {
            throw new ConflictException(`Ya existe una dealership con el nombre '${name}'`);
        }
        
        return await this.dealershipRepo.save(
  this.dealershipRepo.create({ name, city, active }),
);
}

    async remove(id: number): Promise<{ message: string }> {
        const dealership = await this.findOne(id)
        if(dealership.cars.length > 0){
            throw new ConflictException("No se puede eliminar el concesionario porque tiene carros asociados")
        }
        await this.dealershipRepo.remove(dealership);
        return { message: `Dealership '${dealership.name}' eliminado correctamente` };
    }
  
  
  
  }
