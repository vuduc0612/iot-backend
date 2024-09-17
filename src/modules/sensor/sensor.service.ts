import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Sensor } from './entity/sensor.entity';
import { Repository } from 'typeorm';
import { PaginationDto } from './dto/pagination.dto';
import { format } from 'date-fns';

@Injectable()
export class SensorService {
  constructor(
    @InjectRepository(Sensor)
    private sensorRepository: Repository<Sensor>,
    
  ) {
    
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

  async saveSensorData(message: any): Promise<Sensor> {
    const parsedMessage = JSON.parse(message);
    const temperature = Math.round(parsedMessage.temperature);
    const humidity = Math.round(parsedMessage.humidity);
    const light = Math.round(parsedMessage.light);
    //console.log(`Temperature: ${temperature}°C, Humidity: ${humidity}%, Light: ${light}Lux`);
    const formattedDate = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
    const sensorData = this.sensorRepository.create({
      name: 'Sensor',
      temperature,
      humidity,
      light,
      updatedAt: formattedDate,
      status: true,
    });
    //console.log(sensorData);
    return this.sensorRepository.save(sensorData);
  }
  async deleteAllSensorData(): Promise<void> {
    await this.sensorRepository.clear();
    console.log('All sensor data has been deleted');
  }

  async deleteTopNSensorData(n: number): Promise<void> {
    const sensors = await this.sensorRepository.find({
      order: { updatedAt: 'ASC' },
      take: n,
    });
    await this.sensorRepository.remove(sensors);
    console.log(`${n} sensor data entries have been deleted`);
  }

}