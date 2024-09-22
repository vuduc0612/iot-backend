import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { LedLog } from "./entity/ledLog.entity";
import { PaginationDto } from "../sensor/dto/pagination.dto";
import { Repository } from "typeorm";
import { parse, endOfDay, isValid, setHours, setMinutes, setSeconds, startOfDay } from "date-fns";


@Injectable()
export class LedLogService {
    constructor(
        @InjectRepository(LedLog)
        private ledLogRepository: Repository<LedLog>,
    ) { }

    async getLogData(
        sortKey: string,
        order: 'asc' | 'desc',
        paginationDto: PaginationDto,
        searchQuery: string,
        selectedSearchType: string,
    ): Promise<{ data: LedLog[], totalPages: number }> {
        const { page = 1, limit = 12 } = paginationDto;

        const query = this.ledLogRepository.createQueryBuilder('ledLog');

        if (sortKey) {
            //console.log(sortKey);
            const orderBy = order === 'asc' ? 'ASC' : 'DESC';
            query.orderBy(`ledLog.${sortKey}`, orderBy);
        }

        if (searchQuery && selectedSearchType) {
            //cconsole.log(selectedSearchType);
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

                        query.andWhere('ledLog.updatedAt BETWEEN :startDateTime AND :endDateTime', {
                            startDateTime,
                            endDateTime,
                        });
                    } else if (searchDate) {
                        // Only date provided
                        const startDate = startOfDay(searchDate);
                        const endDate = endOfDay(searchDate);

                        query.andWhere('ledLog.updatedAt BETWEEN :startDate AND :endDate', {
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
                            query.andWhere("TO_CHAR(ledLog.updatedAt, 'HH24:MI:SS') LIKE :searchTimePattern", {
                                searchTimePattern: timePattern,
                            });
                        }
                    } else {
                        // Fallback to text search if format is incorrect
                        query.andWhere('ledLog.updatedAt::text LIKE :searchQuery', {
                            searchQuery: `%${searchQuery}%`,
                        });
                    }
                    break;

                case 'name':
                    const tmp = searchQuery.toLowerCase();
                    const newQuery = tmp.charAt(0).toUpperCase() + tmp.slice(1);
                    console.log(newQuery);
                    query.andWhere(`CAST(ledLog.${selectedSearchType} AS TEXT) LIKE :searchQuery`, {
                        searchQuery: `%${newQuery}%`,
                    });
                    break;
                default:
                    let status = null;
                    if(searchQuery.toLowerCase() === 'on'){
                        status = true;
                    }
                    else if(searchQuery.toLowerCase() === 'off'){
                        status = false;
                    }
                    console.log(status);
                    query.andWhere(`ledLog.${selectedSearchType} = :status`, {
                        status,
                    }); 
                    
            }
        }

        //phân trang
        query.skip((page - 1) * limit).take(limit);

        const totalCount = await query.getCount();
        const data = await query.getMany();
        const totalPages = Math.ceil(totalCount / limit);

        return { data, totalPages };
    }

}