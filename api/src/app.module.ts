import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ConfigModule } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DealershipsModule } from './dealerships/dealerships.module.js';
import { CarsModule } from './cars/cars.module.js';


@Module({
  imports: [ConfigModule.forRoot({
    isGlobal:true,
    envFilePath: '.env',
  }),
TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: Number(config.get('DB_PORT')),
        username: config.get('DB_USER'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME'),
        autoLoadEntities: true,
        synchronize: false, 
      }),
    }),
CarsModule,
DealershipsModule,
],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
