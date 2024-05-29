interface Mode {
  host: string;
  port: number;
}

declare namespace NodeJS {
  interface ProcessEnv {
    COOKIE_SECRET: string;
    DEVELOPMENT: Mode;
    HASH_SALT: string;
    JWT_SECRET: string;
    MONGODB: string;
    PRODUCTION: Mode;
  }
}
