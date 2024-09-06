import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesModule } from './categories.module';
import { DatabaseModule } from '../database/database.module';
import { ConfigModule } from '../config/config.module';
import { ConfigService } from '@nestjs/config';

describe('CategoriesController', () => {
  let controller: CategoriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot(), DatabaseModule, CategoriesModule],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
    console.log(module.get(ConfigService));
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
