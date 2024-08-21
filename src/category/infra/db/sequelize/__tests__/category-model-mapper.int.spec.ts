import { Sequelize } from "sequelize-typescript";
import { CategoryModel } from "../category.model";
import { Uuid } from "../../../../../shared/domain/value-objects/uuid.vo";
import { CategoryModelMapper } from "../category-model-mapper";
import { EntityValidationError } from "../../../../../shared/domain/validators/validation.error";
import { Category } from "../../../../domain/category.entity";

describe("CategoryModelMapper Integration Tests", () => {

    let sequelize;

    beforeEach(async () => {
        sequelize = new Sequelize({
            dialect: "sqlite",
            storage: ":memory:",
            models: [CategoryModel],
            logging: false
        });
        await sequelize.sync({ force: true });
    });

    test("should throws error when category is invalid", () => {
        const category_id = new Uuid();
        const model = CategoryModel.build({
            category_id: category_id.id,
        });
        try {
            CategoryModelMapper.toEntity(model);
            fail("The category is invalid, but it needs to throw EntityValidationError")
        } catch(e) {
            expect(e).toBeInstanceOf(EntityValidationError);
            expect((e as EntityValidationError).errors).toMatchObject({
                name: [
                    "name should not be empty",
                    "name must be a string",
                    "name must be shorter than or equal to 255 characters"
                ]
            });
        }
    });

    test("should convert a category model to a category entity", () => {
        const created_at = new Date();
        const category_id = new Uuid();
        const model = CategoryModel.build({
            category_id: category_id.id,
            name: "some name",
            description: "some description",
            is_active: true,
            created_at
        });
        const entity = CategoryModelMapper.toEntity(model);
        expect(entity.toJSON()).toStrictEqual(
            new Category({
                category_id,
                name: "some name",
                description: "some description",
                is_active: true,
                created_at
            }).toJSON()
        )
    });

    test("should convert a category entity to a category model", () => {
        const created_at = new Date();
        const category_id = new Uuid();
        const entity = new Category({
            category_id,
            name: "some name",
            description: "some description",
            is_active: true,
            created_at
        })
        const model = CategoryModelMapper.toModel(entity);
        expect(model.toJSON()).toStrictEqual(
            CategoryModel.build({
                category_id: category_id.id,
                name: "some name",
                description: "some description",
                is_active: true,
                created_at
            }).toJSON()
        )
    });
});