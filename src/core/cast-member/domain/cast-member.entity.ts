import { Entity } from '../../shared/domain/entity';
import { Uuid } from '../../shared/domain/value-objects/uuid.vo';
import { CastMemberType } from './cast-member-type.vo';
import { ValueObject } from '../../shared/domain/value-object';
import { CastMemberValidatorFactory } from './cast-member.validator';

export type CastMemberConstructorProps = {
  id?: Uuid;
  name: string;
  type: CastMemberType;
  created_at?: Date;
};

export type CastMemberCreateCommmandProps = {
  name: string;
  type: CastMemberType;
};

export class CastMember extends Entity {
  id: Uuid;
  name: string;
  type: CastMemberType;
  created_at: Date;

  constructor(props: CastMemberConstructorProps) {
    super();
    this.id = props.id ?? new Uuid();
    this.name = props.name;
    this.type = props.type;
    this.created_at = props.created_at ?? new Date();
  }

  static create(props: CastMemberCreateCommmandProps) {
    const castMember = new CastMember(props);
    castMember.validate(['name']);
    return castMember;
  }

  validate(fields?: string[]) {
    const validator = CastMemberValidatorFactory.create();
    return validator.validate(this.notification, this, fields);
  }

  changeName(name: string): void {
    this.name = name;
    this.validate(['name']);
  }

  changeType(type: CastMemberType): void {
    this.type = type;
  }

  get entity_id(): ValueObject {
    return this.id;
  }

  toJSON() {
    return {
      category_id: this.id.id,
      name: this.name,
      type: this.type,
      created_at: this.created_at,
    };
  }
}
