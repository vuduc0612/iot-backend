import { Injectable, Logger } from '@nestjs/common';
import * as mqtt from 'mqtt'; // Import mqtt library
import { EventsGateway } from '../gateway/gate-way';

@Injectable()
export class MqttService {
  private logger = new Logger('MqttService');
  private client: mqtt.MqttClient;
  private eventsGateway: EventsGateway;

  constructor() {
    this.connectToMqttBroker();
  }

  // Kết nối tới MQTT Broker
  private connectToMqttBroker() {
    this.client = mqtt.connect('mqtt://broker.emqx.io:1883', {
      username: 'huuduc',
      password: '123',
    });

    this.client.on('connect', () => {
      this.logger.log('Connected to MQTT broker');
    });

    this.client.on('error', (error) => {
      this.logger.error('MQTT connection error:', error);
    });
    
    // this.client.on('message', (topic, message) => {
    //   if (topic === 'sensor/data') {
    //   const parsedMessage = message.toString();
    //   console.log('Received MQTT message:', parsedMessage);
    //   // Emit the data to WebSocket clients
    //   //this.eventsGateway.server.emit('sensorData', parsedMessage);
    //   }
    // });

    
  }
  publish(topic: string, message: string) {
    this.client.publish(topic, message, {}, (error) => {
      if (error) {
        console.error('Publish failed', error);
      }
    });
  }

  subscribe(topic: string, callback: (message: any) => void) {
    this.client.subscribe(topic, (err) => {
      if (err) {
        this.logger.error(`Failed to subscribe to topic: ${topic}`, err);
      } else {
        this.logger.log(`Subscribed to topic: ${topic}`);
      }
    });

    this.client.on('message', (receivedTopic: string, message: Buffer) => {
      if (receivedTopic === topic) {
        const parsedMessage = message.toString();
        callback(parsedMessage);
      }
    });
  }
}
