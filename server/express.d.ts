import "express-session";

declare module "express-session" {
  interface SessionData {
    admin?: {
      id: string;
      isSuperAdmin: boolean;
    };
  }
}
