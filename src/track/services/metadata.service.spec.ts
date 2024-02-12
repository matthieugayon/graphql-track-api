import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { MetadataService } from './metadata.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of } from 'rxjs';
import { AxiosResponse } from 'axios';

import { TrackMetadataDto } from '../dto/track-metadata.dto';
import { GraphQLError } from 'graphql';

const validMetadataExample = {
  data: [{
    name: 'Supersonic',
    duration_ms: 232306,
    isrc: 'USEW18800001',
    artists: [{ name: 'J.J. Fad' }],
    album: { release_date: '1988' }
  }]
};

describe('MetadataService', () => {
  const httpService: DeepMockProxy<HttpService> = mockDeep<HttpService>();
  const configService: DeepMockProxy<ConfigService> = mockDeep<ConfigService>();
  const service = new MetadataService(
    configService,
    httpService
  );

  it('should return track metadata on success', (done) => {
    const mockResponse: AxiosResponse<any, any> = {
      data: { data: ['mockData'] },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {
        headers: undefined
      },
    };

    jest.spyOn(httpService, 'get').mockReturnValueOnce(of(mockResponse));

    service.fetchTrackMetadataByNameAndArtistName('testName', 'testArtist').subscribe({
      next: (data) => {
        expect(data).toEqual(mockResponse.data.data[0]);
        done();
      }
    });
  });

  it('should throw a not found HttpException from an empty response', done => {
    const mockResponse: AxiosResponse<any, any> = {
      data: undefined,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {
        headers: undefined
      },
    };

    jest.spyOn(httpService, 'get').mockReturnValueOnce(of(mockResponse));

    service.fetchTrackMetadataByNameAndArtistName('testName', 'testArtist').subscribe({
      next: () => done(),
      error: (error) => {
        const expectedError = new GraphQLError(
          'Track not found',
          { extensions: { code: 'NOT_FOUND' } }
        );
        expect(error).toMatchObject(expectedError);
        expect(typeof error).toBe(typeof expectedError);
        done();
      }
    });
  });

  it('validates and returns a TrackMetadataDto for correct input', () => {
    const mockMetadata = validMetadataExample.data[0];
    expect(() => service.validateMetadata(mockMetadata)).not.toThrow();
    const result = service.validateMetadata(mockMetadata);
    expect(result).toBeInstanceOf(TrackMetadataDto);
    expect(result.name).toEqual(mockMetadata.name);
    expect(result.artistName).toEqual("J.J. Fad");
    expect(result.duration).toEqual(mockMetadata.duration_ms);
    expect(result.ISRC).toEqual(mockMetadata.isrc);
    expect(result.releaseDate).toEqual(mockMetadata.album.release_date);
  });

  it('throws BadRequestException when metadata does not meet validation criteria', () => {
    const mockMetadata = validMetadataExample.data[0];
    const invalidMetadataExample = { ...mockMetadata, name: '' }; // Invalid name

    const expectedError = new GraphQLError(
      'Invalid metadata',
      { extensions: { code: 'NOT_ACCEPTABLE' } }
    );

    expect(() => service.validateMetadata(invalidMetadataExample)).toThrow(expectedError);
  });
});
