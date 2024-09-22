import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Sensor } from './entity/sensor.entity';
import { Repository } from 'typeorm';
import { PaginationDto } from './dto/pagination.dto';
import { format } from 'date-fns';
import { parse, isValid, startOfDay, endOfDay, setHours, setMinutes, setSeconds } from 'date-fns';
@Injectable()
export class SensorService {
  constructor(
    @InjectRepository(Sensor)
    private sensorRepository: Repository<Sensor>,
    
  ) { }

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
      switch ((selectedSearchType as string).toLowerCase()) {
        case 'updatedat':
          const dateRegex = /\b\d{2}\/\d{2}\/\d{4}\b/; // DD/MM/YYYY
          const timeRegex = /\b\d{2}:\d{2}(?::\d{2})?\b/; // HH:mm or HH:mm:ss

          const hasDate = dateRegex.test(searchQuery as string);
          const hasTime = timeRegex.test(searchQuery as string);

          let searchDate = null;
          let searchTime = null;

          if (hasDate) {
            const datePart = (searchQuery as string).match(dateRegex)[0];
            searchDate = parse(datePart, 'dd/MM/yyyy', new Date());
            if (!isValid(searchDate)) {
              searchDate = null;
            }
          }

          if (hasTime) {
            const timeMatch = (searchQuery as string).match(timeRegex);
            searchTime = timeMatch ? timeMatch[0] : null;
          }

          if (searchDate && searchTime) {
            // Both date and time provided
            const timeParts = searchTime.split(':').map(Number);
            const hours = timeParts[0];
            const minutes = timeParts[1];
            const seconds = timeParts[2] || 0;

            const startDateTime = setSeconds(setMinutes(setHours(searchDate, hours), minutes), seconds);
            const endDateTime = new Date(startDateTime.getTime() + (seconds ? 1000 : 60000)); // 1 second or 1 minute range

            query.andWhere('sensor.updatedAt BETWEEN :startDateTime AND :endDateTime', {
              startDateTime,
              endDateTime,
            });
          } else if (searchDate) {
            // Only date provided
            const startDate = startOfDay(searchDate);
            const endDate = endOfDay(searchDate);

            query.andWhere('sensor.updatedAt BETWEEN :startDate AND :endDate', {
              startDate,
              endDate,
            });
          } else if (searchTime) {
            // Only time provided
            // Determine if seconds are included
            const timeParts = searchTime.split(':');
            let timePattern = '';

            if (timeParts.length === 3) {
              // Exact time match with seconds
              timePattern = searchTime + '%'; // Allows for exact second match
            } else if (timeParts.length === 2) {
              // Partial time match without seconds
              timePattern = searchTime + ':%'; // Matches any seconds
            }

            if (timePattern) {
              // PostgreSQL example
              query.andWhere("TO_CHAR(sensor.updatedAt, 'HH24:MI:SS') LIKE :searchTimePattern", {
                searchTimePattern: timePattern,
              });

              // For MySQL, use:
              // query.andWhere("TIME(sensor.updatedAt) LIKE :searchTimePattern", { searchTimePattern: timePattern });
            }
          } else {
            // Fallback to text search if format is incorrect
            query.andWhere('sensor.updatedAt::text LIKE :searchQuery', {
              searchQuery: `%${searchQuery}%`,
            });
          }
          break;

        // Handle other search types...
        default:
          query.andWhere(`CAST(sensor.${selectedSearchType} AS TEXT) LIKE :searchQuery`, {
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