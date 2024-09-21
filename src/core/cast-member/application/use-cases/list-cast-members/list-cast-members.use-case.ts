import { ICastMemberRepository } from 'src/core/cast-member/domain/cast-member.repository';
import { IUseCase } from 'src/core/shared/application/use-case.interface';

export class ListCastMembersUseCase
  implements IUseCase<ListCastMembersInput, ListCastMembersOutput>
{
  constructor(private readonly castMemberRepo: ICastMemberRepository) {}

  async execute(input: any): Promise<any> {
    return input;
  }
}

export type ListCastMembersInput = any;
export type ListCastMembersOutput = any;
