import { IUseCase } from "../../shared/application/use-case.interface";
import { Category } from "../domain/category.entity";
import { ICategoryRepository } from "../domain/category.repository";

export class CreateCategoryUseCase 
    implements IUseCase<CreateCategoryInput, CreateCategoryOutput> 
{
    constructor(private readonly categoryRepo: ICategoryRepository) {}

    async execute(input: CreateCategoryInput): Promise<CreateCategoryOutput> {
        const category = Category.create(input);
        await this.categoryRepo.insert(category);
        return {
            id: category.category_id.id,
            name: category.name,
            description: category.description,
            is_active: category.is_active,
            created_at: category.created_at,
        }
    }
}

export type CreateCategoryInput = {
    name: string;
    description?: string | null;
    is_active?: boolean;
}

export type CreateCategoryOutput = {
    id: string;
    name: string;
    description?: string | null;
    is_active?: boolean;
    created_at: Date;
}