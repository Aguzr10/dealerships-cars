import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { DealershipsService } from './dealerships.service.js';
import { Dealership } from './entities/dealership.entity.js';
import { Car } from '../cars/entities/car.entity.js';

// PRUEBAS UNITARIAS sin base de datos: los repositorios son mocks con vi.fn().
describe('DealershipsService', () => {
  let service: DealershipsService;

  const dealershipRepo = {
    find: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
    save: vi.fn(),
    remove: vi.fn(),
  };
  const carRepo = {}; // el servicio lo inyecta, pero estas pruebas no lo usan

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DealershipsService,
        { provide: getRepositoryToken(Dealership), useValue: dealershipRepo },
        { provide: getRepositoryToken(Car), useValue: carRepo },
      ],
    }).compile();

    service = module.get<DealershipsService>(DealershipsService);
  });

  // ---------- Regla 6 (lo pide el enunciado) ----------
  it('regla 6: 409 al eliminar un concesionario con carros asociados', async () => {
    // findOne carga relations: { cars: true }, así que el mock devuelve el concesionario con carros
    dealershipRepo.findOne.mockResolvedValue({ id: 1, name: 'Autos Norte', cars: [{ id: 5 }] });

    await expect(service.remove(1)).rejects.toThrow(ConflictException);
    expect(dealershipRepo.remove).not.toHaveBeenCalled(); // no debe borrar
  });

  it('elimina un concesionario sin carros', async () => {
    dealershipRepo.findOne.mockResolvedValue({ id: 2, name: 'Autos Sur', cars: [] });

    const result = await service.remove(2);

    expect(dealershipRepo.remove).toHaveBeenCalled();
    expect(result.message).toContain('Autos Sur');
  });

  // ---------- Regla 1 ----------
  it('regla 1: 404 si el concesionario no existe', async () => {
    dealershipRepo.findOne.mockResolvedValue(null);

    await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
  });

  // ---------- Regla 2 ----------
  it('regla 2: 409 si ya existe un concesionario con ese name', async () => {
    dealershipRepo.findOne.mockResolvedValue({ id: 1, name: 'Autos Norte' });

    await expect(
      service.create({ name: 'Autos Norte', city: 'Bogotá' }),
    ).rejects.toThrow(ConflictException);
  });
});
