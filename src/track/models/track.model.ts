import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Track as PrismaTrack } from '@prisma/client';

@ObjectType()
export class Track implements PrismaTrack {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field()
  artistName: string;

  @Field(() => Int)
  duration: number;

  @Field()
  ISRC: string;

  @Field()
  releaseDate: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
