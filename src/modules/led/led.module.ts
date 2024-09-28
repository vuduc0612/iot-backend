import { forwardRef, Module } from "@nestjs/common";

import { LedController } from "./led.controller";
import { LedService } from "./led.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Led } from "./entity/led.entity";
import { LedLog } from "../ledLog/entity/ledLog.entity";
import { MqttModule } from "../mqtt/mqtt.module";

import { SensorModule } from "../sensor/sensor.module";


@Module({
    imports: [
        TypeOrmModule.forFeature([Led, LedLog]),
        MqttModule,
        forwardRef(() => SensorModule)
    ],
    controllers: [LedController],
    providers: [LedService],
    exports: [LedService]
})
export class LedModule { }