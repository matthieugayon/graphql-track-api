import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';

import { TrackModule } from './track/track.module';
import { AuthModule } from './auth/auth.module';

type HttpError = {
  message: string;
  statusCode: number;
  error: string;
};

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      include: [TrackModule],
      // we chose a code first approach https://docs.nestjs.com/graphql/quick-start#code-first
      // here we define the path of the autogenerated the graphql schema
      autoSchemaFile: join(process.cwd(), 'src/track/schema.gql'),
      // this helps formatting correctly HTTP exceptions into a GraphQL friendly format
      // it concerns the Authentication exceptions thrown by the jwt auth guard
      // and the BadRequestException thrown by the global validation pipe (see main.ts)
      formatError: (error) => {
        const originalError = error.extensions
          ?.originalError as HttpError;

        if (!originalError) {
          return {
            message: error.message,
            code: error.extensions?.code,
          };
        }

        return {
          message: originalError.message,
          code: error.extensions?.code,
        };
      },
    }),
    TrackModule,
    AuthModule,
  ]
})
export class AppModule {}
