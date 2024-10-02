import { SortDirection } from '../../../../shared/domain/repository/search-params';
import { InMemorySearchableRepository } from '../../../../shared/infra/db/in-memory/in-memory.repository';
import { Genre, GenreId } from '../../../domain/genre.aggregate';
import {
  GenreFilter,
  IGenreRepository,
} from '../../../domain/genre.repository';

export class GenreInMemoryRepository
  extends InMemorySearchableRepository<Genre, GenreId, GenreFilter>
  implements IGenreRepository
{
  sortableFields: string[] = ['name', 'created_at'];

  protected async applyFilter(
    items: Genre[],
    filter: GenreFilter | null,
  ): Promise<Genre[]> {
    if (!filter) {
      return items;
    }

    return items.filter((i) => {
      const contaisName =
        filter.name && i.name.toLowerCase().includes(filter.name.toLowerCase());
      const containsCategoriesId =
        filter.categories_id &&
        filter.categories_id.some((c) => i.categories_id.has(c.id));
      return filter.name && filter.categories_id
        ? contaisName && containsCategoriesId
        : filter.name
          ? contaisName
          : containsCategoriesId;
    });
  }

  getEntity(): new (...args: any[]) => Genre {
    return Genre;
  }

  protected applySort(
    items: Genre[],
    sort: string | null,
    sort_dir: SortDirection | null,
  ): Genre[] {
    return sort
      ? super.applySort(items, sort, sort_dir)
      : super.applySort(items, 'created_at', 'desc');
  }
}
