import { Test, TestingModule } from '@nestjs/testing';
import { DealershipsController } from './dealerships.controller.js';
import { DealershipsService } from './dealerships.service.js';

describe('DealershipsController', () => {
  let controller: DealershipsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DealershipsController],
      // El servicio real necesita repositorios; para probar solo el controlador basta un objeto vacío.
      providers: [{ provide: DealershipsService, useValue: {} }],
    }).compile();

    controller = module.get<DealershipsController>(DealershipsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
