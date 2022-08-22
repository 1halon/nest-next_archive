import type { NextApiRequest, NextApiResponse } from "next";
import { IncomingForm } from "formidable";
import type { File } from "formidable";
import { join } from "path";
import { mkdirSync, readFileSync, writeFileSync } from "fs";
import Redis from "ioredis";
import { props } from "../../../src/components/BillCard";

export const receipts = join(process.cwd(), "public", "cdn", "receipts");
export const redis = new Redis("192.168.1.16:6379", { lazyConnect: true });
export const redisKey = "BILLS";
export const redis_connect = () => {
    (["connecting", "reconnecting"] as typeof redis.status[]).includes(
      redis.status
    ) || redis.connect().catch(() => setTimeout(redis_connect, 5000));
  },
  props_keys = Object.keys(props);

redis_connect();

export async function get() {
  return (await redis.hvals(redisKey)).map((value) => JSON.parse(value));
}

export function normalize(fields) {
  let data;
  for (const key of Object.keys(fields).filter((key) =>
    ["null", "undefined"].includes(fields[key])
  ))
    try {
      fields[key] = JSON.parse(fields[key] as string);
    } catch (error) {
      fields[key] = undefined;
    }
  data = { ...fields };
  return data;
}

export function writeReceipt(id, filepath) {
  mkdirSync(receipts, { recursive: true });
  writeFileSync(join(receipts, `${id}.pdf`), readFileSync(filepath));
  return `/cdn/receipts/${id}.pdf`;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (
    (["close", "end", "wait"] as typeof redis.status[]).includes(redis.status)
  )
    return res.status(500).json(undefined);

  new IncomingForm({ maxFields: 7, maxFiles: 1 }).parse(
    req,
    async (err, fields, files) => {
      if (err) res.status(400).json(undefined);

      const data = normalize(fields),
        file = files.file as File;

      if (req.method === "POST" && file)
        try {
          data.id = file.newFilename;
          data.receipt = writeReceipt(data.id, file.filepath);
        } catch (error) {
          return res.status(400).json(undefined);
        }

      let status = 200,
        body;

      switch (req.method) {
        case "DELETE":
          await redis
            .del(redisKey)
            .then(() => (status = 204))
            .catch(() => (status = 500));

          break;

        case "GET":
          await get()
            .then((data) => (body = data))
            .catch(() => (status = 500));

          break;

        case "POST":
          if (!data?.receipt) {
            status = 400;
            break;
          }

          await redis
            .hset(redisKey, data.id, JSON.stringify(data))
            .then(() => {
              status = 201;
              body = data;
            })
            .catch(() => (status = 500));

          break;

        default:
          status = 405;
          break;
      }

      res.status(status).json(body);
    }
  );
}

export const config = {
  api: {
    bodyParser: false,
  },
};
