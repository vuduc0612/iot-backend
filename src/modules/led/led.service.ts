import { Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
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
            this.mqttService.publish('led_state_ducdz', `{led_id: ${id}, status: 'ON'}`);

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
            this.mqttService.publish('led_state_ducdz', `{led_id: ${id}, status: 'OFF'}`);

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
    async getAllStatusLeds(): Promise<{ id: number; status: boolean }[]> {
        try {
            const leds = await this.ledRepository.find();

            if (!leds || leds.length === 0) {
                throw new NotFoundException('No LEDs found');
            }
            //console.log(leds);
            const ledStatuses = leds.map(led => ({
                id: led.id,
                status: led.status,
            }));
            const ledStatusesJson = JSON.stringify(ledStatuses);
            //console.log(ledStatuses);
            // Pub
            this.mqttService.publish('recieve/led-status_ducdz', ledStatusesJson);
            //console.log(ledStatuses)
            //console.log('Published LED statuses to MQTT');
            return ledStatuses;
        } catch (error) {
            console.error(error);
            throw new InternalServerErrorException("Error retrieving LED statuses");
        }
    }
    async updateLedsStatuses(message: any): Promise<void> {
        try {
            let parsedMessage = message;
            if (typeof message === 'string') {
                parsedMessage = JSON.parse(message);
            } else if (typeof message !== 'object' || message === null) {
                console.error('Invalid message format:', message);
                return;
            }
    
            const ledStatus1 = parsedMessage.stled1;
            const ledStatus2 = parsedMessage.stled2;
            const ledStatus3 = parsedMessage.stled3;
    
            if (ledStatus1 === undefined || ledStatus2 === undefined || ledStatus3 === undefined) {
                console.error('Missing LED status in message:', parsedMessage);
                return;
            }
    
            const ledStatuses = [
                { 'id': 1, 'status': ledStatus1 },
                { 'id': 2, 'status': ledStatus2 },
                { 'id': 3, 'status': ledStatus3 }
            ];
    
            for (const ledStatus of ledStatuses) {
                const led = await this.ledRepository.findOne({ where: { id: ledStatus.id } });
                if (led) {
                    led.status = ledStatus.status;
                    led.updatedAt = new Date();
                    console.log(`Updating LED ${led.id} status to ${led.status}`);
                    await this.ledRepository.save(led);
                } else {
                    console.warn(`LED with id ${ledStatus.id} not found`);
                }
            }
        } catch (error) {
            console.error('Error updating LED statuses:', error);
        }
    }

    waitForMqttResponse(id: number): Promise<any> {
        return new Promise((resolve) => {
            this.mqttService.subscribe(`response_status_ducdz`, (message) => {
                const parsedMessage = JSON.parse(message);
                //console.log(parsedMessage);

                if (parsedMessage.led_id == id) {
                    // console.log(`Received response for LED ${id}:`, parsedMessage);
                    resolve(parsedMessage);
                }
            });
        });
    }
}
