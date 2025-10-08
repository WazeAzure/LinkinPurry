import { 
    Repository, 
    FindOptionsWhere, 
    FindOneOptions,
    DeepPartial,
    EntityTarget
  } from 'typeorm';
import { AppDataSource } from '../config/database.js';

export class BaseRepository<T> {
    protected repository: Repository<T>;
  
    constructor(entity: EntityTarget<T>) {
        this.repository = AppDataSource.getRepository(entity);
    }

    async findAll(options?: FindOneOptions<T>): Promise<T[]> {
        return this.repository.find(options);
    }

    async findById(id: string | number, options?: FindOneOptions<T>): Promise<T | null> {
        console.log("findbyId");
        console.log(id);
        return this.repository.findOne({ 
        ...options,
        where: { id } as FindOptionsWhere<T>
        });
    }

    async findOne(where: FindOptionsWhere<T>, options?: FindOneOptions<T>): Promise<T | null> {
        return this.repository.findOne({
        ...options,
        where
        });
    }

    async create(data: DeepPartial<T>): Promise<T> {
        const entity = this.repository.create(data);
        return this.repository.save(entity as any);
    }

    async update(id: string | number, data: DeepPartial<T>): Promise<T | null> {
        await this.repository.update(id, data as any);
        return this.findById(id);
    }

    async delete(id: string | number): Promise<boolean> {
        const result = await this.repository.delete(id);
        return result.affected ? result.affected > 0 : false;
    }

    async count(where?: FindOptionsWhere<T>): Promise<number> {
        return this.repository.count({ where });
    }
}