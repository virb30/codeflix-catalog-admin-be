import {
  CastMemberType,
  CastMemberTypes,
} from '../../../../../cast-member/domain/cast-member-type.vo';
import { setupSequelize } from '../../../../../shared/infra/testing/helpers';
import { CastMember } from '../../../../domain/cast-member.entity';
import { CastMemberSequelizeRepository } from '../../../../infra/db/sequelize/cast-member-sequelize.repository';
import { CastMemberModel } from '../../../../infra/db/sequelize/cast-member.model';
import { CastMemberOutputMapper } from '../../common/cast-member.output';
import { ListCastMembersUseCase } from '../list-cast-members.use-case';

describe('ListCastMembersUseCase Integration Tests', () => {
  let useCase: ListCastMembersUseCase;
  let repository: CastMemberSequelizeRepository;

  setupSequelize({ models: [CastMemberModel] });

  beforeEach(() => {
    repository = new CastMemberSequelizeRepository(CastMemberModel);
    useCase = new ListCastMembersUseCase(repository);
  });

  it('should return output sorted by created_at when input param is empty', async () => {
    const categories = CastMember.fake()
      .theCastMembers(2)
      .withCreatedAt((i) => new Date(new Date().getTime() + 1000 + i))
      .build();
    await repository.bulkInsert(categories);
    const output = await useCase.execute({});
    expect(output).toEqual({
      items: [...categories].reverse().map(CastMemberOutputMapper.toOutput),
      total: 2,
      current_page: 1,
      per_page: 15,
      last_page: 1,
    });
  });

  it('should returns output using pagination sort and filter', async () => {
    const castMembers = [
      new CastMember({
        name: 'a',
        type: CastMemberType.createADirector(),
      }),
      new CastMember({
        name: 'AAA',
        type: CastMemberType.createADirector(),
      }),
      new CastMember({
        name: 'AaA',
        type: CastMemberType.createAnActor(),
      }),
      new CastMember({
        name: 'b',
        type: CastMemberType.createADirector(),
      }),
      new CastMember({
        name: 'c',
        type: CastMemberType.createAnActor(),
      }),
    ];
    await repository.bulkInsert(castMembers);

    let output = await useCase.execute({
      page: 1,
      per_page: 2,
      sort: 'name',
      filter: {
        name: 'a',
      },
    });
    expect(output).toStrictEqual({
      items: [castMembers[1], castMembers[2]].map(
        CastMemberOutputMapper.toOutput,
      ),
      total: 3,
      current_page: 1,
      per_page: 2,
      last_page: 2,
    });

    output = await useCase.execute({
      page: 2,
      per_page: 2,
      sort: 'name',
      filter: {
        name: 'a',
      },
    });
    expect(output).toStrictEqual({
      items: [castMembers[0]].map(CastMemberOutputMapper.toOutput),
      total: 3,
      current_page: 2,
      per_page: 2,
      last_page: 2,
    });

    output = await useCase.execute({
      page: 1,
      per_page: 2,
      sort: 'name',
      filter: {
        name: 'a',
        type: CastMemberTypes.DIRECTOR,
      },
    });
    expect(output).toStrictEqual({
      items: [castMembers[1], castMembers[0]].map(
        CastMemberOutputMapper.toOutput,
      ),
      total: 2,
      current_page: 1,
      per_page: 2,
      last_page: 1,
    });

    output = await useCase.execute({
      page: 1,
      per_page: 2,
      sort: 'name',
      filter: {
        type: CastMemberTypes.ACTOR,
      },
    });
    expect(output).toStrictEqual({
      items: [castMembers[2], castMembers[4]].map(
        CastMemberOutputMapper.toOutput,
      ),
      total: 2,
      current_page: 1,
      per_page: 2,
      last_page: 1,
    });

    output = await useCase.execute({
      page: 1,
      per_page: 2,
      sort: 'name',
      sort_dir: 'desc',
      filter: {
        name: 'a',
      },
    });
    expect(output).toStrictEqual({
      items: [castMembers[0], castMembers[2]].map(
        CastMemberOutputMapper.toOutput,
      ),
      total: 3,
      current_page: 1,
      per_page: 2,
      last_page: 2,
    });

    output = await useCase.execute({
      page: 2,
      per_page: 2,
      sort: 'name',
      sort_dir: 'desc',
      filter: {
        name: 'a',
      },
    });
    expect(output).toStrictEqual({
      items: [castMembers[1]].map(CastMemberOutputMapper.toOutput),
      total: 3,
      current_page: 2,
      per_page: 2,
      last_page: 2,
    });
  });
});
