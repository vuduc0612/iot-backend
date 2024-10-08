import { SensorController } from "./sensor.controller";
import { SensorService } from "./sensor.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Sensor } from "./entity/sensor.entity";
import { MqttModule } from "../mqtt/mqtt.module";
import { forwardRef, Module } from '@nestjs/common';
import { EventsGateway } from "../gateway/gate-way";
import { LedModule } from "../led/led.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([Sensor]),
        forwardRef(() => MqttModule),
        forwardRef(() => LedModule)
    ],
    controllers: [SensorController],
    providers: [SensorService, EventsGateway],
    exports: [SensorService]
})
export class SensorModule { }