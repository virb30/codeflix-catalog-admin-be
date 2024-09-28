import { CastMemberId } from '../../../../cast-member/domain/cast-member.aggregate';
import { ICastMemberRepository } from '../../../../cast-member/domain/cast-member.repository';
import { IUseCase } from '../../../../shared/application/use-case.interface';

export class DeleteCastMemberUseCase
  implements IUseCase<DeleteCastMemberInput, DeleteCastMemberOutput>
{
  constructor(private readonly castMemberRepo: ICastMemberRepository) {}

  async execute(input: DeleteCastMemberInput): Promise<void> {
    const uuid = new CastMemberId(input.id);
    return this.castMemberRepo.delete(uuid);
  }
}

export type DeleteCastMemberInput = {
  id: string;
};

export type DeleteCastMemberOutput = void;
