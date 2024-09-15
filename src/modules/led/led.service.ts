import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Led } from "./entity/led.entity";
import { Repository } from "typeorm";
import { LedLog } from "../ledLog/entity/ledLog.entity";
import { MqttService } from "../mqtt/mqtt.service";

@Injectable()
export class LedService {
    constructor(
        @InjectRepository(Led)
        private ledRepository: Repository<Led>,
        @InjectRepository(LedLog)
        private ledLogRepository: Repository<LedLog>,
        private readonly mqttService: MqttService,
    ) { }

    async turnOn(id: number): Promise<boolean> {
        try {
            const led = await this.ledRepository.findOne({ where: { id } });
            if (!led) {
                throw new NotFoundException(`LED with id ${id} not found`);
            }

            //Pub
            this.mqttService.publish('led_state', `{led_id: ${id}, status: 'ON'}`);

            //sub
            const mqttResponse = await this.waitForMqttResponse(id);

            if (mqttResponse.status === 'ON') {
                const newLedLog = new LedLog();
                newLedLog.name = led.name;
                newLedLog.status = true;
                newLedLog.updatedAt = new Date();

                led.status = true;
                led.updatedAt = new Date();
                await this.ledRepository.save(led);
                await this.ledLogRepository.save(newLedLog);

                console.log(`${led.name} is turned ON`);
                return true; // Trả về true nếu thành công
            } else {
                console.log(`Failed to turn OFF LED ${id}`);
                return false;
            }

        } catch (error) {
            console.error(error);
            return false; 
        }
    }

    async turnOff(id: number): Promise<boolean> {
        try {
            const led = await this.ledRepository.findOne({ where: { id } });
            if (!led) {
                throw new NotFoundException(`LED with id ${id} not found`);
            }

            // pub
            this.mqttService.publish('led_state', `{led_id: ${id}, status: 'OFF'}`);

            // sub
            const mqttResponse = await this.waitForMqttResponse(id);

            if (mqttResponse.status === 'OFF') {
                const newLedLog = new LedLog();
                newLedLog.name = led.name;
                newLedLog.status = false;
                newLedLog.updatedAt = new Date();

                led.status = false;
                led.updatedAt = new Date();
                await this.ledRepository.save(led);
                await this.ledLogRepository.save(newLedLog);

                console.log(`${led.name} is turned OFF`);
                return true; 
            } else {
                console.log(`Failed to turn OFF LED ${id}`);
                return false;
            }
        } catch (error) {
            console.error(error);
            return false; 
        }
    }

    waitForMqttResponse(id: number): Promise<any> {
        return new Promise((resolve) => {
            this.mqttService.subscribe(`response_status`, (message) => {
                const parsedMessage = JSON.parse(message);
                if (parsedMessage.led_id == id) {
                    console.log(`Received response for LED ${id}:`, parsedMessage);
                    resolve(parsedMessage);
                }
            });
        });
    }
}
