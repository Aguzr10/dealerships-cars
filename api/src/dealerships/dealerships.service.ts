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


// SERVICIO = aquí van las reglas de negocio. El controlador solo delega.
// Lanzar NotFoundException / ConflictException / BadRequestException → Nest responde 404 / 409 / 400 solo.
@Injectable()
export class DealershipsService{
    // Un repositorio por entidad que se usa aquí. Deben estar en forFeature([...]) de dealerships.module.ts.
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

    // Regla 1 → 404. Se reutiliza en findCars y remove: así el 404 se escribe una sola vez.
    // relations: { cars: true } carga los carros, que usan findCars y remove.
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
    // Ruta anidada GET /dealerships/:id/cars. Primero findOne (404 si el padre no existe), luego sus hijos.
      async findCars(id: number): Promise<Car[]> {
        const dealership = await this.findOne(id);
        return dealership.cars;
    }

      async create(dto: CreateDealershipDto): Promise<Dealership> {
        const name = dto.name;
        const city = dto.city;
        const active = dto.active ?? true;

        // Regla 2 → 409: buscar antes de guardar si ya existe uno con el mismo name (columna UNIQUE).
        if (await this.dealershipRepo.findOne({ where: { name } })) {
            throw new ConflictException(`Ya existe una dealership con el nombre '${name}'`);
        }
        
        // create() arma el objeto en memoria; save() hace el INSERT y devuelve el registro con id y fechas.
        return await this.dealershipRepo.save(
  this.dealershipRepo.create({ name, city, active }),
);
}

    async remove(id: number): Promise<{ message: string }> {
        const dealership = await this.findOne(id)   // Regla 1 → 404
        // Regla 6 → 409: no se borra un padre que todavía tiene hijos.
        if(dealership.cars.length > 0){
            throw new ConflictException("No se puede eliminar el concesionario porque tiene carros asociados")
        }
        await this.dealershipRepo.remove(dealership);
        return { message: `Dealership '${dealership.name}' eliminado correctamente` };
    }
  
  
  
  }
