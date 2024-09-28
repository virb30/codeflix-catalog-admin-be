import { IUseCase } from '../../../../shared/application/use-case.interface';
import {
  CastMemberOutput,
  CastMemberOutputMapper,
} from '../common/cast-member.output';
import { ICastMemberRepository } from '../../../../cast-member/domain/cast-member.repository';
import { NotFoundError } from '../../../../shared/domain/errors/not-found.error';
import {
  CastMember,
  CastMemberId,
} from '../../../domain/cast-member.aggregate';

export class GetCastMemberUseCase
  implements IUseCase<GetCastMemberInput, GetCastMemberOutput>
{
  constructor(private readonly castMemberRepo: ICastMemberRepository) {}

  async execute(input: GetCastMemberInput): Promise<CastMemberOutput> {
    const uuid = new CastMemberId(input.id);
    const castMember = await this.castMemberRepo.findById(uuid);
    if (!castMember) {
      throw new NotFoundError(uuid.id, CastMember);
    }
    return CastMemberOutputMapper.toOutput(castMember);
  }
}

export type GetCastMemberInput = {
  id: string;
};

export type GetCastMemberOutput = CastMemberOutput;
