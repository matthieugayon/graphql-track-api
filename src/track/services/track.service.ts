import { Injectable } from '@nestjs/common';
import { Track } from '@prisma/client';
import { lastValueFrom, map } from 'rxjs';

import { TrackRepository } from '../track.repository';
import { FindTrackArgs } from '../dto/args/find-track.args';
import { MetadataService } from './metadata.service';
import { GetTrackArgs } from '../dto/args/get-track.args';
import { UpdateTrackInput } from '../dto/input/update-track.input';
import { DeleteTrackInput } from '../dto/input/delete-track.input';

@Injectable()
export class TrackService {
  constructor(
    private readonly repository: TrackRepository,
    private readonly metadataService: MetadataService
  ) {}

  async findTrackByNameAndArtistName(findTrackArgs: FindTrackArgs): Promise<Track> {
    const track = await this.repository.getTrack({
      where: {
        name_artistName: findTrackArgs
      },
    });

    if (!track) {
      const track = await lastValueFrom(
        this.metadataService.fetchTrackMetadataByNameAndArtistName(
          findTrackArgs.name,
          findTrackArgs.artistName
        ).pipe(
          map(this.metadataService.validateMetadata)
        )
      );

      // since returned track's name and artistName are not guaranteed to be the same as the input search
      // we need to check if the returned track already exists in the database
      const existingTrack = await this.repository.getTrack({
        where: {
          ISRC: track.ISRC
        }
      });

      if (!existingTrack) {
        return this.repository.createTrack({ data: track });
      }

      return existingTrack;
    }

    return track;
  }

  async getTrack(getTrackArgs: GetTrackArgs): Promise<Track> {
    return this.repository.getTrack({
      where: getTrackArgs
    });
  }

  async getAllTracks(): Promise<Track[]> {
    return this.repository.getTracks({});
  }

  async updateTrack(updateTrackInput: UpdateTrackInput): Promise<Track> {
    const { id, ...updateTrackData } = updateTrackInput;
    return this.repository.updateTrack({
      where: { id: updateTrackInput.id },
      data: updateTrackData
    });
  }

  async deleteTrack(deleteTrackInput: DeleteTrackInput): Promise<Track> {
    return this.repository.deleteTrack({
      where: { id: deleteTrackInput.id },
    });
  }
}