import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    JoinColumn,
    type Relation,
} from 'typeorm';
import { Dealership } from '../../dealerships/entities/dealership.entity.js';
import { CarStatus } from './car-status.enums.js';

@Entity("cars")
export class Car {

    @PrimaryGeneratedColumn()
    id: number;

    @Column ({length: 10, unique: true})
    plate: string;

    @Column({length: 50})
    brand: string;

    @Column({length: 50})
    model: string;

    @Column()
    year: number;

    @Column()
    price: number;

    // En la BD es VARCHAR + CHECK (no un ENUM de Postgres) → type: 'varchar'. default = si no se envía.
    @Column({type: "varchar", length: 20, default: CarStatus.AVAILABLE})
    status: CarStatus;

    // La FK como número: sirve para filtrar (?dealershipId=) y crear sin cargar el objeto padre.
    @Column({name: 'dealership_id'})
    dealershipId: number;





    @CreateDateColumn({name : 'created_at'})
    createdAt: Date;

    @UpdateDateColumn({name : 'updated_at'})
    updatedAt: Date;

    // Lado "muchos" (N carros → 1 concesionario). Este lado tiene la FK.
    // @JoinColumn dice qué columna guarda la FK (la misma dealership_id de arriba).
    @ManyToOne(() => Dealership, (dealership) => dealership.cars)
    @JoinColumn({name: 'dealership_id'})
    // Relation<> evita el error "Cannot access before initialization" (imports circulares en ES modules)
    dealership: Relation<Dealership>;
















}
