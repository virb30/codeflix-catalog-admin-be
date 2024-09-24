import { CastMemberModel } from '../cast-member.model';
import { Uuid } from '../../../../../shared/domain/value-objects/uuid.vo';
import { CastMemberModelMapper } from '../cast-member-model-mapper';
import { EntityValidationError } from '../../../../../shared/domain/validators/validation.error';
import { CastMember } from '../../../../domain/cast-member.entity';
import { setupSequelize } from '../../../../../shared/infra/testing/helpers';
import {
  CastMemberType,
  CastMemberTypes,
  InvalidCastMemberTypeError,
} from 'src/core/cast-member/domain/cast-member-type.vo';

describe('CastMemberModelMapper Integration Tests', () => {
  setupSequelize({ models: [CastMemberModel] });

  test('should throws error when cast member is invalid', () => {
    expect.assertions(2);
    const cast_member_id = new Uuid();
    const model = CastMemberModel.build({
      cast_member_id: cast_member_id.id,
      name: 'a'.repeat(256),
      type: CastMemberTypes.DIRECTOR,
    });
    try {
      CastMemberModelMapper.toEntity(model);
      fail(
        'The cast member is invalid, but it needs to throw EntityValidationError',
      );
    } catch (e) {
      expect(e).toBeInstanceOf(EntityValidationError);
      expect((e as EntityValidationError).error).toMatchObject([
        {
          name: ['name must be shorter than or equal to 255 characters'],
        },
      ]);
    }
  });

  test('should throws error when cast member is invalid', () => {
    expect.assertions(1);
    const cast_member_id = new Uuid();
    const model = CastMemberModel.build({
      cast_member_id: cast_member_id.id,
      name: 'a'.repeat(256),
      type: 3,
    });
    try {
      CastMemberModelMapper.toEntity(model);
      fail(
        'The cast member type is invalid, but it needs to throw InvalidCastMemberTypeError',
      );
    } catch (e) {
      expect(e).toBeInstanceOf(InvalidCastMemberTypeError);
    }
  });

  test('should convert a cast member model to a cast member entity', () => {
    const created_at = new Date();
    const cast_member_id = new Uuid();
    const model = CastMemberModel.build({
      cast_member_id: cast_member_id.id,
      name: 'some name',
      type: CastMemberTypes.ACTOR,
      created_at,
    });
    const entity = CastMemberModelMapper.toEntity(model);
    expect(entity.toJSON()).toStrictEqual(
      new CastMember({
        cast_member_id,
        name: 'some name',
        type: CastMemberType.createAnActor(),
        created_at,
      }).toJSON(),
    );
  });

  test('should convert a cast member entity to a cast member model', () => {
    const created_at = new Date();
    const cast_member_id = new Uuid();
    const entity = new CastMember({
      cast_member_id,
      name: 'some name',
      type: CastMemberType.createADirector(),
      created_at,
    });
    const model = CastMemberModelMapper.toModel(entity);
    expect(model.toJSON()).toStrictEqual(
      CastMemberModel.build({
        cast_member_id: cast_member_id.id,
        name: 'some name',
        type: CastMemberTypes.DIRECTOR,
        created_at,
      }).toJSON(),
    );
  });
});
