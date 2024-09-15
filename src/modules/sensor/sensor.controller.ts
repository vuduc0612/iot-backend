import { Controller, Get, Query } from "@nestjs/common";
import { SensorService } from "./sensor.service";
import { PaginationDto } from './dto/pagination.dto';
import { Sensor } from "./entity/sensor.entity";
import { EventPattern } from "@nestjs/microservices";

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

    // @Get('data/latest')
    // async getLatestSensorData(): Promise<Sensor> {
    //     return this.sensorService.listenToMqttMessages();
    // }
    @EventPattern('esp8266/dht11')
    handleMqttMessage(data: any) {
        console.log('Received data:', data);
        // Xử lý và lưu dữ liệu vào cơ sở dữ liệu hoặc gửi đến frontend
    }
}
