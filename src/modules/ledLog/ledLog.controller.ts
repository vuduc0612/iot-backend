import { Controller, Get, Query} from "@nestjs/common";
import { LedLogService } from "./ledLog.service";
import { PaginationDto } from "../sensor/dto/pagination.dto";
import { LedLog } from "./entity/ledLog.entity";

@Controller("api/led/log")
export class LedLogController{
    constructor(
        private ledLogService: LedLogService,
    ){}

    @Get('')
    async getSensorData(
        @Query('sortKey') sortKey: string,
        @Query('order') order: 'asc' | 'desc' = 'asc',
        @Query() paginationDto: PaginationDto
    ): Promise<{ data: LedLog[], totalPages: number }> {
        return this.ledLogService.getLogData(sortKey, order, paginationDto);
    }
}