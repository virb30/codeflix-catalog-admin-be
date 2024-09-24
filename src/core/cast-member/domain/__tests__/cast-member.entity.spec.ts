import { Uuid } from '../../../shared/domain/value-objects/uuid.vo';
import { CastMemberType, CastMemberTypes } from '../cast-member-type.vo';
import { CastMember } from '../cast-member.entity';

describe('CastMember Unit Tests', () => {
  beforeEach(() => {
    CastMember.prototype.validate = jest
      .fn()
      .mockImplementation(CastMember.prototype.validate);
  });
  describe('constructor', () => {
    test('should create a cast member with default values', () => {
      const castMember = new CastMember({
        name: 'John Doe',
        type: CastMemberType.createADirector(),
      });

      expect(castMember.cast_member_id).toBeDefined();
      expect(castMember.name).toBe('John Doe');
      expect(castMember.type.type).toBe(CastMemberTypes.DIRECTOR);
      expect(castMember.created_at).toBeInstanceOf(Date);
    });

    test('should create a cast member with all values', () => {
      const created_at = new Date();
      const id = new Uuid();
      const castMember = new CastMember({
        cast_member_id: id,
        name: 'John Doe',
        type: CastMemberType.createAnActor(),
        created_at,
      });

      expect(castMember.cast_member_id).toBe(id);
      expect(castMember.name).toBe('John Doe');
      expect(castMember.type.type).toEqual(CastMemberTypes.ACTOR);
      expect(castMember.created_at).toBe(created_at);
    });
  });

  describe('create command', () => {
    test('should create a cast member', () => {
      const castMember = CastMember.create({
        name: 'John Doe',
        type: CastMemberType.createADirector(),
      });
      expect(castMember).toBeInstanceOf(CastMember);
      expect(castMember.cast_member_id).toBeInstanceOf(Uuid);
      expect(castMember.name).toBe('John Doe');
      expect(castMember.type.type).toBe(CastMemberTypes.DIRECTOR);
      expect(castMember.created_at).toBeInstanceOf(Date);
      expect(CastMember.prototype.validate).toHaveBeenCalledTimes(1);
      expect(castMember.notification.hasErrors()).toBe(false);
    });
  });

  test('should change name', () => {
    const castMember = new CastMember({
      name: 'John Doe',
      type: CastMemberType.createAnActor(),
    });
    expect(castMember.name).toBe('John Doe');
    castMember.changeName('Jane Doe');
    expect(castMember.name).toBe('Jane Doe');
    expect(CastMember.prototype.validate).toHaveBeenCalledTimes(1);
    expect(castMember.notification.hasErrors()).toBe(false);
  });

  test('should change type', () => {
    const castMember = new CastMember({
      name: 'John Doe',
      type: CastMemberType.createAnActor(),
    });
    expect(castMember.type.type).toBe(CastMemberTypes.ACTOR);
    castMember.changeType(CastMemberType.createADirector());
    expect(castMember.type.type).toBe(CastMemberTypes.DIRECTOR);
  });
});

describe('CastMemberValidator Unit Tests', () => {
  describe('create command', () => {
    test('should an invalid cast member with name property', () => {
      const castMember = CastMember.create({
        name: 'p'.repeat(256),
        type: CastMemberType.createAnActor(),
      });
      expect(castMember.notification.hasErrors()).toBe(true);
      expect(castMember.notification).notificationContainsErrorMessages([
        {
          name: ['name must be shorter than or equal to 255 characters'],
        },
      ]);
    });
  });

  describe('changeName method', () => {
    const castMember = CastMember.create({
      name: 'John Doe',
      type: CastMemberType.createAnActor(),
    });
    castMember.changeName('p'.repeat(256));
    expect(castMember.notification.hasErrors()).toBe(true);
    expect(castMember.notification).notificationContainsErrorMessages([
      {
        name: ['name must be shorter than or equal to 255 characters'],
      },
    ]);
  });
});
