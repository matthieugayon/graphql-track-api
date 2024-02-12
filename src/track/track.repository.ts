import { Injectable } from '@nestjs/common';
import { Prisma, Track } from '@prisma/client';

import { PrismaService } from '../database/prisma.service';

@Injectable()
export class TrackRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getTrack(params: {
    where?: Prisma.TrackWhereUniqueInput;
  }): Promise<Track> {
    const { where } = params;
    return this.prisma.track.findUnique({ where });
  }

  async getTracks(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.TrackWhereUniqueInput;
    where?: Prisma.TrackWhereInput;
    orderBy?: Prisma.TrackOrderByWithRelationInput;
  }): Promise<Track[]> {
    return this.prisma.track.findMany(params);
  }

  async createTrack(params: {
    data: Prisma.TrackCreateInput;
  }): Promise<Track> {
    return this.prisma.track.create(params);
  }

  async updateTrack(params: {
    where: Prisma.TrackWhereUniqueInput;
    data: Prisma.TrackUpdateInput;
  }): Promise<Track> {
    return this.prisma.track.update(params);
  }

  async deleteTrack(params: {
    where: Prisma.TrackWhereUniqueInput;
  }): Promise<Track> {
    return this.prisma.track.delete(params);
  }
}