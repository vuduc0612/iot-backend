import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Led {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    time: string;

    @Column()
    updateAt: Date;

    @Column()
    status: boolean;
}