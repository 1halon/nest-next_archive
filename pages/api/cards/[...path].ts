import { File } from "formidable";
import { IncomingForm } from "formidable";
import { unlinkSync } from "fs";
import type { NextApiRequest, NextApiResponse } from "next";
import { join } from "path";
import {
  normalize,
  props_keys,
  receipts,
  redis,
  redisKey,
  redis_connect,
  writeReceipt,
} from ".";

redis_connect();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const [id, saved] = req.query?.path as string[];
  if (!id) return res.status(400).json(undefined);

  if (
    (["close", "end", "wait"] as typeof redis.status[]).includes(redis.status)
  )
    return res.status(500).json(undefined);

  new IncomingForm({ maxFields: 7, maxFiles: 1 }).parse(
    req,
    async (err, fields, files) => {
      if (err) return res.status(400).json(undefined);

      const field = await redis.hget(redisKey, id);
      if (!field) return res.status(404).json(undefined);

      const data = normalize(fields),
        file = files.file as File;

      if (req.method === "PATCH" && file)
        try {
          data.receipt = writeReceipt(id, file.filepath);
        } catch (error) {
          return res.status(400).json(undefined);
        }

      let status = 200,
        body;

      switch (req.method.toUpperCase()) {
        case "DELETE":
          try {
            await redis.hdel(redisKey, id);

            unlinkSync(join(receipts, `${id}.pdf`));

            status = 204;
          } catch (error) {
            status = 500;
          }
          break;

        case "GET":
          body = JSON.parse(field);
          break;

        case "PATCH":
          const bill = JSON.parse(field);

          for (const key in data)
            if (props_keys.includes(key)) bill[key] = data[key];

          await redis
            .hset(redisKey, id, JSON.stringify(bill))
            .then(() => (body = bill))
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
