import { Uuid } from '../../shared/domain/value-objects/uuid.vo';
import { ISearchableRepository } from '../../shared/domain/repository/repository-interface';
import {
  SearchParams,
  SearchParamsConstructorProps,
} from '../../shared/domain/repository/search-params';
import { SearchResult } from '../../shared/domain/repository/search-result';
import { CastMember } from './cast-member.entity';
import {
  CastMemberType,
  CastMemberTypes,
  InvalidCastMemberTypeError,
} from './cast-member-type.vo';
import { instanceToPlain } from 'class-transformer';

export type CastMemberFilter = {
  type?: CastMemberType | null;
  name?: string | null;
};

export class CastMemberSearchParams extends SearchParams<CastMemberFilter> {
  constructor(props: SearchParamsConstructorProps<CastMemberFilter> = {}) {
    super(props);
  }

  static create(
    props: Omit<SearchParamsConstructorProps<CastMemberFilter>, 'filter'> & {
      filter?: {
        name?: string | null;
        type?: CastMemberTypes | null;
      };
    } = {},
  ) {
    let type = null;
    try {
      type = props?.filter?.type
        ? new CastMemberType(+props.filter.type)
        : null;
    } catch (e) {
      if (e instanceof InvalidCastMemberTypeError) type = null;
    }

    return new CastMemberSearchParams({
      ...props,
      filter: {
        name: props.filter?.name,
        type,
      },
    });
  }

  get filter(): CastMemberFilter | null {
    return this._filter;
  }

  protected set filter(value: CastMemberFilter | null) {
    const _value =
      !value || (value as unknown) === '' || typeof value !== 'object'
        ? null
        : value;

    const filter = {
      ...(_value?.name && { name: `${_value?.name}` }),
      ...(_value?.type && { type: _value.type }),
    };

    this._filter = Object.keys(filter).length === 0 ? null : filter;
  }
}

export class CastMemberSearchResult extends SearchResult<CastMember> {}

export interface ICastMemberRepository
  extends ISearchableRepository<
    CastMember,
    Uuid,
    CastMemberFilter,
    CastMemberSearchParams,
    CastMemberSearchResult
  > {}
