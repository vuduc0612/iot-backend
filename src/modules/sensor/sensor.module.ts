import { Module } from "@nestjs/common";
import { SensorController } from "./sensor.controller";
import { SensorService } from "./sensor.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Sensor } from "./entity/sensor.entity";
import { MqttModule } from "../mqtt/mqtt.module";


@Module({
    imports: [
        TypeOrmModule.forFeature([Sensor]),
        MqttModule,
    ],
    controllers: [SensorController],
    providers: [SensorService],
})
export class SensorModule { }