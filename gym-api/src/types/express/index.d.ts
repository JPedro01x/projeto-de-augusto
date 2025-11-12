import { UserRole } from '../../entities/User';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        userType: UserRole;
      };
    }
  }
}
