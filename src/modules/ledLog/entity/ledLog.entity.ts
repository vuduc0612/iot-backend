import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class LedLog {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    updatedAt: Date;

    @Column()
    status: boolean;
}