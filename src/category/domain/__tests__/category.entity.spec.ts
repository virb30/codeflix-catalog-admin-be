import { Category } from "../category.entity";

describe("Category Unit Tests", () => {

    describe("constructor", () => {

        test("should create a category with default values", () => {
            const category = new Category({
                name: "Movie"
            });
    
            expect(category.category_id).toBeUndefined();
            expect(category.name).toBe("Movie");
            expect(category.description).toBeNull();
            expect(category.is_active).toBeTruthy();
            expect(category.created_at).toBeInstanceOf(Date);
        });

        test("should create a category with all values", () => {
            const created_at = new Date();
            const category = new Category({
                name: "Movie",
                description: "Movie description",
                is_active: false,
                created_at
            });
    
            expect(category.category_id).toBeUndefined();
            expect(category.name).toBe("Movie");
            expect(category.description).toBe("Movie description");
            expect(category.is_active).toBeFalsy();
            expect(category.created_at).toBe(created_at);
        });
    });



    describe("create command", () => {
        test("should create a category", () => {
            const category = Category.create({
                name: "Movie",
            });
            expect(category.category_id).toBeUndefined();
            expect(category.name).toBe("Movie");
            expect(category.description).toBeNull();
            expect(category.is_active).toBeTruthy();
            expect(category.created_at).toBeInstanceOf(Date);
        });

        test("should create a category with description", () => {
            const category = Category.create({
                name: "Movie",
                description: "Movie Description"
            });
            expect(category.category_id).toBeUndefined();
            expect(category.name).toBe("Movie");
            expect(category.description).toBe("Movie Description");
            expect(category.is_active).toBeTruthy();
            expect(category.created_at).toBeInstanceOf(Date);
        });

        test("should create a category with is_active", () => {
            const category = Category.create({
                name: "Movie",
                is_active: false
            });
            expect(category.category_id).toBeUndefined();
            expect(category.name).toBe("Movie");
            expect(category.description).toBeNull();
            expect(category.is_active).toBeFalsy();
            expect(category.created_at).toBeInstanceOf(Date);
        });
    });


    test("should change name", () => {
        const category = new Category({
            name: "Movie"
        });
        category.changeName("other name");
        expect(category.name).toBe("other name");
    });

    test("should change description", () => {
        const category = new Category({
            name: "Movie",
        });
        category.changeDescription("some description");
        expect(category.description).toBe("some description");
    });

    test("should activate a category", () => {
        const category = new Category({
            name: "Movie",
            is_active: false
        });
        category.activate();
        expect(category.is_active).toBeTruthy();
    });

    test("should deactivate a category", () => {
        const category = new Category({
            name: "Movie",
        });
        category.deactivate();
        expect(category.is_active).toBeFalsy();
    });
});