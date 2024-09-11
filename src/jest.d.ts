import { FieldsError } from "./nest-modules/shared-module/domain/validators/validator-fields.interface";

declare global {
    namespace jest {
        interface Matchers<R> {
            // containsErrorMessages: (expected: FieldsError) => R;
            notificationContainsErrorMessages: (
                expected: Array<string | { [key: string]: string[] }>,
            ) => R;
        }
    }
}