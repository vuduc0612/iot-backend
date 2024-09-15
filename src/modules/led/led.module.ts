import { Module } from "@nestjs/common";

import { LedController } from "./led.controller";
import { LedService } from "./led.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Led } from "./entity/led.entity";
import { LedLog } from "../ledLog/entity/ledLog.entity";
import { MqttModule } from "../mqtt/mqtt.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([Led, LedLog]),
        MqttModule
    ],
    controllers: [LedController],
    providers: [LedService],
})
export class LedModule { }