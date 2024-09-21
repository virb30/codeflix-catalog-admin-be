import {
  CastMemberType,
  InvalidCastMemberTypeError,
} from '../cast-member-type.vo';

describe('CastMemberType Unit Tests', () => {
  test('should create a CastMemberType', () => {
    let castMemberType = new CastMemberType(1);
    expect(castMemberType).toBeInstanceOf(CastMemberType);

    castMemberType = new CastMemberType(2);
    expect(castMemberType).toBeInstanceOf(CastMemberType);
  });

  test('should throw InvalidCastMemberError if CastMemberType is invalid', () => {
    expect(() => new CastMemberType(3 as any)).toThrow(
      new InvalidCastMemberTypeError(3),
    );
  });
});
