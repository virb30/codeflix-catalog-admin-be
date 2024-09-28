import { CastMemberModel } from '../cast-member.model';
import { CastMemberSequelizeRepository } from '../cast-member-sequelize.repository';
import {
  CastMember,
  CastMemberId,
} from '../../../../domain/cast-member.aggregate';
import { NotFoundError } from '../../../../../shared/domain/errors/not-found.error';
import { CastMemberModelMapper } from '../cast-member-model-mapper';
import {
  CastMemberSearchParams,
  CastMemberSearchResult,
} from '../../../../domain/cast-member.repository';
import { setupSequelize } from '../../../../../shared/infra/testing/helpers';
import {
  CastMemberType,
  CastMemberTypes,
} from 'src/core/cast-member/domain/cast-member-type.vo';

describe('CastMemberSequelizeRepository Integration Test', () => {
  let repository: CastMemberSequelizeRepository;
  setupSequelize({ models: [CastMemberModel] });

  beforeEach(async () => {
    repository = new CastMemberSequelizeRepository(CastMemberModel);
  });

  it('should insert a new cast member', async () => {
    const castMember = CastMember.fake().aCastMember().build();
    await repository.insert(castMember);

    const model = await CastMemberModel.findByPk(castMember.cast_member_id.id);
    expect(model!.toJSON()).toMatchObject({
      cast_member_id: castMember.cast_member_id.id,
      name: castMember.name,
      type: castMember.type.type,
      created_at: castMember.created_at,
    });
  });

  it('should find a cast member by id', async () => {
    let castMemberFound = await repository.findById(new CastMemberId());
    expect(castMemberFound).toBeNull();

    const castMember = CastMember.fake().aCastMember().build();
    await repository.insert(castMember);
    castMemberFound = await repository.findById(castMember.cast_member_id);
    expect(castMember.toJSON()).toStrictEqual(castMemberFound!.toJSON());
  });

  it('should return all cast members', async () => {
    const castMember = CastMember.fake().aCastMember().build();
    await repository.insert(castMember);
    const castMembers = await repository.findAll();
    expect(castMembers).toHaveLength(1);
  });

  it('should throw error on update when cast member not found', async () => {
    const castMember = CastMember.fake().aCastMember().build();
    await expect(repository.update(castMember)).rejects.toThrow(
      new NotFoundError(castMember.cast_member_id.id, CastMember),
    );
  });

  it('should update a cast member', async () => {
    const castMember = CastMember.fake().aCastMember().build();
    await repository.insert(castMember);

    castMember.changeName('CastMember updated');
    await repository.update(castMember);

    const castMemberFound = await repository.findById(
      castMember.cast_member_id,
    );
    expect(castMember.toJSON()).toStrictEqual(castMemberFound!.toJSON());
  });

  it('should throw error on delete when a cast member not found', async () => {
    const castMemberId = new CastMemberId();
    await expect(repository.delete(castMemberId)).rejects.toThrow(
      new NotFoundError(castMemberId.id, CastMember),
    );
  });

  it('should delete a cast member', async () => {
    const castMember = CastMember.fake().aCastMember().build();
    await repository.insert(castMember);

    await repository.delete(castMember.cast_member_id);
    await expect(
      repository.findById(castMember.cast_member_id),
    ).resolves.toBeNull();
  });

  describe('search method tests', () => {
    it('should only apply paginate when other params are null', async () => {
      const created_at = new Date();
      const castMembers = CastMember.fake()
        .theCastMembers(16)
        .withName('John Doe')
        .withType(CastMemberType.createADirector())
        .withCreatedAt(created_at)
        .build();
      await repository.bulkInsert(castMembers);
      const spyToEntity = jest.spyOn(CastMemberModelMapper, 'toEntity');
      const searchOutput = await repository.search(
        CastMemberSearchParams.create(),
      );
      expect(searchOutput).toBeInstanceOf(CastMemberSearchResult);
      expect(spyToEntity).toHaveBeenCalledTimes(15);
      expect(searchOutput.toJSON()).toMatchObject({
        total: 16,
        current_page: 1,
        last_page: 2,
        per_page: 15,
      });
      searchOutput.items.forEach((item) => {
        expect(item).toBeInstanceOf(CastMember);
        expect(item.cast_member_id).toBeDefined();
      });
      const items = searchOutput.items.map((item) => item.toJSON());
      expect(items).toMatchObject(
        new Array(15).fill({
          name: 'John Doe',
          type: CastMemberTypes.DIRECTOR,
          created_at,
        }),
      );
    });

    it('should order by created_at DESC when search params are null', async () => {
      const created_at = new Date();
      const castMembers = CastMember.fake()
        .theCastMembers(16)
        .withName((index) => `Movie ${index}`)
        .withCreatedAt((index) => new Date(created_at.getTime() + index))
        .build();
      await repository.bulkInsert(castMembers);
      const searchOutput = await repository.search(
        CastMemberSearchParams.create(),
      );
      const items = searchOutput.items.map((item) => item.toJSON());
      [...items].reverse().forEach((item, index) => {
        expect(`${item.name}`).toBe(`${castMembers[index + 1].name}`);
      });
    });

    it('should apply paginate and filter', async () => {
      const castMembers = [
        CastMember.fake()
          .aCastMember()
          .withName('test')
          .withType(CastMemberType.createADirector())
          .withCreatedAt(new Date(new Date().getTime() + 5000))
          .build(),
        CastMember.fake()
          .aCastMember()
          .withName('a')
          .withType(CastMemberType.createADirector())
          .withCreatedAt(new Date(new Date().getTime() + 4000))
          .build(),
        CastMember.fake()
          .aCastMember()
          .withName('TEST')
          .withType(CastMemberType.createADirector())
          .withCreatedAt(new Date(new Date().getTime() + 3000))
          .build(),
        CastMember.fake()
          .aCastMember()
          .withName('TeSt')
          .withType(CastMemberType.createAnActor())
          .withCreatedAt(new Date(new Date().getTime() + 1000))
          .build(),
      ];

      await repository.bulkInsert(castMembers);

      let searchOutput = await repository.search(
        CastMemberSearchParams.create({
          page: 1,
          per_page: 2,
          filter: {
            name: 'TEST',
          },
        }),
      );

      expect(searchOutput.toJSON(true)).toMatchObject(
        new CastMemberSearchResult({
          items: [castMembers[0], castMembers[2]],
          total: 3,
          current_page: 1,
          per_page: 2,
        }).toJSON(true),
      );

      searchOutput = await repository.search(
        CastMemberSearchParams.create({
          page: 2,
          per_page: 2,
          filter: {
            name: 'TEST',
          },
        }),
      );

      expect(searchOutput.toJSON(true)).toMatchObject(
        new CastMemberSearchResult({
          items: [castMembers[3]],
          total: 3,
          current_page: 2,
          per_page: 2,
        }).toJSON(true),
      );

      searchOutput = await repository.search(
        CastMemberSearchParams.create({
          page: 1,
          per_page: 2,
          filter: {
            name: 'TEST',
            type: CastMemberType.createADirector().type,
          },
        }),
      );

      expect(searchOutput.toJSON(true)).toMatchObject(
        new CastMemberSearchResult({
          items: [castMembers[0], castMembers[2]],
          total: 2,
          current_page: 1,
          per_page: 2,
        }).toJSON(true),
      );
    });

    it('should paginate and sort', async () => {
      expect(repository.sortableFields).toStrictEqual(['name', 'created_at']);

      const categories = [
        CastMember.fake().aCastMember().withName('b').build(),
        CastMember.fake().aCastMember().withName('a').build(),
        CastMember.fake().aCastMember().withName('d').build(),
        CastMember.fake().aCastMember().withName('e').build(),
        CastMember.fake().aCastMember().withName('c').build(),
      ];
      await repository.bulkInsert(categories);

      const arrange = [
        {
          params: CastMemberSearchParams.create({
            page: 1,
            per_page: 2,
            sort: 'name',
          }),
          result: new CastMemberSearchResult({
            items: [categories[1], categories[0]],
            total: 5,
            current_page: 1,
            per_page: 2,
          }),
        },
        {
          params: CastMemberSearchParams.create({
            page: 2,
            per_page: 2,
            sort: 'name',
          }),
          result: new CastMemberSearchResult({
            items: [categories[4], categories[2]],
            total: 5,
            current_page: 2,
            per_page: 2,
          }),
        },
        {
          params: CastMemberSearchParams.create({
            page: 1,
            per_page: 2,
            sort: 'name',
            sort_dir: 'desc',
          }),
          result: new CastMemberSearchResult({
            items: [categories[3], categories[2]],
            total: 5,
            current_page: 1,
            per_page: 2,
          }),
        },
        {
          params: CastMemberSearchParams.create({
            page: 2,
            per_page: 2,
            sort: 'name',
            sort_dir: 'desc',
          }),
          result: new CastMemberSearchResult({
            items: [categories[4], categories[0]],
            total: 5,
            current_page: 2,
            per_page: 2,
          }),
        },
      ];

      for (const i of arrange) {
        const result = await repository.search(i.params);
        expect(result.toJSON(true)).toMatchObject(i.result.toJSON(true));
      }
    });

    describe('should search using filter, sort and paginate', () => {
      const categories = [
        CastMember.fake().aCastMember().withName('test').build(),
        CastMember.fake().aCastMember().withName('a').build(),
        CastMember.fake().aCastMember().withName('TEST').build(),
        CastMember.fake().aCastMember().withName('e').build(),
        CastMember.fake().aCastMember().withName('TeSt').build(),
      ];

      const arrange = [
        {
          search_params: CastMemberSearchParams.create({
            page: 1,
            per_page: 2,
            sort: 'name',
            filter: {
              name: 'TEST',
            },
          }),
          search_result: new CastMemberSearchResult({
            items: [categories[2], categories[4]],
            total: 3,
            current_page: 1,
            per_page: 2,
          }),
        },
        {
          search_params: CastMemberSearchParams.create({
            page: 2,
            per_page: 2,
            sort: 'name',
            filter: {
              name: 'TEST',
            },
          }),
          search_result: new CastMemberSearchResult({
            items: [categories[0]],
            total: 3,
            current_page: 2,
            per_page: 2,
          }),
        },
      ];

      beforeEach(async () => {
        await repository.bulkInsert(categories);
      });

      test.each(arrange)(
        'when value is $search_params',
        async ({ search_params, search_result }) => {
          const result = await repository.search(search_params);
          expect(result.toJSON(true)).toMatchObject(search_result.toJSON(true));
        },
      );
    });
  });
});
