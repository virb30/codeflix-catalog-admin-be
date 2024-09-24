import { CastMember } from '../../../domain/cast-member.entity';
import { CastMemberOutputMapper } from './cast-member.output';

describe('CastMemberOutputMapper Unit Tests', () => {
  it('should convert a category in output', () => {
    const entity = CastMember.fake().aCastMember().withName('John Doe').build();

    const spyToJSON = jest.spyOn(entity, 'toJSON');
    const output = CastMemberOutputMapper.toOutput(entity);
    expect(spyToJSON).toHaveBeenCalled();
    expect(output).toStrictEqual({
      cast_member_id: entity.cast_member_id.id,
      name: 'John Doe',
      type: entity.type.type,
      created_at: entity.created_at,
    });
  });
});
