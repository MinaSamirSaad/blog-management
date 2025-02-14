import {
    UseInterceptors,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { plainToInstance } from 'class-transformer';

interface ClassConstructor {
    new(...args: any[]): {};
}

export function Serialize(dto: ClassConstructor) {
    return UseInterceptors(new SerializeInterceptor(dto));
}

export class SerializeInterceptor implements NestInterceptor {
    constructor(private dto: ClassConstructor) { }

    intercept(context: ExecutionContext, handler: CallHandler): Observable<any> {
        return handler.handle().pipe(
            map((data: any) => {
                try {
                    if (Array.isArray(data)) {
                        return data.map(item => plainToInstance(this.dto, item, {
                            excludeExtraneousValues: true,
                        }));
                    } else if (data && data.data && Array.isArray(data.data)) {
                        return {
                            ...data,
                            data: data.data.map(item => plainToInstance(this.dto, item, {
                                excludeExtraneousValues: true,
                            })),
                        };
                    } else {
                        return plainToInstance(this.dto, data, {
                            excludeExtraneousValues: true,
                        });
                    }
                } catch (error) {
                    console.error('Serialization error:', error);
                    throw new Error('Failed to serialize response data');
                }
            }),
        );
    }
}