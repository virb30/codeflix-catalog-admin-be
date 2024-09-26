import { Transform } from 'class-transformer';
import { CreateCastMemberOutput } from '../../core/cast-member/application/use-cases/create-cast-member/create-cast-member.use-case';
import { ListCastMembersOutput } from '../../core/cast-member/application/use-cases/list-cast-members/list-cast-members.use-case';
import { CollectionPresenter } from '../shared-module/collection.presenter';
import { CastMemberTypes } from 'src/core/cast-member/domain/cast-member-type.vo';

export class CastMemberPresenter {
  id: string;
  name: string;
  type: CastMemberTypes;
  @Transform(({ value }: { value: Date }) => value.toISOString())
  created_at: Date;

  constructor(output: CreateCastMemberOutput) {
    this.id = output.id;
    this.name = output.name;
    this.type = output.type;
    this.created_at = output.created_at;
  }
}

export class CastMemberCollectionPresenter extends CollectionPresenter {
  data: CastMemberPresenter[];

  constructor(output: ListCastMembersOutput) {
    const { items, ...paginationProps } = output;
    super(paginationProps);
    this.data = items.map((item) => new CastMemberPresenter(item));
  }
}
