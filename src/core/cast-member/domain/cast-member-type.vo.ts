import { ValueObject } from 'src/core/shared/domain/value-object';

export enum CastMemberTypes {
  DIRECTOR = 1,
  ACTOR = 2,
}

export class CastMemberType extends ValueObject {
  constructor(readonly type: CastMemberTypes) {
    super();
    this.validate();
  }

  private validate() {
    const isValid = Object.values(CastMemberTypes).includes(this.type);
    if (!isValid) {
      throw new InvalidCastMemberTypeError(this.type);
    }
  }

  static create(value: CastMemberTypes): CastMemberType {
    return new CastMemberType(value);
  }

  static createAnActor() {
    return CastMemberType.create(CastMemberTypes.ACTOR);
  }

  static createADirector() {
    return CastMemberType.create(CastMemberTypes.DIRECTOR);
  }
}

export class InvalidCastMemberTypeError extends Error {
  constructor(invalidType: any) {
    super(`Invalid cast member type: ${invalidType}`);
    this.name = 'InvalidCastMemberTypeError';
  }
}
