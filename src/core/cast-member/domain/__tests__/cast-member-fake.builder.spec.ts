import { Chance } from 'chance';
import { Uuid } from '../../../shared/domain/value-objects/uuid.vo';
import { CastMemberFakeBuilder } from '../cast-member-fake.builder';
import { CastMemberType, CastMemberTypes } from '../cast-member-type.vo';

describe('CastMemberFakerBuilder Unit Tests', () => {
  describe('id prop', () => {
    const faker = CastMemberFakeBuilder.aCastMember();

    test('should throw error when any methods has called', () => {
      expect(() => faker.id).toThrow(
        new Error("Property id not have a factory, use 'with' methods"),
      );
    });

    test('should be undefined', () => {
      expect(faker['_id']).toBeUndefined();
    });

    test('withUuid', () => {
      const id = new Uuid();
      const $this = faker.withUuid(id);
      expect($this).toBeInstanceOf(CastMemberFakeBuilder);
      expect(faker['_id']).toBe(id);

      faker.withUuid(() => id);
      //@ts-expect-error _id is a callable
      expect(faker['_id']()).toBe(id);

      expect(faker.id).toBe(id);
    });

    test('should pass index to id factory', () => {
      const id = new Uuid();
      let mockFactory = jest.fn(() => id);
      faker.withUuid(mockFactory);
      faker.build();
      expect(mockFactory).toHaveBeenCalledTimes(1);

      mockFactory = jest.fn(() => id);
      const castMembers = CastMemberFakeBuilder.theCastMembers(2)
        .withUuid(mockFactory)
        .build();

      expect(mockFactory).toHaveBeenCalledTimes(2);
      expect(castMembers[0].id).toBe(id);
      expect(castMembers[1].id).toBe(id);
    });
  });

  describe('name prop', () => {
    const faker = CastMemberFakeBuilder.aCastMember();
    test('should be a function', () => {
      expect(typeof faker['_name']).toBe('function');
    });

    test('should call the word method', () => {
      const chance = Chance();
      const spyWordMethod = jest.spyOn(chance, 'word');
      faker['chance'] = chance;
      faker.build();

      expect(spyWordMethod).toHaveBeenCalled();
    });

    test('withName', () => {
      const $this = faker.withName('test name');
      expect($this).toBeInstanceOf(CastMemberFakeBuilder);
      expect(faker['_name']).toBe('test name');

      faker.withName(() => 'test name');
      //@ts-expect-error name is callable
      expect(faker['_name']()).toBe('test name');
      expect(faker.name).toBe('test name');
    });

    test('should pass index to name factory', () => {
      faker.withName((index) => `test name ${index}`);
      const castMember = faker.build();
      expect(castMember.name).toBe('test name 0');

      const fakerMany = CastMemberFakeBuilder.theCastMembers(2);
      fakerMany.withName((index) => `test name ${index}`);
      const castMembers = fakerMany.build();

      expect(castMembers[0].name).toBe('test name 0');
      expect(castMembers[1].name).toBe('test name 1');
    });

    test('invalid too long case', () => {
      const $this = faker.withInvalidNameTooLong();
      expect($this).toBeInstanceOf(CastMemberFakeBuilder);
      expect(faker['_name'].length).toBe(256);

      const tooLong = 'a'.repeat(256);
      faker.withInvalidNameTooLong(tooLong);
      expect(faker['_name'].length).toBe(256);
      expect(faker['_name']).toBe(tooLong);
    });
  });

  describe('created_at prop', () => {
    const faker = CastMemberFakeBuilder.aCastMember();

    test('should throw error when any with methods does not have been called', () => {
      const fakerCastMember = CastMemberFakeBuilder.aCastMember();
      expect(() => fakerCastMember.created_at).toThrow(
        new Error("Property created_at not have a factory, use 'with' methods"),
      );
    });
    test('should be undefined', () => {
      expect(faker['_created_at']).toBeUndefined();
    });

    test('withCreatedAt', () => {
      const date = new Date();
      const $this = faker.withCreatedAt(date);
      expect($this).toBeInstanceOf(CastMemberFakeBuilder);
      expect(faker['_created_at']).toBe(date);

      faker.withCreatedAt(() => date);
      //@ts-expect-error description is callable
      expect(faker['_created_at']()).toBe(date);
      expect(faker.created_at).toBe(date);
    });

    test('should pass index to description factory', () => {
      const date = new Date();
      faker.withCreatedAt((index) => new Date(date.getTime() + index + 2));
      const castMember = faker.build();
      expect(castMember.created_at.getTime()).toBe(date.getTime() + 2);

      const fakerMany = CastMemberFakeBuilder.theCastMembers(2);
      fakerMany.withCreatedAt((index) => new Date(date.getTime() + index + 2));
      const castMembers = fakerMany.build();

      expect(castMembers[0].created_at.getTime()).toBe(date.getTime() + 2);
      expect(castMembers[1].created_at.getTime()).toBe(date.getTime() + 3);
    });
  });

  test('should create a cast member', () => {
    const faker = CastMemberFakeBuilder.aCastMember();
    let castMember = faker.build();

    expect(castMember.id).toBeInstanceOf(Uuid);
    expect(typeof castMember.name === 'string').toBeTruthy();
    expect(castMember.type).toBeInstanceOf(CastMemberType);
    expect(castMember.created_at).toBeInstanceOf(Date);

    const created_at = new Date();
    const id = new Uuid();

    castMember = faker
      .withUuid(id)
      .withName('name test')
      .withCreatedAt(created_at)
      .build();

    expect(castMember.id.id).toBe(id.id);
    expect(castMember.name).toBe('name test');
    expect(castMember.created_at).toBe(created_at);
  });

  test('should create many cast members', () => {
    const faker = CastMemberFakeBuilder.theCastMembers(2);
    let castMembers = faker.build();

    castMembers.forEach((castMember) => {
      expect(castMember.id).toBeInstanceOf(Uuid);
      expect(typeof castMember.name === 'string').toBeTruthy();
      expect(castMember.type).toBeInstanceOf(CastMemberType);
      expect(castMember.type.type).toEqual(CastMemberTypes.ACTOR);
      expect(castMember.created_at).toBeInstanceOf(Date);
    });

    const created_at = new Date();
    const id = new Uuid();

    castMembers = faker
      .withUuid(id)
      .withName('name test')
      .withType(CastMemberType.createAnActor())
      .withCreatedAt(created_at)
      .build();

    castMembers.forEach((castMember) => {
      expect(castMember.id.id).toBe(id.id);
      expect(castMember.name).toBe('name test');
      expect(castMember.type).toBeInstanceOf(CastMemberType);
      expect(castMember.type.type).toBe(CastMemberTypes.ACTOR);
      expect(castMember.created_at).toBe(created_at);
    });
  });
});