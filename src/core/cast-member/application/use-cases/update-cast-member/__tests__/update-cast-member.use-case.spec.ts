import { NotFoundError } from '../../../../../shared/domain/errors/not-found.error';
import { CastMember } from '../../../../../cast-member/domain/cast-member.entity';
import { CastMemberInMemoryRepository } from '../../../../../cast-member/infra/db/in-memory/cast-member-in-memory.repository';
import {
  InvalidUuidError,
  Uuid,
} from '../../../../../shared/domain/value-objects/uuid.vo';
import { UpdateCastMemberUseCase } from '../update-cast-member.use-case';
import { CastMemberType } from '../../../../../cast-member/domain/cast-member-type.vo';

describe('UpdateCastMemberUseCase Unit Tests', () => {
  let usecase: UpdateCastMemberUseCase;
  let repository: CastMemberInMemoryRepository;

  beforeEach(() => {
    repository = new CastMemberInMemoryRepository();
    usecase = new UpdateCastMemberUseCase(repository);
  });

  const id = new Uuid();
  const created_at = new Date();
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
        id: id.id,
        name: 'Jane Doe',
        type: 2,
      },
      expected: {
        id: id.id,
        name: 'Jane Doe',
        type: 2,
        created_at,
      },
    },
    {
      input: {
        id: id.id,
        name: 'Jane Doe',
      },
      expected: {
        id: id.id,
        name: 'Jane Doe',
        type: 1,
        created_at,
      },
    },
    {
      input: {
        id: id.id,
        type: 2,
      },
      expected: {
        id: id.id,
        name: 'John Doe',
        type: 2,
        created_at,
      },
    },
  ];

  test.each(arrange)(
    'should update a cast member with $input',
    async ({ input, expected }) => {
      const spyUpdate = jest.spyOn(repository, 'update');
      const entity = CastMember.fake()
        .aCastMember()
        .withUuid(id)
        .withName('John Doe')
        .withType(CastMemberType.createADirector())
        .withCreatedAt(created_at)
        .build();
      repository.items = [entity];

      const output = await usecase.execute({
        id: id.id,
        ...('name' in input && { name: input.name }),
        ...('type' in input && { type: input.type }),
      });
      expect(spyUpdate).toHaveBeenCalledTimes(1);
      expect(output).toStrictEqual(expected);
    },
  );

  it('should throw error when cast member is invalid', async () => {
    const entity = new CastMember({
      name: 'John Doe',
      type: CastMemberType.createAnActor(),
    });
    repository.items = [entity];
    let input = { id: entity.id.id, name: 't'.repeat(256) };
    await expect(() => usecase.execute(input)).rejects.toThrow(
      'Entity Validation Error',
    );

    input = { id: entity.id.id, type: 3 } as any;
    await expect(() => usecase.execute(input)).rejects.toThrow(
      'Invalid cast member type: 3',
    );
  });

  it('should throws error when entity not found', async () => {
    await expect(() =>
      usecase.execute({ id: 'fake id', name: 'fake' }),
    ).rejects.toThrow(new InvalidUuidError());

    const uuid = new Uuid();

    await expect(() =>
      usecase.execute({ id: uuid.id, name: 'fake' }),
    ).rejects.toThrow(new NotFoundError(uuid.id, CastMember));
  });
});
