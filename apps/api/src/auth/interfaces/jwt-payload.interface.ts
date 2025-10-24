export interface JwtPayload {
  sub: string; // user id
  email: string;
  accountId: string;
  role: string;
}
