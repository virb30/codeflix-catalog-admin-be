import { CastMemberTypes } from 'src/core/cast-member/domain/cast-member-type.vo';
import { SortDirection } from '../../../../shared/domain/repository/search-params';
import { IsEnum, IsInt, ValidateNested, validateSync } from 'class-validator';
import { Type } from 'class-transformer';

export class ListCastMembersFilter {
  name?: string | null;
  @IsInt()
  @IsEnum(CastMemberTypes)
  @Type(() => Number)
  type?: CastMemberTypes | null;
}

export class ListCastMembersInput {
  page?: number;
  per_page?: number;
  sort?: string;
  sort_dir?: SortDirection;
  @ValidateNested()
  filter?: ListCastMembersFilter;
}

export class ValidateListCastMembersInput {
  static validate(input: ListCastMembersInput) {
    return validateSync(input);
  }
}
