import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Sensor } from './entity/sensor.entity';
import { Repository } from 'typeorm';
import { PaginationDto } from './dto/pagination.dto';
import { MqttService } from '../mqtt/mqtt.service'; // Import MqttService

@Injectable()
export class SensorService {
  constructor(
    @InjectRepository(Sensor)
    private sensorRepository: Repository<Sensor>,
    private readonly mqttService: MqttService, // Inject MqttService
    
  ) {
    this.listenToMqttMessages(); // Gọi hàm để lắng nghe dữ liệu MQTT
  }

  async getSensorData(
    sortKey: string,
    order: 'asc' | 'desc',
    paginationDto: PaginationDto,
    searchQuery: string,
    selectedSearchType: string,
  ): Promise<{ data: Sensor[], totalPages: number }> {
    const { page = 1, limit = 12 } = paginationDto;
    const query = this.sensorRepository.createQueryBuilder('sensor');
    
    // Sắp xếp và tìm kiếm
    if (sortKey) {
      const orderBy = order === 'asc' ? 'ASC' : 'DESC';
      query.orderBy(`sensor.${sortKey}`, orderBy);
    }

    if (searchQuery && selectedSearchType) {
      selectedSearchType = selectedSearchType.toLowerCase();
      if (['temperature', 'humidity', 'light'].includes(selectedSearchType)) {
        query.andWhere(`sensor.${selectedSearchType} = :searchQuery`, {
          searchQuery: searchQuery,
        });
      } else {
        query.andWhere(`sensor.${selectedSearchType} LIKE :searchQuery`, {
          searchQuery: `%${searchQuery}%`,
        });
      }
    }

    // Phân trang
    query.skip((page - 1) * limit).take(limit);
    const totalCount = await query.getCount();
    const data = await query.getMany();
    const totalPages = Math.ceil(totalCount / limit);

    return { data, totalPages };
  }

  async saveSensorData(temperature: number, humidity: number, light: number): Promise<Sensor> {
    const sensorData = this.sensorRepository.create({
      temperature,
      humidity,
      light,
    });
    return this.sensorRepository.save(sensorData);
  }
  


  private listenToMqttMessages() {
    this.mqttService.subscribe('esp8266/dht11_data', (message) => {
      // Xử lý dữ liệu nhận được từ MQTT
      const parsedMessage = JSON.parse(message);
      const { temperature, humidity } = parsedMessage;
      //this.saveSensorData(temperature, humidity);
      console.log(`Temperature: ${temperature}°C, Humidity: ${humidity}%`);
    });
  }
}