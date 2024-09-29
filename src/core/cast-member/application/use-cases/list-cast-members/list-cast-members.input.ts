import { CastMemberTypes } from 'src/core/cast-member/domain/cast-member-type.vo';
import { SortDirection } from '../../../../shared/domain/repository/search-params';
import {
  IsInt,
  IsOptional,
  ValidateNested,
  validateSync,
} from 'class-validator';
import { SearchInput } from 'src/core/shared/application/search-input';
import { Type } from 'class-transformer';

export class ListCastMembersFilter {
  @IsOptional()
  name?: string | null;
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  type?: CastMemberTypes | null;
}

export class ListCastMembersInput
  implements SearchInput<ListCastMembersFilter>
{
  page?: number;
  per_page?: number;
  sort?: string;
  sort_dir?: SortDirection;
  @ValidateNested()
  @Type(() => ListCastMembersFilter)
  filter?: ListCastMembersFilter;
}

export class ValidateListCastMembersInput {
  static validate(input: ListCastMembersInput) {
    return validateSync(input);
  }
}
