import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Car } from '../../cars/entities/car.entity.js'; 

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

    @CreateDateColumn({name : 'created_at'})
    createdAt: Date;

    @UpdateDateColumn({name : 'updated_at'})
    updatedAt: Date;

    @OneToMany(() => Car, (car) => car.dealership)
    cars: Car[];

}



