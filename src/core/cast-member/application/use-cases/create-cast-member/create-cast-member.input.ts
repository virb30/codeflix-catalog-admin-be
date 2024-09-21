import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsString,
  validateSync,
} from 'class-validator';
import { CastMemberType } from '../../../domain/cast-member-type.vo';

export type CreateCastMemberInputConstructorProps = {
  name: string;
  type: number;
};

export class CreateCastMemberInput {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsIn(Object.values(CastMemberType))
  type: number;

  constructor(props: CreateCastMemberInputConstructorProps) {
    if (!props) return;
    this.name = props.name;
    this.type = props.type;
  }
}

export class ValidateCreateCastMemberInput {
  static validate(input: CreateCastMemberInput) {
    return validateSync(input);
  }
}
