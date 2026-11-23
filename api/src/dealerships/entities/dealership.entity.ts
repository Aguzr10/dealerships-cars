import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Car } from '../../cars/entities/car.entity.js'; 

// ENTIDAD = describe la tabla tal como existe en init.sql (synchronize: false, TypeORM no la cambia).
@Entity("dealerships")
export class Dealership {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({length: 100, unique: true})
    name: string;

    @Column({length: 100})
    city: string;

    @Column({default: true})
    active: boolean;

    // name: '...' = nombre real de la columna en la BD cuando difiere del nombre en TS.
    @CreateDateColumn({name : 'created_at'})
    createdAt: Date;

    @UpdateDateColumn({name : 'updated_at'})
    updatedAt: Date;

    // Lado "uno" de la relación (1 concesionario → N carros). NO crea columna; permite dealership.cars.
    // Su pareja es @ManyToOne en car.entity.ts (car.dealership).
    @OneToMany(() => Car, (car) => car.dealership)
    cars: Car[];

}



