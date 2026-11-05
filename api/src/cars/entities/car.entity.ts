import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    JoinColumn,
} from 'typeorm';
import { Dealership } from '../../dealerships/entities/dealership.entity.js';
import { CarStatus } from './car-status.enums.js';

@Entity("cars")
export class Car {

    @PrimaryGeneratedColumn()
    id: number;

    @Column ({length: 100, unique: true})
    plate: string;

    @Column({length: 50})
    brand: string;

    @Column({length: 50})
    model: string;

    @Column()
    year: number;

    @Column()
    price: number;

    @Column({type: "varchar", length: 20, default: CarStatus.AVAILABLE})
    status: CarStatus;







    @CreateDateColumn({name : 'created_at'})
    createdAt: Date;

    @UpdateDateColumn({name : 'updated_at'})
    updatedAt: Date;

    @ManyToOne(() => Dealership, (dealership) => dealership.cars)
    @JoinColumn({name: 'dealership_id'})
    dealership: Dealership;
















}
