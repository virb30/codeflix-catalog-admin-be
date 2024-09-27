import type { MigrationFn } from 'umzug';
import { Sequelize, DataType } from 'sequelize-typescript';

export const up: MigrationFn<Sequelize> = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().createTable('cast_members', {
    cast_member_id: {
      type: DataType.UUID,
      allowNull: false,
      primaryKey: true,
    },
    name: {
      type: DataType.STRING(255),
      allowNull: false,
    },
    type: {
      type: DataType.INTEGER,
      allowNull: false,
    },
    created_at: {
      type: DataType.DATE(3),
      allowNull: false,
    },
  });
};
export const down: MigrationFn<Sequelize> = async ({ context: sequelize }) => {
  await sequelize.getQueryInterface().dropTable('cast_members');
};
