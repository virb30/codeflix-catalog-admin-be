import { CastMemberType } from '../../../../cast-member/domain/cast-member-type.vo';
import { LoadEntityError } from '../../../../shared/domain/validators/validation.error';
import {
  CastMember,
  CastMemberId,
} from '../../../domain/cast-member.aggregate';
import { CastMemberModel } from './cast-member.model';

export class CastMemberModelMapper {
  static toModel(entity: CastMember): CastMemberModel {
    return CastMemberModel.build({
      cast_member_id: entity.cast_member_id.id,
      name: entity.name,
      type: entity.type.type,
      created_at: entity.created_at,
    });
  }

  static toEntity(model: CastMemberModel): CastMember {
    const { cast_member_id: id, ...otherData } = model.toJSON();
    const [type, errorCastMemberType] = CastMemberType.create(
      otherData.type as any,
    ).asArray();

    const castMember = new CastMember({
      ...otherData,
      cast_member_id: new CastMemberId(id),
      type,
    });
    castMember.validate();

    const notification = castMember.notification;
    if (errorCastMemberType) {
      notification.setError(errorCastMemberType.message, 'type');
    }

    if (notification.hasErrors()) {
      throw new LoadEntityError(notification.toJSON());
    }
    return castMember;
  }
}
