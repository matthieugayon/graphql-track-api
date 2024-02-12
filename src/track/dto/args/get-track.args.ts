import { ArgsType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsUUID } from 'class-validator';

@ArgsType()
export class GetTrackArgs {
  @Field({ nullable: false })
  @IsNotEmpty()
  @IsUUID()
  id: string;
}