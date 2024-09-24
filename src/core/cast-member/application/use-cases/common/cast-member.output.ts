import { CastMember } from '../../../domain/cast-member.entity';

export type CastMemberOutput = {
  cast_member_id: string;
  name: string;
  type: number;
  created_at: Date;
};

export class CastMemberOutputMapper {
  static toOutput(entity: CastMember): CastMemberOutput {
    const { cast_member_id, ...otherProps } = entity.toJSON();
    return {
      cast_member_id,
      ...otherProps,
    };
  }
}
