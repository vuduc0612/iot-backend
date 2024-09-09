
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Sensor } from "./entity/sensor.entity";
import { Repository } from "typeorm";
import { PaginationDto } from './dto/pagination.dto';

@Injectable()
export class SensorService {
    constructor(
        @InjectRepository(Sensor)
        private sensorRepository: Repository<Sensor>,
    ) {}

    async getSensorData(
        sortKey: string,
        order: 'asc' | 'desc',
        paginationDto: PaginationDto
    ): Promise<{ data: Sensor[], totalPages: number }> {
        const { page = 1, limit = 10 } = paginationDto;
        const query = this.sensorRepository.createQueryBuilder('sensor');

        // Nếu có sortKey thì sắp xếp theo cột đó
        if (sortKey) {
            const orderBy = order === 'asc' ? 'ASC' : 'DESC';
            query.orderBy(`sensor.${sortKey}`, orderBy);
        }

        // Áp dụng phân trang
        query.skip((page - 1) * limit).take(limit);
        const totalCount = await query.getCount();

        // Lấy dữ liệu
        const data = await query.getMany();

        // Tính tổng số trang
        const totalPages = Math.ceil(totalCount / limit);

        return {data, totalPages};
    }

    async getLatestSensorData(): Promise<Sensor | undefined> {
        return await this.sensorRepository
          .createQueryBuilder('sensor')
          .orderBy('sensor.updatedAt', 'DESC')
          .getOne();
      }
}
