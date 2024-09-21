import { ICastMemberRepository } from 'src/core/cast-member/domain/cast-member.repository';
import { IUseCase } from 'src/core/shared/application/use-case.interface';
import { Uuid } from 'src/core/shared/domain/value-objects/uuid.vo';

export class DeleteCastMemberUseCase
  implements IUseCase<DeleteCastMemberInput, DeleteCastMemberOutput>
{
  constructor(private readonly castMemberRepo: ICastMemberRepository) {}

  async execute(input: DeleteCastMemberInput): Promise<void> {
    const uuid = new Uuid(input.id);
    return this.castMemberRepo.delete(uuid);
  }
}

export type DeleteCastMemberInput = {
  id: string;
};

export type DeleteCastMemberOutput = void;
