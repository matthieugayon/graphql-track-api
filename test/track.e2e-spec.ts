import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import requestWs from 'supertest-graphql'
import gql from 'graphql-tag';

import { AppModule } from '../src/app.module';

const name = 'Parça';
const artistName= 'DJ Danifox';
const duration = 198750;
const ISRC = 'ES71G2311887';
const releaseDate = '2023-04-26';
const findTrackQuery = gql`
  query($name: String!, $artistName: String!) {
    FindTrack(name: $name, artistName: $artistName) {
      id
      name
      artistName
      duration
      ISRC
      releaseDate
    }
  }
`;

const getTrackQuery = gql`
  query($id: String!) {
    GetTrack(id: $id) {
      id
      name
      artistName
      duration
      ISRC
      releaseDate
    }
  }
`;

const getAllTracksQuery = gql`
  query {
    GetAllTracks {
      id
      name
      artistName
      duration
      ISRC
      releaseDate
    }
  }
`

const updateTrackMutation = gql`
  mutation($id: String!, $name: String!) {
    UpdateTrack(UpdateTrackInput: {
      id: $id,
      name: $name
    }) {
      id
      name
      artistName
      duration
      ISRC
      releaseDate
    }
  }
`;

const deleteTrackMutation = gql`
  mutation($id: String!) {
    DeleteTrack(DeleteTrackInput: {
      id: $id
    }) {
      id
      name
      artistName
      duration
      releaseDate
    }
  }
`;

describe('/graphql Track API', () => {
  let app: INestApplication;
  let accessToken: string = '';
  let trackId: string = '';

  const loginUser = async () => {
    const res = await request(app.getHttpServer()).post('/auth/login').send({
      email: process.env.TEST_USER_EMAIL,
      password: process.env.TEST_USER_PASSWORD
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.access_token).toBeDefined();

    // store access_token
    accessToken = res.body.access_token;
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        forbidUnknownValues: true,
        whitelist: true
      })
    );
    await app.init();
  });

  beforeEach(async () => {
    await loginUser();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should get an UNAUTHENTICATED error if not logged', async () => {
    const searchResult = await requestWs(app.getHttpServer())
      .query(findTrackQuery)
      .variables({ name, artistName });

    expect((searchResult.errors as any[]).length).toBeGreaterThan(0);
    expect((searchResult.errors as any[])[0].code).toBe('UNAUTHENTICATED');
  });

  it('should get a BAD error if input is not formatted correctly', async () => {
    const searchResult = await requestWs(app.getHttpServer())
      .set('authorization', `Bearer ${accessToken}`)
      .query(findTrackQuery)
      .variables({ name: '', artistName });

    expect((searchResult.errors as any[]).length).toBeGreaterThan(0);
    expect((searchResult.errors as any[])[0].code).toBe('BAD_REQUEST');
  });

  it('should get a NOT_FOUND error if track is not found', async () => {
    const searchResult = await requestWs(app.getHttpServer())
      .set('authorization', `Bearer ${accessToken}`)
      .query(findTrackQuery)
      .variables({ name: 'sqDJSQHJLQSHDLsqhdaiqhzliusqhqiazuhd1921379827i', artistName });

    expect((searchResult.errors as any[]).length).toBeGreaterThan(0);
    expect((searchResult.errors as any[])[0].code).toBe('NOT_FOUND');
  });

  it('should find a track', async () => {
    const searchResult = await requestWs(app.getHttpServer())
      .set('authorization', `Bearer ${accessToken}`)
      .query(findTrackQuery)
      .variables({ name, artistName });

    // store trackId
    trackId = (searchResult.data as any).FindTrack.id;

    expect((searchResult.data as any).FindTrack).toMatchObject({
      name,
      artistName,
      duration,
      ISRC,
      releaseDate
    });
  });

  it('should get a track', async () => {
    const fetchResult = await requestWs(app.getHttpServer())
      .set('authorization', `Bearer ${accessToken}`)
      .query(getTrackQuery)
      .variables({ id: trackId });

    expect((fetchResult.data as any).GetTrack).toMatchObject({
      id: trackId,
      name,
      artistName,
      duration,
      ISRC,
      releaseDate
    });
  });

  it('should get all tracks', async () => {
    const fetchResult = await requestWs(app.getHttpServer())
      .set('authorization', `Bearer ${accessToken}`)
      .query(getAllTracksQuery);

    expect((fetchResult.data as any).GetAllTracks.length).toBeGreaterThan(0);
    const track = (fetchResult.data as any).GetAllTracks.find((t: any) => t.id === trackId);
    expect(track).toMatchObject({
      id: trackId,
      name,
      artistName,
      duration,
      ISRC,
      releaseDate
    });
  });

  it('should update a track', async () => {
    const modifiedName = 'Parça (Remix)';
    const updateResult = await requestWs(app.getHttpServer())
      .set('authorization', `Bearer ${accessToken}`)
      .query(updateTrackMutation)
      .variables({ id: trackId, name: modifiedName });

    expect((updateResult.data as any).UpdateTrack).toMatchObject({
      id: trackId,
      name: modifiedName,
      artistName,
      duration,
      ISRC,
      releaseDate
    });
  });

  it('should delete a track', async () => {
    const deleteResult = await requestWs(app.getHttpServer())
      .set('authorization', `Bearer ${accessToken}`)
      .query(deleteTrackMutation)
      .variables({ id: trackId });

    expect((deleteResult.data as any).DeleteTrack).toMatchObject({
      id: trackId
    });

    const fetchResult = await requestWs(app.getHttpServer())
      .set('authorization', `Bearer ${accessToken}`)
      .query(getTrackQuery)
      .variables({ id: trackId });

    expect((fetchResult.errors as any[]).length).toBeGreaterThan(0);
  });
});