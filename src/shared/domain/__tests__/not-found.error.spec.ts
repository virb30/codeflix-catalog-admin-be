import { Entity } from "../entity";
import { NotFoundError } from "../errors/not-found.error";
import { ValueObject } from "../value-object";
import { Uuid } from "../value-objects/uuid.vo";

class TestEntity extends Entity {
    private _id: Uuid;
    constructor(props: { id: Uuid }) {
        super();
        this._id = props.id ?? new Uuid();
    }

    get entity_id(): ValueObject {
        return this._id;
    }

    toJSON() {
        return {
            id: this._id
        };
    }
};

describe("NotFoundError Unit tests", () => {

    test("should return message", () => {
        const entityId = new Uuid();
        let error = new NotFoundError(entityId, TestEntity);
        expect(error.message).toBe(`TestEntity Not Found using ID ${entityId}`);
        
        error = new NotFoundError([entityId, entityId], TestEntity);
        expect(error.message).toBe(`TestEntity Not Found using ID ${entityId}, ${entityId}`);
    });

});