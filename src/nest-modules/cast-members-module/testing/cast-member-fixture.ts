import { SortDirection } from 'src/core/shared/domain/repository/search-params';
import {
  CastMemberType,
  CastMemberTypes,
} from '../../../core/cast-member/domain/cast-member-type.vo';
import { CastMember } from '../../../core/cast-member/domain/cast-member.aggregate';

const _keysInResponse = ['id', 'name', 'type', 'created_at'];

export class GetCastMemberFixture {
  static keysInResponse = _keysInResponse;
}

export class CreateCastMemberFixture {
  static keysInResponse = _keysInResponse;

  static arrangeForCreate() {
    const faker = CastMember.fake()
      .aCastMember()
      .withName('John Doe')
      .withType(CastMemberType.createADirector());
    return [
      {
        send_data: {
          name: faker.name,
          type: faker.type.type,
        },
        expected: {
          name: faker.name,
          type: faker.type.type,
        },
      },
    ];
  }

  static arrangeInvalidRequest() {
    const defaultExpected = {
      statusCode: 422,
      error: 'Unprocessable Entity',
    };

    return {
      EMPTY: {
        send_data: {},
        expected: {
          message: [
            'name should not be empty',
            'name must be a string',
            'type should not be empty',
            'type must be an integer number',
          ],
          ...defaultExpected,
        },
      },
      NAME_UNDEFINED: {
        send_data: {
          name: undefined,
          type: 1,
        },
        expected: {
          message: ['name should not be empty', 'name must be a string'],
          ...defaultExpected,
        },
      },
      NAME_NULL: {
        send_data: {
          name: null,
          type: 1,
        },
        expected: {
          message: ['name should not be empty', 'name must be a string'],
          ...defaultExpected,
        },
      },
      NAME_EMPTY: {
        send_data: {
          name: '',
          type: 1,
        },
        expected: {
          message: ['name should not be empty'],
          ...defaultExpected,
        },
      },
      TYPE_UNDEFINED: {
        send_data: {
          name: 'John Doe',
          type: undefined,
        },
        expected: {
          message: [
            'type should not be empty',
            'type must be an integer number',
          ],
          ...defaultExpected,
        },
      },
      TYPE_NULL: {
        send_data: {
          name: 'John Doe',
          type: null,
        },
        expected: {
          message: [
            'type should not be empty',
            'type must be an integer number',
          ],
          ...defaultExpected,
        },
      },
    };
  }

  static arrangeForEntityValidationError() {
    const faker = CastMember.fake().aCastMember();
    const defaultExpected = {
      statusCode: 422,
      error: 'Unprocessable Entity',
    };

    return {
      NAME_TOO_LONG: {
        send_data: {
          name: faker.withInvalidNameTooLong().name,
          type: faker.type.type,
        },
        expected: {
          message: ['name must be shorter than or equal to 255 characters'],
          ...defaultExpected,
        },
      },
    };
  }

  static arrangeForInvalidCastMemberTypeError() {
    const faker = CastMember.fake().aCastMember();
    const defaultExpected = {
      statusCode: 422,
      error: 'Unprocessable Entity',
    };

    return {
      INVALID_TYPE: {
        send_data: {
          name: faker.name,
          type: 9999,
        },
        expected: {
          message: ['Invalid cast member type: 9999'],
          ...defaultExpected,
        },
      },
    };
  }
}

export class UpdateCastMemberFixture {
  static keysInResponse = _keysInResponse;

  static arrangeForUpdate() {
    const faker = CastMember.fake()
      .aCastMember()
      .withName('John Doe')
      .withType(CastMemberType.createADirector());
    return [
      {
        send_data: {
          name: faker.name,
          type: faker.type.type,
        },
        expected: {
          name: faker.name,
          type: faker.type.type,
        },
      },
      {
        send_data: {
          name: faker.name,
        },
        expected: {
          name: faker.name,
        },
      },
      {
        send_data: {
          type: faker.type.type,
        },
        expected: {
          type: faker.type.type,
        },
      },
    ];
  }

  static arrangeInvalidRequest() {
    const defaultExpected = {
      statusCode: 422,
      error: 'Unprocessable Entity',
    };

    return {
      TYPE_IS_INVALID: {
        send_data: {
          type: 'invalid type',
        },
        expected: {
          message: ['type must be an integer number'],
          ...defaultExpected,
        },
      },
    };
  }

  static arrangeForEntityValidationError() {
    const faker = CastMember.fake().aCastMember();
    const defaultExpected = {
      statusCode: 422,
      error: 'Unprocessable Entity',
    };

    return {
      NAME_TOO_LONG: {
        send_data: {
          name: faker.withInvalidNameTooLong().name,
        },
        expected: {
          message: ['name must be shorter than or equal to 255 characters'],
          ...defaultExpected,
        },
      },
    };
  }

  static arrangeForInvalidCastMemberTypeError() {
    const faker = CastMember.fake().aCastMember();
    const defaultExpected = {
      statusCode: 422,
      error: 'Unprocessable Entity',
    };

    return {
      INVALID_TYPE: {
        send_data: {
          name: faker.name,
          type: 9999,
        },
        expected: {
          message: ['Invalid cast member type: 9999'],
          ...defaultExpected,
        },
      },
    };
  }
}

