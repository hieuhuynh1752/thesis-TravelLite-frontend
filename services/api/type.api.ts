export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  GUEST = 'GUEST',
}
export interface UserType {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  createAt: string;
}

export interface AccountType {
  user: UserType;
  access_token: string;
}
