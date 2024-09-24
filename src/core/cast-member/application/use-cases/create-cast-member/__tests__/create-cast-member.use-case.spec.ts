import { CastMemberTypes } from '../../../../../cast-member/domain/cast-member-type.vo';
import { CreateCastMemberUseCase } from '../create-cast-member.use-case';
import { CastMemberInMemoryRepository } from '../../../../../cast-member/infra/db/in-memory/cast-member-in-memory.repository';

describe('CreateCastMemberUseCase Unit Tests', () => {
  let usecase: CreateCastMemberUseCase;
  let repository: CastMemberInMemoryRepository;

  beforeEach(() => {
    repository = new CastMemberInMemoryRepository();
    usecase = new CreateCastMemberUseCase(repository);
  });

  it('should throw an error when cast member is not valid', async () => {
    const input = { name: 't'.repeat(256), type: 1 };
    await expect(() => usecase.execute(input)).rejects.toThrow(
      'Entity Validation Error',
    );
  });

  it('should create a cast member', async () => {
    const spyInsert = jest.spyOn(repository, 'insert');
    const output = await usecase.execute({
      name: 'John Doe',
      type: 1,
    });
    expect(spyInsert).toHaveBeenCalledTimes(1);
    expect(output).toStrictEqual({
      cast_member_id: repository.items[0].cast_member_id.id,
      name: 'John Doe',
      type: 1,
      created_at: repository.items[0].created_at,
    });
    expect(output.cast_member_id).toBeDefined();
    expect(output.name).toBe('John Doe');
    expect(output.type).toBe(CastMemberTypes.DIRECTOR);
    expect(output.created_at).toBeInstanceOf(Date);
  });
});
