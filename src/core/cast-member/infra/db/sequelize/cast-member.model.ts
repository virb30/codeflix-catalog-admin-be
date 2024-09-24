import {
  Column,
  DataType,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';

type CastMemberModelProps = {
  cast_member_id: string;
  name: string;
  type: number;
  created_at: Date;
};

@Table({ tableName: 'cast_members', timestamps: false })
export class CastMemberModel extends Model<CastMemberModelProps> {
  @PrimaryKey
  @Column({ type: DataType.UUID })
  declare cast_member_id: string;

  @Column({ allowNull: false, type: DataType.STRING(255) })
  declare name: string;

  @Column({ allowNull: false, type: DataType.INTEGER() })
  declare type: string | null;

  @Column({ allowNull: false, type: DataType.DATE(3) })
  declare created_at: Date;
}
