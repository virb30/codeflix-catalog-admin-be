import { Module } from '@nestjs/common';
import { CategoriesController } from './categories.controller';
import { getModelToken, SequelizeModule } from '@nestjs/sequelize';
import { CategoryModel } from 'src/core/category/infra/db/sequelize/category.model';
import { CategorySequelizeRepository } from 'src/core/category/infra/db/sequelize/category-sequelize.repository';

@Module({
  imports: [SequelizeModule.forFeature([CategoryModel])],
  controllers: [CategoriesController],
  providers: [
    {
      provide: CategorySequelizeRepository,
      useFactory: (categoryModel: typeof CategoryModel) =>
        new CategorySequelizeRepository(categoryModel),
      inject: [getModelToken(CategoryModel)],
    },
  ],
})
export class CategoriesModule {}
