import { Module } from "@nestjs/common";

import { LedLogService } from "./ledLog.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LedLog } from "./entity/ledLog.entity";

import { LedLogController } from "./ledLog.controller";

@Module({
    imports: [
        TypeOrmModule.forFeature([LedLog])
    ],
    controllers: [LedLogController],
    providers: [LedLogService]
})
export class LedLogModule { };