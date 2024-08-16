import { Sequelize } from "sequelize-typescript";
import { CategoryModel } from "../category.model";
import { CategorySequelizeRepository } from "../category-sequelize.repository";
import { Category } from "../../../../domain/category.entity";
import { Uuid } from "../../../../../shared/domain/value-objects/uuid.vo";
import { NotFoundError } from "../../../../../shared/domain/errors/not-found.error";

describe("CategorySequelizeRepository Integration Test", () => {
    let sequelize;
    let repository: CategorySequelizeRepository;

    beforeEach(async () => {
        sequelize = new Sequelize({
            dialect: "sqlite",
            storage: ":memory:",
            models: [CategoryModel],
            logging: false
        });
        await sequelize.sync({ force: true });
        repository = new CategorySequelizeRepository(CategoryModel);
    });

    test("should insert a new category", async () => {
        const category = Category.fake().aCategory().build();
        await repository.insert(category);

        const model = await CategoryModel.findByPk(category.category_id.id);
        expect(model.toJSON()).toMatchObject({
            category_id: category.category_id.id,
            name: category.name,
            description: category.description,
            is_active: category.is_active,
            created_at: category.created_at,
        });
    });

    test("should find a category by id", async () => {
        let categoryFound = await repository.findById(new Uuid());
        expect(categoryFound).toBeNull();

        const category = Category.fake().aCategory().build();
        await repository.insert(category);
        categoryFound = await repository.findById(category.category_id);
        expect(category.toJSON()).toStrictEqual(categoryFound.toJSON());
    });

    test("should return all categories", async () => {
        const category = Category.fake().aCategory().build();
        await repository.insert(category);
        const categories = await repository.findAll();
        expect(categories).toHaveLength(1);
    });

    test("should throw error on update when category not found", async () => {
        const category = Category.fake().aCategory().build();
        await expect(repository.update(category)).rejects.toThrow(
            new NotFoundError(category.category_id.id, Category)
        );
    });

    test("should update a category", async () => {
        const category = Category.fake().aCategory().build();
        await repository.insert(category);

        category.changeName("Category updated");
        await repository.update(category);

        const categoryFound = await repository.findById(category.category_id);
        expect(category.toJSON()).toStrictEqual(categoryFound.toJSON());
    });

    test("should throw error on delete when a category not found", async () => {
        const categoryId = new Uuid();
        expect(repository.delete(categoryId)).rejects.toThrow(
            new NotFoundError(categoryId, Category)
        );
    });

    test("should delete a category", async () => {
        const category = Category.fake().aCategory().build();
        await repository.insert(category);

        await repository.delete(category.category_id);
        await expect(repository.findById(category.category_id)).resolves.toBeNull();
    });
});