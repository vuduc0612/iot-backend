import { Controller, Delete, Get, Query } from "@nestjs/common";
import { SensorService } from "./sensor.service";
import { PaginationDto } from './dto/pagination.dto';
import { Sensor } from "./entity/sensor.entity";


@Controller('api/sensor')
export class SensorController {
    constructor(private readonly sensorService: SensorService
        
    ) { }

    @Get('data')
    async getSensorData(
        @Query('sortKey') sortKey: string,
        @Query('order') order: 'asc' | 'desc' = 'asc',
        @Query() paginationDto: PaginationDto,
        @Query('searchQuery') searchQuery: string,
        @Query('selectedSearchType') selectedSearchType: string,
    ): Promise<{ data: Sensor[], totalPages: number }> {
        return this.sensorService.getSensorData(sortKey, order, paginationDto, searchQuery, selectedSearchType);
    }
    @Delete('data')
    async deleteAllSensorData(): Promise<void> {
        return this.sensorService.deleteAllSensorData();
    }
    @Delete('data/top')
    async deleteTop100SensorData(): Promise<void> {
        return this.sensorService.deleteTopNSensorData(100);
    }

    // @Get('data/latest')
    // async getLatestSensorData(): Promise<Sensor> {
    //     return this.sensorService.listenToMqttMessages();
    // }
   
}
