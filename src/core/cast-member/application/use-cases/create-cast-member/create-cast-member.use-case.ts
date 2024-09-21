import { EntityValidationError } from 'src/core/shared/domain/validators/validation.error';
import { IUseCase } from '../../../../shared/application/use-case.interface';
import { CastMember } from '../../../domain/cast-member.entity';
import { ICastMemberRepository } from '../../../domain/cast-member.repository';
import { CreateCastMemberInput } from './create-cast-member.input';
import { CastMemberOutput } from '../common/cast-member.output';

export class CreateCastMemberUseCase
  implements IUseCase<CreateCastMemberInput, CreateCastMemberOutput>
{
  constructor(private readonly castMemberRepo: ICastMemberRepository) {}

  async execute(input: CreateCastMemberInput): Promise<CreateCastMemberOutput> {
    const castMember = CastMember.create(input);

    await this.castMemberRepo.insert(castMember);

    if (castMember.notification.hasErrors()) {
      throw new EntityValidationError(castMember.notification.toJSON());
    }

    return {
      id: castMember.id.id,
      name: castMember.name,
      type: castMember.type,
      created_at: castMember.created_at,
    };
  }
}

export type CreateCastMemberOutput = CastMemberOutput;
