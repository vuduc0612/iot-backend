import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { LedLog } from "./entity/ledLog.entity";
import { PaginationDto } from "../sensor/dto/pagination.dto";
import { Repository } from "typeorm";


@Injectable()
export class LedLogService{
    constructor(
        @InjectRepository(LedLog)
        private ledLogRepository: Repository<LedLog>,
    ){}

    async getLogData(
        sortKey: string,
        order: 'asc' | 'desc',
        paginationDto: PaginationDto
    ): Promise<{ data: LedLog[], totalPages: number }> {
        const { page = 1, limit = 10 } = paginationDto;
    
        // Tạo query builder từ ledLogRepository
        const query = this.ledLogRepository.createQueryBuilder('ledLog');
    
        // Nếu có sortKey thì sắp xếp theo cột đó
        if (sortKey) {
            console.log(sortKey);
            const orderBy = order === 'asc' ? 'ASC' : 'DESC';
            query.orderBy(`ledLog.${sortKey}`, orderBy);
        }
    
        // Áp dụng phân trang
        query.skip((page - 1) * limit).take(limit);
    
        // Đếm tổng số bản ghi
        const totalCount = await query.getCount();
    
        // Lấy dữ liệu
        const data = await query.getMany();
    
        // Tính tổng số trang
        const totalPages = Math.ceil(totalCount / limit);
    
        return { data, totalPages };
    }
    
}