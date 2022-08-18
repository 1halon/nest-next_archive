import type { NextApiRequest, NextApiResponse } from "next";
import { File, IncomingForm } from "formidable";
import { dirname, join } from "path";
import { mkdirSync, readFileSync, writeFileSync } from "fs";
import { randomUUID } from "crypto";
import Redis from "ioredis";

const receipts = join(process.cwd(), "public", "cdn", "receipts"),
  redis = new Redis("192.168.1.16:6379");

export async function get() {
  return (await redis.lrange("BILLS", 0, -1)).map((value) => JSON.parse(value));
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  new IncomingForm({ maxFields: 10, maxFiles: 1 }).parse(
    req,
    async (err, fields, files) => {
      if (err) res.status(404).send(err);
      let data;
      console.log(fields.description);
      fields.description === "null" && (fields.description = "");
      data = { ...fields };
      const file = files.file as File;
      if (file) {
        data.id = file.newFilename;
        try {
          mkdirSync(receipts, { recursive: true });
          writeFileSync(
            join(receipts, `${file.newFilename}.pdf`),
            readFileSync(file.filepath)
          );
          data.receipt = `/cdn/receipts/${file.newFilename}.pdf`;
        } catch (error) {
          return res.status(404).json({});
        }
      }

      let status = 200,
        body;

      const len = await redis.llen("BILLS");

      switch (req.method) {
        case "GET":
          body = await get();
          break;

        case "POST":
          if (data?.receipt === "undefined") {
            status = 400;
            data = {};
            break;
          }
          status = 201;
          if (data?.id === "undefined") data.id = len + 1;
          body = data;
          redis.lpush("BILLS", JSON.stringify(data));
          break;

        case "PATCH":
          if (data?.id === "undefined") {
            status = 400;
            body = {};
            break;
          }
          const card = JSON.parse(await redis.lindex("BILLS", data.id));
          // TODO
          break;

        default:
          res.status(405).json({});
          break;
      }

      res.status(status).send(body);
    }
  );
}

export const config = {
  api: {
    bodyParser: false,
  },
};
