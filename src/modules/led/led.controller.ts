import { Controller, Get } from "@nestjs/common";
import { LedService } from "./led.service";


@Controller('api/led')
export class LedController {

    constructor( private readonly ledService: LedService,) {}
    @Get('on')
    async turnOn() {
        console.log('Led turned on');
        return this.ledService.turnOn();
    }

    @Get('off')
    async turnOff() {
        return this.ledService.turnOff();
    }
}