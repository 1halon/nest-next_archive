import type { NextApiRequest, NextApiResponse } from "next";
import { IncomingForm } from "formidable";
import type { File } from "formidable";
import { join } from "path";
import { mkdirSync, readFileSync, writeFileSync } from "fs";
import Redis from "ioredis";
import { props } from "../../../src/components/BillCard";

const receipts = join(process.cwd(), "public", "cdn", "receipts"),
  redis = new Redis("192.168.1.16:6379"),
  redis_connect = () => {
    (["connecting", "reconnecting"] as typeof redis.status[]).includes(
      redis.status
    ) || redis.connect().catch(() => setTimeout(redis_connect, 5000));
  },
  props_keys = Object.keys(props);

export async function get() {
  return (await redis.lrange("BILLS", 0, -1)).map((value) => JSON.parse(value));
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (
    (["close", "end", "wait"] as typeof redis.status[]).includes(redis.status)
  )
    return res.status(500).json(undefined);
  const len = await redis.llen("BILLS");

  new IncomingForm({ maxFields: 8, maxFiles: 1 }).parse(
    req,
    async (err, fields, files) => {
      if (err) res.status(404).send(err);
      let data;
      for (const key of Object.keys(fields).filter((key) =>
        ["null", "undefined"].includes(fields[key] as string)
      ))
        try {
          fields[key] = JSON.parse(fields[key] as string);
        } catch (error) {
          fields[key] = undefined;
        }
      data = { ...fields };

      if (["PATCH", "POST"].includes(req.method)) {
        const file = files.file as File;
        if (file) {
          try {
            if (!data?.id) data.id = len + 1;
            mkdirSync(receipts, { recursive: true });
            writeFileSync(
              join(receipts, `${data.id}.pdf`),
              readFileSync(file.filepath)
            );
            data.receipt = `/cdn/receipts/${data.id}.pdf`;
          } catch (error) {
            return res.status(400).json(undefined);
          }
        }
      }

      let status = 200,
        body;

      switch (req.method) {
        case "GET":
          await get()
            .then((data) => (body = data))
            .catch(() => (status = 500));

          break;

        case "DELETE":
          await redis
            .del("BILLS")
            .then(() => (status = 204))
            .catch(() => (status = 500));

          break;

        case "PATCH":
          if (!data?.id) {
            status = 400;
            break;
          }

          try {
            const bill = JSON.parse(await redis.lindex("BILLS", data.id));
            for (const key in data) {
              if (!props_keys.includes(key)) return;
              bill[key] = data[key];
            }

            await redis.lset("BILLS", data.id, JSON.stringify(bill));
            status = 204;
          } catch (error) {
            status = 500;
          }

          break;

        case "POST":
          if (!data?.id) {
            status = 400;
            break;
          }

          await redis.lpush("BILLS", JSON.stringify(data));
          status = 201;
          body = data;

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
