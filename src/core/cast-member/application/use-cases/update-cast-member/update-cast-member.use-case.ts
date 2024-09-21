import { IUseCase } from '../../../..//shared/application/use-case.interface';
import { UpdateCastMemberInput } from './update-cast-member.input';
import {
  CastMemberOutput,
  CastMemberOutputMapper,
} from '../common/cast-member.output';
import { ICastMemberRepository } from '../../../..//cast-member/domain/cast-member.repository';
import { Uuid } from '../../../..//shared/domain/value-objects/uuid.vo';
import { NotFoundError } from '../../../..//shared/domain/errors/not-found.error';
import { CastMember } from '../../../..//cast-member/domain/cast-member.entity';
import { EntityValidationError } from '../../../..//shared/domain/validators/validation.error';
import { CastMemberType } from 'src/core/cast-member/domain/cast-member-type.vo';

export class UpdateCastMemberUseCase
  implements IUseCase<UpdateCastMemberInput, UpdateCastMemberOutput>
{
  constructor(private readonly castMemberRepo: ICastMemberRepository) {}

  async execute(input: UpdateCastMemberInput): Promise<CastMemberOutput> {
    const uuid = new Uuid(input.id);
    const castMember = await this.castMemberRepo.findById(uuid);

    if (!castMember) {
      throw new NotFoundError(uuid, CastMember);
    }

    if ('name' in input) {
      castMember.changeName(input.name);
    }

    if ('type' in input) {
      const type = CastMemberType.create(input.type);
      castMember.changeType(type);
    }

    if (castMember.notification.hasErrors()) {
      throw new EntityValidationError(castMember.notification.toJSON());
    }

    await this.castMemberRepo.update(castMember);

    return CastMemberOutputMapper.toOutput(castMember);
  }
}

export type UpdateCastMemberOutput = CastMemberOutput;
