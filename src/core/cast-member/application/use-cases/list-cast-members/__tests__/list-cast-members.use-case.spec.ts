import { CastMemberType } from '../../../../../cast-member/domain/cast-member-type.vo';
import { CastMember } from '../../../../domain/cast-member.entity';
import { CastMemberSearchResult } from '../../../../domain/cast-member.repository';
import { CastMemberInMemoryRepository } from '../../../../infra/db/in-memory/cast-member-in-memory.repository';
import { CastMemberOutputMapper } from '../../common/cast-member.output';
import { ListCastMembersUseCase } from '../list-cast-members.use-case';

describe('ListCastMemberUseCase Unit Tests', () => {
  let usecase: ListCastMembersUseCase;
  let repository: CastMemberInMemoryRepository;

  beforeEach(() => {
    repository = new CastMemberInMemoryRepository();
    usecase = new ListCastMembersUseCase(repository);
  });

  test('toOutput method', () => {
    let result = new CastMemberSearchResult({
      items: [],
      total: 1,
      current_page: 1,
      per_page: 2,
    });
    let output = usecase['toOutput'](result);
    expect(output).toStrictEqual({
      items: [],
      total: 1,
      current_page: 1,
      per_page: 2,
      last_page: 1,
    });

    const entity = CastMember.create({
      name: 'John Doe ',
      type: CastMemberType.createAnActor(),
    });
    result = new CastMemberSearchResult({
      items: [entity],
      total: 1,
      current_page: 1,
      per_page: 2,
    });
    output = usecase['toOutput'](result);
    expect(output).toStrictEqual({
      items: [entity].map(CastMemberOutputMapper.toOutput),
      total: 1,
      current_page: 1,
      per_page: 2,
      last_page: 1,
    });
  });

  it('should return output sorted by created_at when input param is empty', async () => {
    const items = [
      new CastMember({
        name: 'test 1',
        type: CastMemberType.createADirector(),
      }),
      new CastMember({
        name: 'test 2',
        created_at: new Date(new Date().getTime() + 100),
        type: CastMemberType.createADirector(),
      }),
    ];
    repository.items = items;
    const output = await usecase.execute({});
    expect(output).toStrictEqual({
      items: [...items].reverse().map(CastMemberOutputMapper.toOutput),
      total: 2,
      current_page: 1,
      per_page: 15,
      last_page: 1,
    });
  });

  it('should return output using pagination, sort and filter', async () => {
    const items = [
      new CastMember({
        name: 'a',
        type: CastMemberType.createADirector(),
      }),
      new CastMember({
        name: 'AAA',
        type: CastMemberType.createAnActor(),
      }),
      new CastMember({
        name: 'AaA',
        type: CastMemberType.createAnActor(),
      }),
      new CastMember({
        name: 'b',
        type: CastMemberType.createAnActor(),
      }),
      new CastMember({
        name: 'c',
        type: CastMemberType.createAnActor(),
      }),
    ];
    repository.items = items;

    let output = await usecase.execute({
      page: 1,
      per_page: 2,
      sort: 'name',
      filter: { name: 'a', type: CastMemberType.createAnActor() },
    });
    expect(output).toStrictEqual({
      items: [items[1], items[2]].map(CastMemberOutputMapper.toOutput),
      total: 2,
      current_page: 1,
      per_page: 2,
      last_page: 1,
    });

    output = await usecase.execute({
      page: 2,
      per_page: 2,
      sort: 'name',
      filter: { name: 'a' },
    });
    expect(output).toStrictEqual({
      items: [items[0]].map(CastMemberOutputMapper.toOutput),
      total: 3,
      current_page: 2,
      per_page: 2,
      last_page: 2,
    });

    output = await usecase.execute({
      page: 1,
      per_page: 2,
      sort: 'name',
      sort_dir: 'desc',
      filter: { name: 'a' },
    });
    expect(output).toStrictEqual({
      items: [items[0], items[2]].map(CastMemberOutputMapper.toOutput),
      total: 3,
      current_page: 1,
      per_page: 2,
      last_page: 2,
    });

    output = await usecase.execute({
      page: 2,
      per_page: 2,
      sort: 'name',
      sort_dir: 'desc',
      filter: { name: 'a' },
    });
    expect(output).toStrictEqual({
      items: [items[1]].map(CastMemberOutputMapper.toOutput),
      total: 3,
      current_page: 2,
      per_page: 2,
      last_page: 2,
    });

    output = await usecase.execute({
      page: 1,
      per_page: 2,
      sort: 'name',
      sort_dir: 'desc',
      filter: { type: CastMemberType.createADirector() },
    });
    expect(output).toStrictEqual({
      items: [items[0]].map(CastMemberOutputMapper.toOutput),
      total: 1,
      current_page: 1,
      per_page: 2,
      last_page: 1,
    });
  });
});
