import { Controller, Delete, Get, Query } from "@nestjs/common";
import { SensorService } from "./sensor.service";
import { PaginationDto } from './dto/pagination.dto';
import { Sensor } from "./entity/sensor.entity";
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

@ApiTags('sensor')
@Controller('api/sensor')
export class SensorController {
    constructor(private readonly sensorService: SensorService) { }

    @Get('data')
    @ApiOperation({ summary: 'Get sensor data' })
    @ApiQuery({ name: 'sortKey', required: false, description: 'Key to sort by' })
    @ApiQuery({ name: 'order', required: false, enum: ['asc', 'desc'], description: 'Order of sorting' })
    @ApiQuery({ name: 'page', required: false, description: 'Page number for pagination' })
    @ApiQuery({ name: 'limit', required: false, description: 'Limit of items per page' })
    @ApiQuery({ name: 'searchQuery', required: false, description: 'Search query' })
    @ApiQuery({ name: 'selectedSearchType', required: false, description: 'Type of search' })
    @ApiResponse({ status: 200, description: 'Successful retrieval of sensor data', type: [Sensor] })
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
    @ApiOperation({ summary: 'Delete all sensor data' })
    @ApiResponse({ status: 200, description: 'All sensor data has been deleted' })
    async deleteAllSensorData(): Promise<void> {
        return this.sensorService.deleteAllSensorData();
    }

    @Delete('data/top')
    @ApiOperation({ summary: 'Delete top 100 sensor data' })
    @ApiResponse({ status: 200, description: 'Top 100 sensor data entries have been deleted' })
    async deleteTop100SensorData(): Promise<void> {
        return this.sensorService.deleteTopNSensorData(100);
    }

    // @Get('data/latest')
    // async getLatestSensorData(): Promise<Sensor> {
    //     return this.sensorService.listenToMqttMessages();
    // }
}