import { CastMemberInMemoryRepository } from 'src/core/cast-member/infra/db/in-memory/cast-member-in-memory.repository';
import { GetCastMemberUseCase } from '../get-cast-member.use-case';
import { CastMember } from 'src/core/cast-member/domain/cast-member.entity';
import {
  InvalidUuidError,
  Uuid,
} from 'src/core/shared/domain/value-objects/uuid.vo';
import { NotFoundError } from 'src/core/shared/domain/errors/not-found.error';

describe('GetCastMemberUseCase Unit Tests', () => {
  let usecase: GetCastMemberUseCase;
  let repository: CastMemberInMemoryRepository;

  beforeEach(() => {
    repository = new CastMemberInMemoryRepository();
    usecase = new GetCastMemberUseCase(repository);
  });

  test('should throw an error when entity not found', async () => {
    await expect(() => usecase.execute({ id: 'fake id' })).rejects.toThrow(
      new InvalidUuidError(),
    );

    const uuid = new Uuid();

    await expect(() => usecase.execute({ id: uuid.id })).rejects.toThrow(
      new NotFoundError(uuid.id, CastMember),
    );
  });

  test('should get a cast member', async () => {
    const castMember = CastMember.fake().aCastMember().build();
    repository.items = [castMember];
    const output = await usecase.execute({ id: castMember.cast_member_id.id });
    expect(output).toStrictEqual(castMember.toJSON());
  });
});
