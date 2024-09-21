import { CastMember } from '../../../domain/cast-member.entity';

export type CastMemberOutput = {
  id: string;
  name: string;
  type: number;
  created_at: Date;
};

export class CastMemberOutputMapper {
  static toOutput(entity: CastMember): CastMemberOutput {
    const { id, ...otherProps } = entity.toJSON();
    return {
      id,
      ...otherProps,
    };
  }
}
