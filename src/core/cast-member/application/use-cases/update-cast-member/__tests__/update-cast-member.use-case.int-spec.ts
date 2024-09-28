import {
  CastMemberType,
  CastMemberTypes,
} from 'src/core/cast-member/domain/cast-member-type.vo';
import { NotFoundError } from '../../../../../shared/domain/errors/not-found.error';
import { setupSequelize } from '../../../../../shared/infra/testing/helpers';
import {
  CastMember,
  CastMemberId,
} from '../../../../domain/cast-member.aggregate';
import { CastMemberSequelizeRepository } from '../../../../infra/db/sequelize/cast-member-sequelize.repository';
import { CastMemberModel } from '../../../../infra/db/sequelize/cast-member.model';
import { UpdateCastMemberUseCase } from '../update-cast-member.use-case';

describe('UpdateCastMemberUseCase Integration Tests', () => {
  let useCase: UpdateCastMemberUseCase;
  let repository: CastMemberSequelizeRepository;

  setupSequelize({ models: [CastMemberModel] });

  beforeEach(() => {
    repository = new CastMemberSequelizeRepository(CastMemberModel);
    useCase = new UpdateCastMemberUseCase(repository);
  });

  it('should throws error when entity not found', async () => {
    const uuid = new CastMemberId();
    await expect(() =>
      useCase.execute({ id: uuid.id, name: 'fake' }),
    ).rejects.toThrow(new NotFoundError(uuid.id, CastMember));
  });

  it('should update a category', async () => {
    const entity = CastMember.fake()
      .aCastMember()
      .withType(CastMemberType.createAnActor())
      .build();
    await repository.insert(entity);

    let output = await useCase.execute({
      id: entity.cast_member_id.id,
      name: 'test',
    });
    expect(output).toStrictEqual({
      id: entity.cast_member_id.id,
      name: 'test',
      type: entity.type.type,
      created_at: entity.created_at,
    });

    type Arrange = {
      input: {
        id: string;
        name?: string;
        type?: number;
      };
      expected: {
        id: string;
        name: string;
        type: number;
        created_at: Date;
      };
    };

    const arrange: Arrange[] = [
      {
        input: {
          id: entity.cast_member_id.id,
          name: 'test 2',
        },
        expected: {
          id: entity.cast_member_id.id,
          name: 'test 2',
          type: entity.type.type,
          created_at: entity.created_at,
        },
      },
      {
        input: {
          id: entity.cast_member_id.id,
          type: CastMemberTypes.DIRECTOR,
        },
        expected: {
          id: entity.cast_member_id.id,
          name: 'test 2',
          type: CastMemberTypes.DIRECTOR,
          created_at: entity.created_at,
        },
      },
      {
        input: {
          id: entity.cast_member_id.id,
          name: 'test 3',
          type: CastMemberTypes.ACTOR,
        },
        expected: {
          id: entity.cast_member_id.id,
          name: 'test 3',
          type: CastMemberTypes.ACTOR,
          created_at: entity.created_at,
        },
      },
    ];

    for (const i of arrange) {
      output = await useCase.execute({
        id: i.input.id,
        ...('name' in i.input && { name: i.input.name }),
        ...('type' in i.input && { type: i.input.type }),
      });
      const entityUpdated = await repository.findById(
        new CastMemberId(i.input.id),
      );
      expect(output).toStrictEqual({
        id: entity.cast_member_id.id,
        name: i.expected.name,
        type: i.expected.type,
        created_at: entityUpdated!.created_at,
      });
      expect(entityUpdated!.toJSON()).toStrictEqual({
        cast_member_id: entity.cast_member_id.id,
        name: i.expected.name,
        type: i.expected.type,
        created_at: i.expected.created_at,
      });
    }
  });
});
