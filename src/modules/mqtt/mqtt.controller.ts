import { Controller, OnModuleInit } from '@nestjs/common';
import { MqttService } from './mqtt.service';

import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { SensorService } from '../sensor/sensor.service';

@WebSocketGateway()
@Controller('mqtt')
export class MqttController implements OnModuleInit {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly mqttService: MqttService,
    private readonly sensorService: SensorService,
  ) {}

  // Khi module khởi tạo, đăng ký lắng nghe dữ liệu từ MQTT
  onModuleInit() {
    this.mqttService.subscribe('sensor/data', async (message) => {
      const data = JSON.parse(message);
      const { temperature, humidity, light } = data;

      // Lưu dữ liệu vào cơ sở dữ liệu
      await this.sensorService.saveSensorData(temperature, humidity, light);

      // Gửi dữ liệu qua WebSocket đến front-end
      this.server.emit('mqttData', data);
    });
  }
}
