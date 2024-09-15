import { Controller, Post, Query } from "@nestjs/common";
import { LedService } from "./led.service";


@Controller('api/led')
export class LedController {

    constructor( private readonly ledService: LedService,) {}
    @Post('on')
    async turnOn(@Query('id') id: number): Promise<boolean> {
        return this.ledService.turnOn(id);
    }

    @Post('off')
    async turnOff(@Query('id') id: number): Promise<boolean> {
        return this.ledService.turnOff(id);
    }
}