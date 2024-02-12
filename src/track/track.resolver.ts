import { Args, Resolver, Query, Mutation } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { TrackService } from './services/track.service';
import { Track } from './models/track.model';
import { FindTrackArgs } from './dto/args/find-track.args';
import { GetTrackArgs } from './dto/args/get-track.args';
import { UpdateTrackInput } from './dto/input/update-track.input';
import { DeleteTrackInput } from './dto/input/delete-track.input';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Resolver(() => Track)
@UseGuards(JwtAuthGuard)
export class TrackResolver {
  constructor(private readonly trackService: TrackService) {}

  @Query(() => Track, {
    name: 'FindTrack',
    description: 'Find a track by name and artist name'
  })
  async findTrack(@Args() findTrackArgs: FindTrackArgs): Promise<Track> {
    return this.trackService.findTrackByNameAndArtistName(findTrackArgs);
  }

  @Query(() => Track, {
    name: 'GetTrack',
    description: 'Get a track by id'
  })
  async getTrack(@Args() getTrackArgs: GetTrackArgs): Promise<Track> {
    return this.trackService.getTrack(getTrackArgs);
  }

  @Query(() => [Track], {
    name: 'GetAllTracks',
    description: 'Get all tracks from the database'
  })
  async getAllTracks(): Promise<Track[]> {
    return this.trackService.getAllTracks();
  }

  @Mutation(() => Track, {
    name: 'UpdateTrack',
    description: 'Update a track by id'
  })
  async updateTrack(
    @Args('UpdateTrackInput') updateTrackInput: UpdateTrackInput,
  ): Promise<Track> {
    console.log('updateTrackInput', updateTrackInput)
    return this.trackService.updateTrack(updateTrackInput);
  }

  @Mutation(() => Track, {
    name: 'DeleteTrack',
    description: 'Delete a track by id'
  })
  async deleteTrack(
    @Args('DeleteTrackInput') deleteTrackInput: DeleteTrackInput,
  ): Promise<Track> {
    return this.trackService.deleteTrack(deleteTrackInput);
  }
}