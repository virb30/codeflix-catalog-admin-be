import { MaxLength } from 'class-validator';
import { Genre } from './genre.aggregate';
import { ClassValidatorFields } from '../../shared/domain/validators/class-validator-fields';
import { Notification } from '../../shared/domain/validators/notification';

export class GenreRules {
  @MaxLength(255, { groups: ['name'] })
  name: string;

  constructor(entity: Genre) {
    Object.assign(this, entity);
  }
}

class GenreValidator extends ClassValidatorFields {
  validate(notification: Notification, data: any, fields?: string[]): boolean {
    const newFields = fields?.length ? fields : ['name'];
    return super.validate(notification, new GenreRules(data), newFields);
  }
}

export class GenreValidatorFactory {
  static create() {
    return new GenreValidator();
  }
}
