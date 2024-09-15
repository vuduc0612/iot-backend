import { Module } from '@nestjs/common';
import { LedModule } from './modules/led/led.module';
import { SensorModule } from './modules/sensor/sensor.module';
import { DatabaseModule } from './base/database.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Led } from './modules/led/entity/led.entity';
import { Sensor } from './modules/sensor/entity/sensor.entity';
import { ConfigModule } from '@nestjs/config';
import { LedLog } from './modules/ledLog/entity/ledLog.entity';
import { LedLogModule } from './modules/ledLog/ledLog.module';
import { MqttModule } from './modules/mqtt/mqtt.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MqttModule,
    LedModule,
    SensorModule,
    DatabaseModule,
    LedLogModule,
    TypeOrmModule.forFeature([Led, Sensor, LedLog]),
  ],
  
})
export class AppModule {}
