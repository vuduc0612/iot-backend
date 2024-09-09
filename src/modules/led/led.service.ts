import { Injectable } from "@nestjs/common";

@Injectable()
export class LedService {
    constructor() {
        console.log('LedService created');
    }

    async turnOn() {
        return {
          'message' : 'Led turned on'
        };
    }
    async turnOff() {
        return {
            'message' : 'Led turned off'
          };
    }
}