export class ListCastMembersFixture {
  static arrangeIncrementedWithCreatedAt() {
    const _entities = CastMember.fake()
      .theCastMembers(4)
      .withName((i) => i + '')
      .withCreatedAt((i) => new Date(new Date().getTime() + i * 2000))
      .build();

    const entitiesMap = {
      first: _entities[0],
      second: _entities[1],
      third: _entities[2],
      fourth: _entities[3],
    };

    const arrange = [
      {
        send_data: {},
        expected: {
          entities: [
            entitiesMap.fourth,
            entitiesMap.third,
            entitiesMap.second,
            entitiesMap.first,
          ],
          meta: {
            current_page: 1,
            last_page: 1,
            per_page: 15,
            total: 4,
          },
        },
      },
      {
        send_data: {
          page: 1,
          per_page: 2,
        },
        expected: {
          entities: [entitiesMap.fourth, entitiesMap.third],
          meta: {
            current_page: 1,
            last_page: 2,
            per_page: 2,
            total: 4,
          },
        },
      },
      {
        send_data: {
          page: 2,
          per_page: 2,
        },
        expected: {
          entities: [entitiesMap.second, entitiesMap.first],
          meta: {
            current_page: 2,
            last_page: 2,
            per_page: 2,
            total: 4,
          },
        },
      },
    ];

    return { arrange, entitiesMap };
  }

  static arrangeUnsorted() {
    const actor = CastMember.fake()
      .aCastMember()
      .withType(CastMemberType.createAnActor());
    const director = CastMember.fake()
      .aCastMember()
      .withType(CastMemberType.createADirector());
    const created_at = new Date();

    const entitiesMap = {
      actor_a: actor
        .withName('a')
        .withCreatedAt(new Date(created_at.getTime() + 1000))
        .build(),
      actor_AAA: actor
        .withName('AAA')
        .withCreatedAt(new Date(created_at.getTime() + 2000))
        .build(),
      actor_AaA: actor
        .withName('AaA')
        .withCreatedAt(new Date(created_at.getTime() + 3000))
        .build(),
      actor_b: actor
        .withName('b')
        .withCreatedAt(new Date(created_at.getTime() + 4000))
        .build(),
      actor_c: actor
        .withName('c')
        .withCreatedAt(new Date(created_at.getTime() + 5000))
        .build(),
      director_f: director
        .withName('f')
        .withCreatedAt(new Date(created_at.getTime() + 6000))
        .build(),
      director_e: director
        .withName('e')
        .withCreatedAt(new Date(created_at.getTime() + 7000))
        .build(),
    };

    const arrange_filter_by_name_sort_name_asc = [
      {
        send_data: {
          page: 1,
          per_page: 2,
          sort: 'name',
          filter: { name: 'a' },
        },
        expected: {
          entities: [entitiesMap.actor_AAA, entitiesMap.actor_AaA],
          meta: {
            total: 3,
            current_page: 1,
            last_page: 2,
            per_page: 2,
          },
        },
      },
      {
        send_data: {
          page: 2,
          per_page: 2,
          sort: 'name',
          filter: { name: 'a' },
        },
        expected: {
          entities: [entitiesMap.actor_a],
          meta: {
            total: 3,
            current_page: 2,
            last_page: 2,
            per_page: 2,
          },
        },
      },
    ];

    const arrange_filter_actors_sort_by_created_desc = [
      {
        send_data: {
          page: 1,
          per_page: 2,
          sort: 'created_at',
          sort_dir: 'desc' as SortDirection,
          filter: { type: CastMemberTypes.ACTOR },
        },
        expected: {
          entities: [entitiesMap.actor_c, entitiesMap.actor_b],
          meta: {
            total: 5,
            current_page: 1,
            last_page: 3,
            per_page: 2,
          },
        },
      },
      {
        send_data: {
          page: 2,
          per_page: 2,
          sort: 'created_at',
          sort_dir: 'desc' as SortDirection,
          filter: { type: CastMemberTypes.ACTOR },
        },
        expected: {
          entities: [entitiesMap.actor_AaA, entitiesMap.actor_AAA],
          meta: {
            total: 5,
            current_page: 2,
            last_page: 3,
            per_page: 2,
          },
        },
      },
    ];

    const arrange_filter_directors_sort_by_created_desc = [
      {
        send_data: {
          page: 1,
          per_page: 2,
          sort: 'created_at',
          sort_dir: 'desc' as SortDirection,
          filter: { type: CastMemberTypes.DIRECTOR },
        },
        expected: {
          entities: [entitiesMap.director_e, entitiesMap.director_f],
          meta: {
            total: 2,
            current_page: 1,
            last_page: 1,
            per_page: 2,
          },
        },
      },
    ];

    return {
      arrange: [
        ...arrange_filter_by_name_sort_name_asc,
        ...arrange_filter_actors_sort_by_created_desc,
        ...arrange_filter_directors_sort_by_created_desc,
      ],
      entitiesMap,
    };
  }
}
