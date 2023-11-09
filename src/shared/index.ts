import { config } from "dotenv";

interface Mode {
  host: string;
  port: number;
}

export function GetMode(env: typeof process.env): Mode;
export function GetMode(path: string, NODE_ENV?: string): Mode;
export function GetMode(p0, NODE_ENV?: string): Mode {
  if (typeof p0 === "object") var env = p0;
  else if (typeof p0 === "string") var env: any = config({ path: p0 })?.parsed;
  return JSON.parse(
    env[(NODE_ENV ?? (env["NODE_ENV"] as string)).toUpperCase()]
  );
}
