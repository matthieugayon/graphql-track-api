import { Field, Int, InputType, PartialType } from '@nestjs/graphql';
import { MinLength, IsInt, Min, IsNotEmpty } from 'class-validator';

@InputType()
class CreateTrackInput {
  @Field()
  @MinLength(1)
  name: string;

  @Field()
  @MinLength(1)
  artistName: string;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  duration: number;

  @Field()
  @MinLength(1)
  ISRC: string;

  @Field()
  @MinLength(4)
  releaseDate: string;
}

@InputType()
export class UpdateTrackInput extends PartialType(CreateTrackInput) {
  @Field({ nullable: false })
  @IsNotEmpty()
  id: string;
}