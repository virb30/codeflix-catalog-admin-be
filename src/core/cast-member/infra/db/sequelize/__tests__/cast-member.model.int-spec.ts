import { DataType } from 'sequelize-typescript';
import { CastMemberModel } from '../cast-member.model';
import { v4 as uuidv4 } from 'uuid';
import { setupSequelize } from '../../../../../shared/infra/testing/helpers';

describe('CastMemberModel Integration Tests', () => {
  setupSequelize({ models: [CastMemberModel] });

  test('mapping props', () => {
    const attributesMap = CastMemberModel.getAttributes();
    const attributes = Object.keys(CastMemberModel.getAttributes());
    expect(attributes).toStrictEqual([
      'cast_member_id',
      'name',
      'type',
      'created_at',
    ]);

    const categoryIdAttr = attributesMap.cast_member_id;
    expect(categoryIdAttr).toMatchObject({
      field: 'cast_member_id',
      fieldName: 'cast_member_id',
      primaryKey: true,
      type: DataType.UUID(),
    });

    const nameAttr = attributesMap.name;
    expect(nameAttr).toMatchObject({
      field: 'name',
      fieldName: 'name',
      allowNull: false,
      type: DataType.STRING(255),
    });

    const typeAttr = attributesMap.type;
    expect(typeAttr).toMatchObject({
      field: 'type',
      fieldName: 'type',
      allowNull: false,
      type: DataType.INTEGER(),
    });

    const createdAtAttr = attributesMap.created_at;
    expect(createdAtAttr).toMatchObject({
      field: 'created_at',
      fieldName: 'created_at',
      allowNull: false,
      type: DataType.DATE(3),
    });
  });

  test('create', async () => {
    const arrange = {
      cast_member_id: uuidv4(),
      name: 'John Doe',
      type: 1,
      created_at: new Date(),
    };
    const castMemberType = await CastMemberModel.create(arrange);
    expect(castMemberType.toJSON()).toStrictEqual(arrange);
  });
});
