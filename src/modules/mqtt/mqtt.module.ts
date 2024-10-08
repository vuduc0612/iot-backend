import { Module} from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { MqttService } from './mqtt.service';
import { SensorModule } from '../sensor/sensor.module';


@Module({
    imports: [
        ClientsModule.register([
            {
                name: 'MQTT_SERVICE', // Tên của service
                transport: Transport.MQTT,
                options: {
                    url: 'mqtt://broker.emqx.io:1883',
                    username: 'huuduc',  // Nếu cần
                    password: 'xyz123@1206',     // Nếu cần
                },
            },
        ]),
        SensorModule,
    ], 
    
    providers: [MqttService],
    exports: [MqttService],
})
export class MqttModule {
   
}
