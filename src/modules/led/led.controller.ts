import { Controller, Get, Post, Query } from '@nestjs/common';
import { LedService } from './led.service';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

@ApiTags('led')
@Controller('api/led')
export class LedController {
    constructor(private readonly ledService: LedService) {}

    @Post('on')
    @ApiOperation({ summary: 'Turn on the LED' })
    @ApiQuery({ name: 'id', required: true, description: 'ID of the LED to turn on' })
    @ApiResponse({ status: 200, description: 'The LED has been turned on', type: Boolean })
    async turnOn(@Query('id') id: number): Promise<boolean> {
        return this.ledService.turnOn(id);
    }

    @Post('off')
    @ApiOperation({ summary: 'Turn off the LED' })
    @ApiQuery({ name: 'id', required: true, description: 'ID of the LED to turn off' })
    @ApiResponse({ status: 200, description: 'The LED has been turned off', type: Boolean })
    async turnOff(@Query('id') id: number): Promise<boolean> {
        return this.ledService.turnOff(id);
    }

    @Get('status')
    @ApiOperation({ summary: 'Get status of all LEDs' })
    @ApiResponse({ status: 200, description: 'Status of all LEDs', type: [Object] })
    async getAllLedStatus() {
        return await this.ledService.getAllStatusLeds();
    }
}