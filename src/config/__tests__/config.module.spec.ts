import Joi from 'joi';
import { CONFIG_DB_SCHEMA } from '../config.module';
import { Test } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';

function expectValidate(schema: Joi.Schema, value: any) {
  return expect(schema.validate(value, { abortEarly: false }).error.message);
}

describe('Schema Unit Tests', () => {
  describe('DB Schema', () => {
    const schema = Joi.object({
      ...CONFIG_DB_SCHEMA,
    });

    describe('DB_VENDOR', () => {
      test('invalid cases', () => {
        expectValidate(schema, {}).toContain('"DB_VENDOR" is required');

        expectValidate(schema, { DB_VENDOR: 5 }).toContain(
          '"DB_VENDOR" must be one of [mysql, sqlite]',
        );
      });

      const validVendors = ['mysql', 'sqlite'];

      test.each(validVendors)('valid cases with %s', (vendor) => {
        expectValidate(schema, { DB_VENDOR: vendor }).not.toContain(
          'DB_VENDOR',
        );
      });
    });

    describe('DB_HOST', () => {
      test('invalid cases', () => {
        expectValidate(schema, {}).toContain('"DB_HOST" is required');

        expectValidate(schema, { DB_HOST: 1 }).toContain(
          '"DB_HOST" must be a string',
        );
      });

      const arrange = ['some value'];

      test.each(arrange)('valid cases with %s', (value) => {
        expectValidate(schema, { DB_HOST: value }).not.toContain('DB_HOST');
      });
    });

    describe('DB_DATABASE', () => {
      test('invalid cases', () => {
        expectValidate(schema, { DB_VENDOR: 'sqlite' }).not.toContain(
          '"DB_DATABASE" is required',
        );

        expectValidate(schema, { DB_VENDOR: 'mysql' }).toContain(
          '"DB_DATABASE" is required',
        );

        expectValidate(schema, { DB_DATABASE: 3 }).toContain(
          '"DB_DATABASE" must be a string',
        );
      });

      const arrange = [
        { DB_VENDOR: 'sqlite' },
        { DB_VENDOR: 'sqlite', DB_DATABASE: 'some value' },
        { DB_VENDOR: 'mysql', DB_DATABASE: 'some value' },
      ];

      test.each(arrange)('valid cases with %o', (value) => {
        expectValidate(schema, value).not.toContain('DB_DATABASE');
      });
    });

    describe('DB_USERNAME', () => {
      test('invalid cases', () => {
        expectValidate(schema, { DB_VENDOR: 'sqlite' }).not.toContain(
          '"DB_USERNAME" is required',
        );

        expectValidate(schema, { DB_VENDOR: 'mysql' }).toContain(
          '"DB_USERNAME" is required',
        );

        expectValidate(schema, { DB_USERNAME: 3 }).toContain(
          '"DB_USERNAME" must be a string',
        );
      });

      const arrange = [
        { DB_VENDOR: 'sqlite' },
        { DB_VENDOR: 'sqlite', DB_USERNAME: 'some value' },
        { DB_VENDOR: 'mysql', DB_USERNAME: 'some value' },
      ];

      test.each(arrange)('valid cases with %o', (value) => {
        expectValidate(schema, value).not.toContain('DB_USERNAME');
      });
    });

    describe('DB_PASSWORD', () => {
      test('invalid cases', () => {
        expectValidate(schema, { DB_VENDOR: 'sqlite' }).not.toContain(
          '"DB_PASSWORD" is required',
        );

        expectValidate(schema, { DB_VENDOR: 'mysql' }).toContain(
          '"DB_PASSWORD" is required',
        );

        expectValidate(schema, { DB_PASSWORD: 3 }).toContain(
          '"DB_PASSWORD" must be a string',
        );
      });

      const arrange = [
        { DB_VENDOR: 'sqlite' },
        { DB_VENDOR: 'sqlite', DB_PASSWORD: 'some value' },
        { DB_VENDOR: 'mysql', DB_PASSWORD: 'some value' },
      ];

      test.each(arrange)('valid cases with %o', (value) => {
        expectValidate(schema, value).not.toContain('DB_PASSWORD');
      });
    });

    describe('DB_PORT', () => {
      test('invalid cases', () => {
        expectValidate(schema, { DB_VENDOR: 'sqlite' }).not.toContain(
          '"DB_PORT" is required',
        );

        expectValidate(schema, { DB_VENDOR: 'mysql' }).toContain(
          '"DB_PORT" is required',
        );

        expectValidate(schema, { DB_PORT: 'a' }).toContain(
          '"DB_PORT" must be a number',
        );

        expectValidate(schema, { DB_PORT: '1.2' }).toContain(
          '"DB_PORT" must be an integer',
        );
      });

      const arrange = [
        { DB_VENDOR: 'sqlite' },
        { DB_VENDOR: 'sqlite', DB_PORT: 1 },
        { DB_VENDOR: 'mysql', DB_PORT: 2 },
      ];

      test.each(arrange)('valid cases with %o', (value) => {
        expectValidate(schema, value).not.toContain('DB_PORT');
      });
    });

    describe('DB_LOGGING', () => {
      test('invalid cases', () => {
        expectValidate(schema, {}).toContain('"DB_LOGGING" is required');
      });

      const arrange = [{ DB_LOGGING: true }, { DB_LOGGING: false }];

      test.each(arrange)('valid cases with %o', (value) => {
        expectValidate(schema, value).not.toContain('DB_LOGGING');
      });
    });

    describe('DB_AUTO_LOAD_MODELS', () => {
      test('invalid cases', () => {
        expectValidate(schema, {}).toContain(
          '"DB_AUTO_LOAD_MODELS" is required',
        );
      });

      const arrange = [
        { DB_AUTO_LOAD_MODELS: true },
        { DB_AUTO_LOAD_MODELS: false },
      ];

      test.each(arrange)('valid cases with %o', (value) => {
        expectValidate(schema, value).not.toContain('DB_AUTO_LOAD_MODELS');
      });
    });
  });
});

describe('ConfigModule Unit Tests', () => {
  it('should throw an error when env vars are invalid', () => {
    try {
      Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            envFilePath: join(__dirname, '.env.fake'),
          }),
        ],
      });
    } catch (e) {
      expect(e.message).toContain('"DB_VENDOR" must be one of [mysql, sqlite');
    }
  });

  it('should be valid', () => {
    const module = Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
    });

    expect(module).toBeDefined();
  });
});
