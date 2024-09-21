import { Uuid } from '../../shared/domain/value-objects/uuid.vo';
import { ISearchableRepository } from '../../shared/domain/repository/repository-interface';
import { SearchParams } from '../../shared/domain/repository/search-params';
import { SearchResult } from '../../shared/domain/repository/search-result';
import { CastMember } from './cast-member.entity';
import { CastMemberType } from './cast-member-type.vo';

export type CastMemberFilter = {
  type?: CastMemberType | null;
  name?: string | null;
};

export class CastMemberSearchParams extends SearchParams<CastMemberFilter> {}

export class CastMemberSearchResult extends SearchResult<CastMember> {}

export interface ICastMemberRepository
  extends ISearchableRepository<
    CastMember,
    Uuid,
    CastMemberFilter,
    CastMemberSearchParams,
    CastMemberSearchResult
  > {}
