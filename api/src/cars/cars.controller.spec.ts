import { Test, TestingModule } from '@nestjs/testing';
import { CarsController } from './cars.controller.js';
import { CarsService } from './cars.service.js';

describe('CarsController', () => {
  let controller: CarsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CarsController],
      // El servicio real necesita repositorios; para probar solo el controlador basta un objeto vacío.
      providers: [{ provide: CarsService, useValue: {} }],
    }).compile();

    controller = module.get<CarsController>(CarsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
