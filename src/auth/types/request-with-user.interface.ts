import { Request } from 'express';
import { User } from '@prisma/client';

export type ReqUser = Omit<User, 'password'>;

export interface RequestWithUser extends Request {
  user: ReqUser;
}
