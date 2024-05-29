interface Mode {
  host: string;
  port: number;
}

declare namespace NodeJS {
  interface ProcessEnv {
    COOKIE_SECRET: string;
    DEVELOPMENT: Mode;
    JWT_SECRET: string;
    MONGODB: string;
    PRODUCTION: Mode;
  }
}
