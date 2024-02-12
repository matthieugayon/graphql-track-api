import { DeepMockProxy, mockDeep } from 'jest-mock-extended'
import { of } from 'rxjs';
import { Track } from '@prisma/client';

import { TrackService } from './track.service';
import { TrackRepository } from '../track.repository';
import { MetadataService } from './metadata.service';

const mockArccloudApiResponse = [
  {
    name: 'Ooh La La',
    duration_ms: 214080,
    isrc: 'USWB10104988',
    artists: [
      { name: 'Faces' }
    ],
    album: {
      release_date: '1973'
    },
  }
];

const mockTrack: Track = {
  id: '6cffae7d-94df-43eb-83ab-cad23a803f25',
  name: 'Ooh La La',
  artistName: 'Faces',
  duration: 214080,
  ISRC: 'USWB10104988',
  releaseDate: '1973',
  createdAt: new Date('2021-06-01T00:00:00Z'),
  updatedAt: new Date('2021-06-10T00:00:00Z'),
};

describe('TrackService', () => {
  const metadataService: DeepMockProxy<MetadataService> = mockDeep<MetadataService>();
  const trackRepository: DeepMockProxy<TrackRepository> = mockDeep<TrackRepository>();
  const trackService = new TrackService(trackRepository, metadataService);

  beforeEach(() => {
    trackRepository.getTrack.mockReset();
    trackRepository.getTracks.mockReset();
    trackRepository.createTrack.mockReset();
    metadataService.fetchTrackMetadataByNameAndArtistName.mockReset();
    metadataService.fetchTrackMetadataByNameAndArtistName.mockReset();
  });

  it('findTrackByNameAndArtistName — should return track from repository if found with search parameters', async () => {
    jest.spyOn(trackRepository, 'getTrack').mockResolvedValueOnce(mockTrack);

    const findTrackArgs = { name: 'Test Track', artistName: 'Test Artist' };
    await expect(trackService.findTrackByNameAndArtistName(findTrackArgs)).resolves.toEqual(mockTrack);

    expect(trackRepository.getTrack).toHaveBeenCalledWith({
      where: {
        name_artistName: findTrackArgs,
      },
    });
    expect(metadataService.fetchTrackMetadataByNameAndArtistName).not.toHaveBeenCalled();
  });

  it('findTrackByNameAndArtistName — should fetch track from metadata service and save to repository if metadata API result is not found in repository', async () => {
    // first check with FindTrack args
    jest.spyOn(trackRepository, 'getTrack').mockResolvedValueOnce(undefined);
    jest.spyOn(metadataService, 'fetchTrackMetadataByNameAndArtistName').mockReturnValueOnce(of(mockArccloudApiResponse));
    jest.spyOn(metadataService, 'validateMetadata').mockReturnValueOnce(mockTrack);
    // second check with IRSC
    jest.spyOn(trackRepository, 'getTrack').mockResolvedValueOnce(undefined);
    jest.spyOn(trackRepository, 'createTrack').mockResolvedValueOnce(mockTrack);

    const findTrackArgs = { name: 'New Track', artistName: 'New Artist' };
    await expect(trackService.findTrackByNameAndArtistName(findTrackArgs)).resolves.toEqual(mockTrack);

    expect(trackRepository.getTrack).toHaveBeenCalledWith({
      where: {
        name_artistName: findTrackArgs,
      },
    });
    expect(metadataService.fetchTrackMetadataByNameAndArtistName).toHaveBeenCalledWith(findTrackArgs.name, findTrackArgs.artistName);
    expect(metadataService.validateMetadata).toHaveBeenCalledWith(mockArccloudApiResponse, 0);
    expect(trackRepository.createTrack).toHaveBeenCalledWith({ data: mockTrack });
  });

  it('findTrackByNameAndArtistName — should fetch track from metadata service and return repository record', async () => {
    jest.spyOn(trackRepository, 'getTrack').mockResolvedValueOnce(undefined);
    jest.spyOn(metadataService, 'fetchTrackMetadataByNameAndArtistName').mockReturnValueOnce(of(mockArccloudApiResponse));
    jest.spyOn(metadataService, 'validateMetadata').mockReturnValueOnce(mockTrack);
    jest.spyOn(trackRepository, 'getTrack').mockResolvedValueOnce(mockTrack);

    const findTrackArgs = { name: 'New Track', artistName: 'New Artist' };
    await expect(trackService.findTrackByNameAndArtistName(findTrackArgs)).resolves.toEqual(mockTrack);

    expect(trackRepository.getTrack).toHaveBeenCalledWith({
      where: {
        name_artistName: findTrackArgs,
      },
    });
    expect(metadataService.fetchTrackMetadataByNameAndArtistName).toHaveBeenCalledWith(findTrackArgs.name, findTrackArgs.artistName);
    expect(metadataService.validateMetadata).toHaveBeenCalledWith(mockArccloudApiResponse, 0);
    expect(trackRepository.createTrack).not.toHaveBeenCalled();
  });
});