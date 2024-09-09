import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Sensor {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    temperature: number;

    @Column()
    humidity: number;

    @Column()
    light: number;
    
    @Column()
    updatedAt: Date;

    @Column()
    status: boolean;
}