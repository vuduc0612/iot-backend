import { Module} from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { MqttService } from './mqtt.service';
import { SensorModule } from '../sensor/sensor.module';
import { EventsGateway } from '../gateway/gate-way';

@Module({
    imports: [
        ClientsModule.register([
            {
                name: 'MQTT_SERVICE', // Tên của service
                transport: Transport.MQTT,
                options: {
                    url: 'mqtt://broker.emqx.io:1883',
                    username: 'huuduc',  // Nếu cần
                    password: '123',     // Nếu cần
                },
            },
        ]),
        SensorModule,
    ], 
    //controllers: [MqttController],
    providers: [MqttService, EventsGateway],
    exports: [MqttService],
})
export class MqttModule {
   
}
