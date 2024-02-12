import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { catchError, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { validateSync } from 'class-validator';
import { TrackMetadataDto } from '../dto/track-metadata.dto';
import { GraphQLError } from 'graphql';

// local string identifier for error parsing
const NO_RESULT = 'no result';

@Injectable()
export class MetadataService {
  constructor(
    private configService: ConfigService,
    private httpService: HttpService
  ) {}

  get endpoint() {
    return this.configService.get<string>('ACR_CLOUD_API_ENDPOINT');
  }

  get api_key() {
    return this.configService.get<string>('ACR_CLOUD_API_KEY');
  }

  fetchTrackMetadataByNameAndArtistName(name: string, artistName: string): Observable<any> {
    const query = {
      track: name,
      artists: [artistName]
    }

    const params = {
      query: JSON.stringify(query),
      format: 'json',
      include_works: 0
    };

    const headers = {
      'Authorization': `Bearer ${this.api_key}`
    };

    return this.httpService.get<any>(this.endpoint, { params, headers }).pipe(
      map(response => {
        if (!response?.data?.data || (Array.isArray(response.data.data) && response.data.data.length === 0)) {
          throw new Error(NO_RESULT);
        }

        return response.data.data[0];
      }),

      catchError(error => {
        // here we catch NO_RESULT error from above
        if (error?.message === NO_RESULT) {
          throw new GraphQLError(
            'Track not found',
            { extensions: { code: 'NOT_FOUND' } }
          )
        } else if (error.request) {
          throw new GraphQLError(
            'No response from server, check your network connection',
            { extensions: { code: 'GATEWAY_TIMEOUT' } }
          )
        } else {
          throw new GraphQLError(
            'Internal server error',
            { extensions: { code: 'INTERNAL_SERVER_ERROR' } }
          )
        }
      })
    );
  }

  validateMetadata(metadata: Record<string, any>): TrackMetadataDto {
    const track = new TrackMetadataDto();

    track.name = metadata.name;
    track.artistName = metadata.artists.map((artist: { name: string[] }) => artist.name).join(', ');
    track.duration = metadata.duration_ms;
    track.ISRC = metadata.isrc;
    track.releaseDate = metadata.album?.release_date;

    const errors = validateSync(track);

    if (errors.length > 0) {
      throw new GraphQLError(
        'Invalid metadata',
        { extensions: { code: 'NOT_ACCEPTABLE' } }
      )
    }
    return track;
  }
}
