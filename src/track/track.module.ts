import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios'

import { MetadataService } from './services/metadata.service';
import { TrackRepository } from './track.repository';
import { TrackResolver } from './track.resolver';
import { TrackService } from './services/track.service';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [
    HttpModule,
    DatabaseModule,
  ],
  providers: [
    MetadataService,
    TrackResolver,
    TrackService,
    TrackRepository
  ]
})
export class TrackModule {}
