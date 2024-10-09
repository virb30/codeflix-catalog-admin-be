import { ValueObject } from './core/shared/domain/value-object';

declare global {
  namespace jest {
    interface Matchers<R> {
      // containsErrorMessages: (expected: FieldsError) => R;
      notificationContainsErrorMessages: (
        expected: Array<string | { [key: string]: string[] }>,
      ) => R;
      toBeValueObject: (expected: ValueObject) => R;
    }
  }
}
