declare module "next-auth" {
  interface Session {
    expires: string;
    user?: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      isIssuer?: boolean;
    };
  }

  interface User {
    isIssuer?: boolean;
  }
}

