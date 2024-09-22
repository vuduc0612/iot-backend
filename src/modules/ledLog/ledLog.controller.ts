import { Controller, Get, Query } from "@nestjs/common";
import { LedLogService } from "./ledLog.service";
import { PaginationDto } from "../sensor/dto/pagination.dto";
import { LedLog } from "./entity/ledLog.entity";
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from "@nestjs/swagger";

@ApiTags('ledLog')
@Controller("api/led/log")
export class LedLogController {
    constructor(
        private ledLogService: LedLogService,
    ) {}

    @Get('')
    @ApiOperation({ summary: 'Get LED log data' })
    @ApiQuery({ name: 'sortKey', required: false, description: 'Key to sort by' })
    @ApiQuery({ name: 'order', required: false, enum: ['asc', 'desc'], description: 'Order of sorting' })
    @ApiQuery({ name: 'page', required: false, description: 'Page number for pagination' })
    @ApiQuery({ name: 'limit', required: false, description: 'Limit of items per page' })
    @ApiResponse({ status: 200, description: 'Successful retrieval of LED log data', type: [LedLog] })
    async getSensorData(
        @Query('sortKey') sortKey: string,
        @Query('order') order: 'asc' | 'desc' = 'asc',
        @Query() paginationDto: PaginationDto,
        @Query('searchQuery') searchQuery: string,
        @Query('selectedSearchType') selectedSearchType: string,
    ): Promise<{ data: LedLog[], totalPages: number }> {
        return this.ledLogService.getLogData(sortKey, order, paginationDto, searchQuery, selectedSearchType);
    }
}