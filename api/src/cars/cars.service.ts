import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Car } from './entities/car.entity.js';
import { CarStatus } from './entities/car-status.enums.js';
import { Dealership } from '../dealerships/entities/dealership.entity.js';
import { CreateCarDto } from './dto/create-car.dto.js';
import { UpdateCarStatusDto } from './dto/update-car-status.dto.js';
import { FilterCarsDto } from './dto/filter-cars.dto.js';

// SERVICIO de carros (lado "muchos" de la relación). Reglas 1, 2, 4 y 5.
// La regla 3 (year, price, status) ya la cubren los DTOs con class-validator → 400 automático.
@Injectable()
export class CarsService {
  // Dos repositorios: Car (lo principal) y Dealership (para la regla 4).
  // Ambos están en forFeature([Car, Dealership]) de cars.module.ts.
  constructor(
    @InjectRepository(Car)
    private readonly carRepo: Repository<Car>,
    @InjectRepository(Dealership)
    private readonly dealershipRepo: Repository<Dealership>,
  ) {}

  // GET /cars?status=&dealershipId=
  // Filtros opcionales: el "where" se arma solo con los que llegaron. Sin filtros → todos.
  async findAll(filters?: FilterCarsDto): Promise<Car[]> {
    const where: FindOptionsWhere<Car> = {};

    if (filters?.status) {
      where.status = filters.status;
    }
    if (filters?.dealershipId) {
      where.dealershipId = filters.dealershipId; // usa la columna FK numérica de la entidad
    }

    return await this.carRepo.find({ where, order: { id: 'ASC' } });
  }

  // Regla 1 → 404. relations: { dealership: true } porque el enunciado pide
  // "obtiene un carro por su id, incluyendo los datos de su concesionario".
  // Se reutiliza en create (respuesta), updateStatus y remove.
  async findOne(id: number): Promise<Car> {
    const car = await this.carRepo.findOne({
      where: { id },
      relations: { dealership: true },
    });

    if (!car) {
      throw new NotFoundException(`El carro con id ${id} no existe`);
    }

    return car;
  }

  async create(dto: CreateCarDto): Promise<Car> {
    // Regla 2 → 409: plate es UNIQUE. Se revisa antes de guardar para dar 409 y no un 500 de Postgres.
    if (await this.carRepo.findOne({ where: { plate: dto.plate } })) {
      throw new ConflictException(`Ya existe un carro con la placa '${dto.plate}'`);
    }

    // Regla 4 → 404 / 400: el concesionario indicado debe existir y estar activo.
    const dealership = await this.dealershipRepo.findOneBy({ id: dto.dealership_id });
    if (!dealership) {
      throw new NotFoundException(`El concesionario con id ${dto.dealership_id} no existe`);
    }
    if (!dealership.active) {
      throw new BadRequestException(
        `El concesionario con id ${dto.dealership_id} no está activo`,
      );
    }

    // El DTO trae dealership_id (nombre del enunciado); la entidad lo llama dealershipId.
    // Si no se envía status → AVAILABLE (lo pide el enunciado).
    const car = await this.carRepo.save(
      this.carRepo.create({
        plate: dto.plate,
        brand: dto.brand,
        model: dto.model,
        year: dto.year,
        price: dto.price,
        status: dto.status ?? CarStatus.AVAILABLE,
        dealershipId: dto.dealership_id,
      }),
    );

    return this.findOne(car.id); // se devuelve con su concesionario cargado
  }

  // PATCH /cars/:id/status: cambia SOLO el status (por eso el DTO tiene un único campo).
  async updateStatus(id: number, dto: UpdateCarStatusDto): Promise<Car> {
    const car = await this.findOne(id); // Regla 1 → 404

    // Regla 5 → 400: un carro vendido ya no cambia de estado (400 = regla de negocio incumplida).
    if (car.status === CarStatus.SOLD) {
      throw new BadRequestException('Un carro en estado SOLD no puede cambiar de estado');
    }

    car.status = dto.status;
    return await this.carRepo.save(car);
  }

  async remove(id: number): Promise<{ message: string }> {
    const car = await this.findOne(id); // Regla 1 → 404
    await this.carRepo.remove(car);
    return { message: `Carro con placa '${car.plate}' eliminado correctamente` };
  }
}
