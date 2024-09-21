import { CastMemberType } from '../../../../../cast-member/domain/cast-member-type.vo';
import { CreateCastMemberUseCase } from '../create-cast-member.use-case';
import { CastMemberInMemoryRepository } from '../../../../../cast-member/infra/db/in-memory/cast-member-in-memory.repository';

describe('CreateCastMemberUseCase Unit Tests', () => {
  let usecase: CreateCastMemberUseCase;
  let repository: CastMemberInMemoryRepository;

  beforeEach(() => {
    repository = new CastMemberInMemoryRepository();
    usecase = new CreateCastMemberUseCase(repository);
  });

  it('should create a cast member', async () => {
    const spyInsert = jest.spyOn(repository, 'insert');
    const output = await usecase.execute({
      name: 'John Doe',
      type: 1,
    });
    expect(spyInsert).toHaveBeenCalledTimes(1);
    expect(output).toStrictEqual({
      id: repository.items[0].id.id,
      name: 'John Doe',
      type: 1,
      created_at: repository.items[0].created_at,
    });
    expect(output.id).toBeDefined();
    expect(output.name).toBe('John Doe');
    expect(output.type).toBe(CastMemberType.DIRECTOR);
    expect(output.created_at).toBeInstanceOf(Date);
  });
});
