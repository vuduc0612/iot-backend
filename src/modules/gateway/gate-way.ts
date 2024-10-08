import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { MqttService } from '../mqtt/mqtt.service';
import { SensorService } from '../sensor/sensor.service';
import { LedService } from '../led/led.service';
// Import MqttService

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },

})// Enable CORS for frontend access
export class EventsGateway {
  @WebSocketServer() server: Server;

  constructor(private mqttService: MqttService,
              private sensorService: SensorService,
              private ledService: LedService) {
      // Subscribe to MQTT topic and broadcast data to clients
      this.mqttService.subscribe('sensor/data_ducdz', (message) => {
        console.log('Received message:', message);
        this.server.emit('sensorData', message); // Send data to all connected clients
        console.log('save data');
        this.ledService.updateLedsStatuses(message); // Save data to database
        this.sensorService.saveSensorData(message); // Save data to database
      });
    }

    // Handle incoming WebSocket connections
    handleConnection() {
      console.log('Client connected');
    } 
    handleDisconnect() {
      console.log('Client disconnected');
    }
  }
