import { CastMemberTypes } from 'src/core/cast-member/domain/cast-member-type.vo';
import { Uuid } from '../../../../../shared/domain/value-objects/uuid.vo';
import { setupSequelize } from '../../../../../shared/infra/testing/helpers';
import { CastMemberSequelizeRepository } from '../../../../infra/db/sequelize/cast-member-sequelize.repository';
import { CastMemberModel } from '../../../../infra/db/sequelize/cast-member.model';
import { CreateCastMemberUseCase } from '../create-cast-member.use-case';

describe('CreateCastMemberUseCase Integration Tests', () => {
  let useCase: CreateCastMemberUseCase;
  let repository: CastMemberSequelizeRepository;

  setupSequelize({ models: [CastMemberModel] });

  beforeEach(() => {
    repository = new CastMemberSequelizeRepository(CastMemberModel);
    useCase = new CreateCastMemberUseCase(repository);
  });

  it('should create a cast member', async () => {
    let output = await useCase.execute({
      name: 'test',
      type: CastMemberTypes.ACTOR,
    });
    let entity = await repository.findById(new Uuid(output.id));
    expect(output).toStrictEqual({
      id: entity.cast_member_id.id,
      name: 'test',
      type: CastMemberTypes.ACTOR,
      created_at: entity.created_at,
    });

    output = await useCase.execute({
      name: 'test',
      type: CastMemberTypes.DIRECTOR,
    });
    entity = await repository.findById(new Uuid(output.id));
    expect(output).toStrictEqual({
      id: entity.cast_member_id.id,
      name: 'test',
      type: CastMemberTypes.DIRECTOR,
      created_at: entity.created_at,
    });
  });
});
