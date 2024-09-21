import { CastMember } from 'src/core/cast-member/domain/cast-member.entity';
import { SortDirection } from '../../../../shared/domain/repository/search-params';
import { Uuid } from '../../../../shared/domain/value-objects/uuid.vo';
import { InMemorySearchableRepository } from '../../../../shared/infra/db/in-memory/in-memory.repository';
import {
  CastMemberFilter,
  ICastMemberRepository,
} from '../../../../cast-member/domain/cast-member.repository';

export class CastMemberInMemoryRepository
  extends InMemorySearchableRepository<CastMember, Uuid, CastMemberFilter>
  implements ICastMemberRepository
{
  sortableFields: string[] = ['name', 'created_at'];

  protected async applyFilter(
    items: CastMember[],
    filter: CastMemberFilter,
  ): Promise<CastMember[]> {
    if (!filter) {
      return items;
    }

    return items.filter((i) => {
      const containsName =
        filter.name && i.name.toLowerCase().includes(filter.name.toLowerCase());
      const hasType = filter.type && i.type.equals(filter.type);
      return filter.name && filter.type
        ? containsName && hasType
        : filter.name
          ? containsName
          : hasType;
    });
  }

  getEntity(): new (...args: any[]) => CastMember {
    return CastMember;
  }

  protected applySort(
    items: CastMember[],
    sort: string | null,
    sort_dir: SortDirection | null,
  ): CastMember[] {
    return sort
      ? super.applySort(items, sort, sort_dir)
      : super.applySort(items, 'created_at', 'desc');
  }
}
