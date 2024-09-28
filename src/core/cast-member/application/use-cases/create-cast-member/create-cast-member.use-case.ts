import { EntityValidationError } from 'src/core/shared/domain/validators/validation.error';
import { IUseCase } from '../../../../shared/application/use-case.interface';
import { CastMember } from '../../../domain/cast-member.aggregate';
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
    const [type, errorCastMemberType] = CastMemberType.create(
      input.type,
    ).asArray();
    const castMember = CastMember.create({
      ...input,
      type,
    });
    const notification = castMember.notification;
    if (errorCastMemberType) {
      notification.setError(errorCastMemberType.message, 'type');
    }

    if (castMember.notification.hasErrors()) {
      throw new EntityValidationError(castMember.notification.toJSON());
    }

    await this.castMemberRepo.insert(castMember);

    return CastMemberOutputMapper.toOutput(castMember);
  }
}

export type CreateCastMemberOutput = CastMemberOutput;
