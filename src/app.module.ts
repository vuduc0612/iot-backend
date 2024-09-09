import { Module } from '@nestjs/common';
import { LedModule } from './modules/led/led.module';
import { SensorModule } from './modules/sensor/sensor.module';
import { DatabaseModule } from './base/database.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Led } from './modules/led/entity/led.entity';
import { Sensor } from './modules/sensor/entity/sensor.entity';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    LedModule,
    SensorModule,
    DatabaseModule,
    TypeOrmModule.forFeature([Led, Sensor]),
  ],
  
})
export class AppModule {}
