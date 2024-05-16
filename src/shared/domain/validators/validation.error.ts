import { FieldsError } from "./validator-fields.interface";

export class EntityValidationError extends Error {
    constructor(public errors: FieldsError, message = "Validation Error") {
        super(message);
    }

    count() {
        return Object.keys(this.errors).length;
    }
}