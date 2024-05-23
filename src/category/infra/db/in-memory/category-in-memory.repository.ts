import { Uuid } from "../../../../shared/domain/value-objects/uuid.vo";
import { InMemoryRepository } from "../../../../shared/infra/db/in-memory/in-memory.repository";
import { Category } from "../../../domain/category.entity";
import { ICategoryRepository } from "../../../domain/category.repository";


export class CategoryInMemoryRepository extends InMemoryRepository<Category, Uuid> implements ICategoryRepository {
    getEntity(): new (...args: any[]) => Category {
        return Category;
    }
}

