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

//redis_connect();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const [id, saved] = req.query?.paths as string[];
  if (!id) return res.status(400).json({ message: "ID yok." });

  if (saved === "saved" && req.method.toUpperCase() === "POST") {
    const username = req.query?.username;
    if (!username)
      return res.status(400).json({ message: "Kullanıcı adı yok." });
    let status = 204,
      body = undefined;
    await redis.lpush(`${username}_SAVED_${redisKey}`, id).catch((err) => {
      status = 500;
      body = { message: err.message };
    });
    return res.status(status).json(body);
  }

  if (
    (["close", "end", "wait"] as typeof redis.status[]).includes(redis.status)
  )
    return res.status(500).json({ message: redis.status });

  new IncomingForm({ maxFields: 7, maxFiles: 1 }).parse(
    req,
    async (err, fields, files) => {
      if (err) return res.status(400).json({ message: err.message });

      const field = await redis.hget(redisKey, id);
      if (!field)
        return res.status(404).json({ message: "Fatura bulunamadı." });

      const data = normalize(fields),
        file = files.file as File;

      if (req.method === "PATCH" && file)
        try {
          data.receipt = writeReceipt(id, file.filepath);
        } catch (error) {
          return res.status(400).json({ message: error.message });
        }

      let status = 200,
        body = {};

      switch (req.method.toUpperCase()) {
        case "DELETE":
          try {
            await redis.hdel(redisKey, id);

            unlinkSync(join(receipts, `${id}.pdf`));

            status = 204;
            body = undefined;
          } catch (error) {
            status = 500;
            body = { message: error.message };
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
            .catch((err) => {
              status = 500;
              body = { message: err.message };
            });

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
