import { CastMembersController } from '../cast-members.controller';
import { CreateCastMemberOutput } from '../../../core/cast-member/application/use-cases/create-cast-member/create-cast-member.use-case';
import { CreateCastMemberDto } from '../dto/create-cast-member.dto';
import { UpdateCastMemberOutput } from '../../../core/cast-member/application/use-cases/update-cast-member/update-cast-member.use-case';
import { UpdateCastMemberInput } from '../../../core/cast-member/application/use-cases/update-cast-member/update-cast-member.input';
import { GetCastMemberOutput } from '../../../core/cast-member/application/use-cases/get-cast-member/get-cast-member.use-case';
import { ListCastMembersOutput } from '../../../core/cast-member/application/use-cases/list-cast-members/list-cast-members.use-case';
import { SortDirection } from '../../../core/shared/domain/repository/search-params';
import {
  CastMemberType,
  CastMemberTypes,
} from '../../../core/cast-member/domain/cast-member-type.vo';
import {
  CastMemberCollectionPresenter,
  CastMemberPresenter,
} from '../cast-members.presenter';

// beforeEach(async () => {
//   const module: TestingModule = await Test.createTestingModule({
//     imports: [ConfigModule.forRoot(), DatabaseModule, CastMembersModule],
//   })
//     .overrideProvider(getModelToken(CastMemberModel))
//     .useValue({})
//     .overrideProvider('CastMemberRepository')
//     .useValue(CastMemberInMemoryRepository)
//     .compile();

//   controller = module.get<CastMembersController>(CastMembersController);
// });

describe('CastMembersController', () => {
  let controller: CastMembersController;

  beforeEach(async () => {
    controller = new CastMembersController();
  });

  it('should creates a cast member', async () => {
    const output: CreateCastMemberOutput = {
      id: '86768766-12eb-40ea-b00c-4f8a81528bd5',
      name: 'Movie',
      type: CastMemberTypes.ACTOR,
      created_at: new Date(),
    };
    const mockCreateUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(output)),
    };
    //@ts-expect-error defined part of methods
    controller['createUseCase'] = mockCreateUseCase;
    const input: CreateCastMemberDto = {
      name: 'John Doe',
      type: CastMemberTypes.ACTOR,
    };
    const presenter = await controller.create(input);
    expect(mockCreateUseCase.execute).toHaveBeenCalledWith(input);
    expect(presenter).toBeInstanceOf(CastMemberPresenter);
    expect(presenter).toStrictEqual(new CastMemberPresenter(output));
  });

  it('should deletes a cast member', async () => {
    const expectedOutput = undefined;
    const mockDeleteUseCae = {
      execute: jest.fn().mockReturnValue(Promise.resolve(expectedOutput)),
    };
    //@ts-expect-error defined part of methods
    controller['deleteUseCase'] = mockDeleteUseCae;
    const id = '86768766-12eb-40ea-b00c-4f8a81528bd5';
    expect(controller.remove(id)).toBeInstanceOf(Promise);
    const output = await controller.remove(id);
    expect(mockDeleteUseCae.execute).toHaveBeenCalledWith({ id });
    expect(output).toStrictEqual(expectedOutput);
  });

  it('should updates a cast member', async () => {
    const id = '86768766-12eb-40ea-b00c-4f8a81528bd5';
    const output: UpdateCastMemberOutput = {
      id,
      name: 'John Doe',
      type: CastMemberTypes.ACTOR,
      created_at: new Date(),
    };
    const mockUpdateUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(output)),
    };
    //@ts-expect-error defined part of methods
    controller['updateUseCase'] = mockUpdateUseCase;
    const input: Omit<UpdateCastMemberInput, 'id'> = {
      name: 'Jane Doe',
      type: CastMemberTypes.DIRECTOR,
    };
    const presenter = await controller.update(id, input);
    expect(mockUpdateUseCase.execute).toHaveBeenCalledWith({ id, ...input });
    expect(presenter).toBeInstanceOf(CastMemberPresenter);
    expect(presenter).toStrictEqual(new CastMemberPresenter(output));
  });

  it('should gets a cast member', async () => {
    const id = '86768766-12eb-40ea-b00c-4f8a81528bd5';
    const output: GetCastMemberOutput = {
      id,
      name: 'John Doe',
      type: CastMemberTypes.ACTOR,
      created_at: new Date(),
    };
    const mockGetUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(output)),
    };
    //@ts-expect-error defined part of methods
    controller['getUseCase'] = mockGetUseCase;
    const presenter = await controller.findOne(id);
    expect(mockGetUseCase.execute).toHaveBeenCalledWith({ id });
    expect(presenter).toBeInstanceOf(CastMemberPresenter);
    expect(presenter).toStrictEqual(new CastMemberPresenter(output));
  });

  it('should list cast members', async () => {
    const output: ListCastMembersOutput = {
      items: [
        {
          id: '86768766-12eb-40ea-b00c-4f8a81528bd5',
          name: 'John Doe',
          type: CastMemberTypes.DIRECTOR,
          created_at: new Date(),
        },
      ],
      current_page: 1,
      last_page: 1,
      per_page: 1,
      total: 1,
    };
    const mockListUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(output)),
    };
    //@ts-expect-error defined part of methods
    controller['listUseCase'] = mockListUseCase;
    const searchParams = {
      page: 1,
      per_page: 2,
      sort: 'name',
      sort_dir: 'desc' as SortDirection,
      filter: {
        name: 'John Doe',
        type: CastMemberType.createADirector(),
      },
    };
    const presenter = await controller.search(searchParams);
    expect(mockListUseCase.execute).toHaveBeenCalledWith(searchParams);
    expect(presenter).toBeInstanceOf(CastMemberCollectionPresenter);
    expect(presenter).toEqual(new CastMemberCollectionPresenter(output));
  });
});
