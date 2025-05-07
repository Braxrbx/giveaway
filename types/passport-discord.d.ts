declare module 'passport-discord' {
  import { Strategy as PassportStrategy } from 'passport';
  
  export interface Profile {
    id: string;
    username: string;
    avatar: string | null;
    discriminator: string;
    public_flags: number;
    flags: number;
    banner: string | null;
    accent_color: number | null;
    global_name: string | null;
    locale: string;
    mfa_enabled: boolean;
    provider: string;
    accessToken: string;
    fetchedAt: Date;
    email?: string;
    verified?: boolean;
    guilds?: Guild[];
    connections?: Connection[];
  }

  export interface Guild {
    id: string;
    name: string;
    icon: string | null;
    owner: boolean;
    permissions: number;
    features: string[];
  }

  export interface Connection {
    id: string;
    name: string;
    type: string;
    revoked: boolean;
    visibility: number;
  }

  export interface StrategyOptions {
    clientID: string;
    clientSecret: string;
    callbackURL: string;
    scope?: string[];
    prompt?: string;
    passReqToCallback?: boolean;
  }

  export type VerifyCallback = (error: any, user?: any, info?: any) => void;

  export type VerifyFunction = (
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback
  ) => void;

  export class Strategy extends PassportStrategy {
    constructor(options: StrategyOptions, verify: VerifyFunction);
    name: string;
  }
}