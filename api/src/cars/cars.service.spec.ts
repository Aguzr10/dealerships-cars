import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { CarsService } from './cars.service.js';
import { Car } from './entities/car.entity.js';
import { CarStatus } from './entities/car-status.enums.js';
import { Dealership } from '../dealerships/entities/dealership.entity.js';
import { CreateCarDto } from './dto/create-car.dto.js';

// PRUEBAS UNITARIAS del servicio: SIN base de datos.
// Los repositorios se reemplazan por objetos "mock" cuyas funciones son vi.fn() (Vitest; en Jest sería jest.fn()).
// En cada prueba se decide qué "devuelve la base" con mockResolvedValue y se revisa la respuesta del servicio.
describe('CarsService', () => {
  let service: CarsService;

  // Solo los métodos del repositorio que usa el servicio.
  const carRepo = {
    find: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
    save: vi.fn(),
    remove: vi.fn(),
  };
  const dealershipRepo = {
    findOneBy: vi.fn(),
  };

  // Body válido para crear un carro (la regla 3 ya la cubre el DTO, aquí no se prueba).
  const dto: CreateCarDto = {
    plate: 'ABC123',
    brand: 'Toyota',
    model: 'Corolla',
    year: 2020,
    price: 80000000,
    dealership_id: 1,
  };

  beforeEach(async () => {
    vi.clearAllMocks(); // que una prueba no herede lo configurado en otra

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CarsService,
        // getRepositoryToken(Entidad) = la "llave" que usa @InjectRepository(Entidad).
        // Así Nest le inyecta el mock en vez del repositorio real.
        { provide: getRepositoryToken(Car), useValue: carRepo },
        { provide: getRepositoryToken(Dealership), useValue: dealershipRepo },
      ],
    }).compile();

    service = module.get<CarsService>(CarsService);
  });

  // ---------- Caso exitoso (lo pide el enunciado) ----------
  it('crea un carro en un concesionario activo (queda AVAILABLE si no se envía status)', async () => {
    const saved = { id: 10, ...dto, dealershipId: 1, status: CarStatus.AVAILABLE };
    carRepo.findOne
      .mockResolvedValueOnce(null) // 1.ª llamada: no hay otro carro con esa placa
      .mockResolvedValueOnce({ ...saved, dealership: { id: 1 } }); // 2.ª: findOne(id) del final
    dealershipRepo.findOneBy.mockResolvedValue({ id: 1, active: true });
    carRepo.create.mockImplementation((data) => data);
    carRepo.save.mockResolvedValue(saved);

    const result = await service.create(dto);

    expect(carRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ dealershipId: 1, status: CarStatus.AVAILABLE }),
    );
    expect(result.id).toBe(10);
    expect(result.status).toBe(CarStatus.AVAILABLE);
  });

  // ---------- Regla 4 ----------
  it('regla 4: 404 si el concesionario no existe', async () => {
    carRepo.findOne.mockResolvedValue(null);
    dealershipRepo.findOneBy.mockResolvedValue(null);

    await expect(service.create(dto)).rejects.toThrow(NotFoundException);
    expect(carRepo.save).not.toHaveBeenCalled(); // no debe guardar nada
  });

  it('regla 4: 400 si el concesionario está inactivo', async () => {
    carRepo.findOne.mockResolvedValue(null);
    dealershipRepo.findOneBy.mockResolvedValue({ id: 1, active: false });

    await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    expect(carRepo.save).not.toHaveBeenCalled();
  });

  // ---------- Regla 2 ----------
  it('regla 2: 409 si la placa ya existe', async () => {
    carRepo.findOne.mockResolvedValue({ id: 3, plate: 'ABC123' });

    await expect(service.create(dto)).rejects.toThrow(ConflictException);
  });

  // ---------- Regla 5 ----------
  it('regla 5: 400 si el carro está SOLD y se intenta cambiar su estado', async () => {
    carRepo.findOne.mockResolvedValue({ id: 1, status: CarStatus.SOLD });

    await expect(
      service.updateStatus(1, { status: CarStatus.AVAILABLE }),
    ).rejects.toThrow(BadRequestException);
    expect(carRepo.save).not.toHaveBeenCalled();
  });

  it('cambia el estado si el carro no está SOLD', async () => {
    carRepo.findOne.mockResolvedValue({ id: 1, status: CarStatus.AVAILABLE });
    carRepo.save.mockImplementation(async (car) => car);

    const result = await service.updateStatus(1, { status: CarStatus.RESERVED });

    expect(result.status).toBe(CarStatus.RESERVED);
  });

  // ---------- Regla 1 ----------
  it('regla 1: 404 si el carro no existe', async () => {
    carRepo.findOne.mockResolvedValue(null);

    await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
  });
});
