import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  validateSync,
} from 'class-validator';
import { CastMemberType } from '../../../domain/cast-member-type.vo';

export type UpdateCastMemberInputConstructorProps = {
  id: string;
  name?: string;
  type?: number;
};

export class UpdateCastMemberInput {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsNumber()
  @IsIn(Object.values(CastMemberType))
  @IsOptional()
  type?: number;

  constructor(props: UpdateCastMemberInputConstructorProps) {
    if (!props) return;
    this.name = props.name;
    this.type = props.type;
  }
}

export class ValidateUpdateCastMemberInput {
  static validate(input: UpdateCastMemberInput) {
    return validateSync(input);
  }
}
