import { ArgsType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

@ArgsType()
export class FindTrackArgs {
  @Field({ nullable: false })
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  name: string;

  @Field({ nullable: false })
  @IsString()
  artistName: string;
}