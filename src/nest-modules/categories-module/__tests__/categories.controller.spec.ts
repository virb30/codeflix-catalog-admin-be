import { CategoriesController } from '../categories.controller';
import { CreateCategoryOutput } from '../../../core/category/application/use-cases/create-category/create-category.use-case';
import { CreateCategoryDto } from '../dto/create-category.dto';
import {
  CategoryCollectionPresenter,
  CategoryPresenter,
} from '../categories.presenter';
import { UpdateCategoryOutput } from '../../../core/category/application/use-cases/update-category/update-category.use-case';
import { UpdateCategoryInput } from '../../../core/category/application/use-cases/update-category/update-category.input';
import { GetCategoryOutput } from '../../../core/category/application/use-cases/get-category/get-category.use-case';
import { ListCategoriesOutput } from '../../../core/category/application/use-cases/list-categories/list-categories.use-case';
import { SortDirection } from '../../../core/shared/domain/repository/search-params';

// beforeEach(async () => {
//   const module: TestingModule = await Test.createTestingModule({
//     imports: [ConfigModule.forRoot(), DatabaseModule, CategoriesModule],
//   })
//     .overrideProvider(getModelToken(CategoryModel))
//     .useValue({})
//     .overrideProvider('CategoryRepository')
//     .useValue(CategoryInMemoryRepository)
//     .compile();

//   controller = module.get<CategoriesController>(CategoriesController);
// });

describe('CategoriesController', () => {
  let controller: CategoriesController;

  beforeEach(async () => {
    controller = new CategoriesController();
  });

  it('should creates a category', async () => {
    const output: CreateCategoryOutput = {
      id: '86768766-12eb-40ea-b00c-4f8a81528bd5',
      name: 'Movie',
      description: 'some description',
      is_active: true,
      created_at: new Date(),
    };
    const mockCreateUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(output)),
    };
    //@ts-expect-error defined part of methods
    controller['createUseCase'] = mockCreateUseCase;
    const input: CreateCategoryDto = {
      name: 'Movie',
      description: 'some description',
      is_active: true,
    };
    const presenter = await controller.create(input);
    expect(mockCreateUseCase.execute).toHaveBeenCalledWith(input);
    expect(presenter).toBeInstanceOf(CategoryPresenter);
    expect(presenter).toStrictEqual(new CategoryPresenter(output));
  });

  it('should deletes a category', async () => {
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

  it('should updates a category', async () => {
    const id = '86768766-12eb-40ea-b00c-4f8a81528bd5';
    const output: UpdateCategoryOutput = {
      id,
      name: 'Movie',
      description: 'some description',
      is_active: true,
      created_at: new Date(),
    };
    const mockUpdateUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(output)),
    };
    //@ts-expect-error defined part of methods
    controller['updateUseCase'] = mockUpdateUseCase;
    const input: Omit<UpdateCategoryInput, 'id'> = {
      name: 'Movie',
      description: 'some description',
      is_active: true,
    };
    const presenter = await controller.update(id, input);
    expect(mockUpdateUseCase.execute).toHaveBeenCalledWith({ id, ...input });
    expect(presenter).toBeInstanceOf(CategoryPresenter);
    expect(presenter).toStrictEqual(new CategoryPresenter(output));
  });

  it('should gets a category', async () => {
    const id = '86768766-12eb-40ea-b00c-4f8a81528bd5';
    const output: GetCategoryOutput = {
      id,
      name: 'Movie',
      description: 'some description',
      is_active: true,
      created_at: new Date(),
    };
    const mockGetUseCase = {
      execute: jest.fn().mockReturnValue(Promise.resolve(output)),
    };
    //@ts-expect-error defined part of methods
    controller['getUseCase'] = mockGetUseCase;
    const presenter = await controller.findOne(id);
    expect(mockGetUseCase.execute).toHaveBeenCalledWith({ id });
    expect(presenter).toBeInstanceOf(CategoryPresenter);
    expect(presenter).toStrictEqual(new CategoryPresenter(output));
  });

  it('should list categories', async () => {
    const output: ListCategoriesOutput = {
      items: [
        {
          id: '86768766-12eb-40ea-b00c-4f8a81528bd5',
          name: 'Movie',
          description: 'some description',
          is_active: true,
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
      filter: 'test',
    };
    const presenter = await controller.search(searchParams);
    expect(mockListUseCase.execute).toHaveBeenCalledWith(searchParams);
    expect(presenter).toBeInstanceOf(CategoryCollectionPresenter);
    expect(presenter).toEqual(new CategoryCollectionPresenter(output));
  });
});
