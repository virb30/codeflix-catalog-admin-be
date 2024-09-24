import { EntityValidationError } from 'src/core/shared/domain/validators/validation.error';
import { IUseCase } from '../../../../shared/application/use-case.interface';
import { CastMember } from '../../../domain/cast-member.entity';
import { ICastMemberRepository } from '../../../domain/cast-member.repository';
import { CreateCastMemberInput } from './create-cast-member.input';
import {
  CastMemberOutput,
  CastMemberOutputMapper,
} from '../common/cast-member.output';
import { CastMemberType } from 'src/core/cast-member/domain/cast-member-type.vo';

export class CreateCastMemberUseCase
  implements IUseCase<CreateCastMemberInput, CreateCastMemberOutput>
{
  constructor(private readonly castMemberRepo: ICastMemberRepository) {}

  async execute(input: CreateCastMemberInput): Promise<CreateCastMemberOutput> {
    const type = CastMemberType.create(input.type);
    const castMember = CastMember.create({
      ...input,
      type,
    });

    await this.castMemberRepo.insert(castMember);

    if (castMember.notification.hasErrors()) {
      throw new EntityValidationError(castMember.notification.toJSON());
    }

    return CastMemberOutputMapper.toOutput(castMember);
  }
}

export type CreateCastMemberOutput = CastMemberOutput;
