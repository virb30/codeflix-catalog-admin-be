import { IUseCase } from '../../../..//shared/application/use-case.interface';
import { UpdateCastMemberInput } from './update-cast-member.input';
import {
  CastMemberOutput,
  CastMemberOutputMapper,
} from '../common/cast-member.output';
import { ICastMemberRepository } from '../../../..//cast-member/domain/cast-member.repository';
import { NotFoundError } from '../../../..//shared/domain/errors/not-found.error';
import {
  CastMember,
  CastMemberId,
} from '../../../domain/cast-member.aggregate';
import { EntityValidationError } from '../../../..//shared/domain/validators/validation.error';
import { CastMemberType } from 'src/core/cast-member/domain/cast-member-type.vo';

export class UpdateCastMemberUseCase
  implements IUseCase<UpdateCastMemberInput, UpdateCastMemberOutput>
{
  constructor(private readonly castMemberRepo: ICastMemberRepository) {}

  async execute(input: UpdateCastMemberInput): Promise<CastMemberOutput> {
    const uuid = new CastMemberId(input.id);
    const castMember = await this.castMemberRepo.findById(uuid);

    if (!castMember) {
      throw new NotFoundError(uuid, CastMember);
    }

    if ('name' in input) {
      castMember.changeName(input.name!);
    }

    if ('type' in input) {
      const [type, errorCastMemberType] = CastMemberType.create(
        input.type!,
      ).asArray();
      castMember.changeType(type);

      const notification = castMember.notification;
      if (errorCastMemberType) {
        notification.setError(errorCastMemberType.message, 'type');
      }
    }

    if (castMember.notification.hasErrors()) {
      throw new EntityValidationError(castMember.notification.toJSON());
    }

    await this.castMemberRepo.update(castMember);

    return CastMemberOutputMapper.toOutput(castMember);
  }
}

export type UpdateCastMemberOutput = CastMemberOutput;
