import { Track as PrismaTrack } from '@prisma/client';
import { IsInt, IsString, MinLength } from 'class-validator';

export class TrackMetadataDto implements Omit<PrismaTrack, 'id' | 'createdAt' | 'updatedAt'> {
  @IsString()
  @MinLength(1)
  name: string;

  @IsString()
  @MinLength(1)
  artistName: string;

  @IsInt()
  duration: number;

  @IsString()
  @MinLength(1)
  ISRC: string;

  @IsString()
  @MinLength(4)
  releaseDate: string;
}
