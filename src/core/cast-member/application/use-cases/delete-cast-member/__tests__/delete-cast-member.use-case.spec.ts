import { CastMemberInMemoryRepository } from '../../../../../cast-member/infra/db/in-memory/cast-member-in-memory.repository';
import { DeleteCastMemberUseCase } from '../delete-cast-member.use-case';
import { CastMember } from '../../../../../cast-member/domain/cast-member.entity';
import {
  InvalidUuidError,
  Uuid,
} from '../../../../../shared/domain/value-objects/uuid.vo';
import { NotFoundError } from '../../../../../shared/domain/errors/not-found.error';

describe('DeleteCastMemberUseCase Unit Tests', () => {
  let usecase: DeleteCastMemberUseCase;
  let repository: CastMemberInMemoryRepository;

  beforeEach(() => {
    repository = new CastMemberInMemoryRepository();
    usecase = new DeleteCastMemberUseCase(repository);
  });

  test('should delete a cast member', async () => {
    const castMember = CastMember.fake().aCastMember().build();
    repository.items = [castMember];
    await usecase.execute({ id: castMember.id.id });
    expect(repository.items).toHaveLength(0);
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
});