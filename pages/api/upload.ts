import type { NextApiRequest, NextApiResponse } from "next";
import { File, IncomingForm } from "formidable";
import { dirname, join } from "path";
import { mkdirSync, readFileSync, writeFileSync } from "fs";
import { randomUUID } from "crypto";

const receipts = join(process.cwd(), "public", "cdn", "receipts");

export default async function handler(
  req: NextApiRequest & { [key: string]: any },
  res: NextApiResponse
) {
  const form = new IncomingForm({ maxFields: 5, maxFiles: 1 });
  form.parse(req, async (err, fields, files) => {
    if (err) res.status(404).send(err);
    let data;
    data = { ...fields };
    const file = files.file as File;
    if (file) {
      data.id = file.newFilename;
      mkdirSync(receipts, { recursive: true });
      try {
        writeFileSync(
          join(receipts, `${file.newFilename}.pdf`),
          readFileSync(file.filepath)
        );
        data.receipt = `/cdn/receipts/${file.newFilename}.pdf`;
      } catch (error) {
        data = error;
      }
    }
    let status = 201;
    if (data instanceof Error) {
      status = 404;
      data = "Bad Request";
    } else if (!data?.id) data.id = randomUUID().split("-").join("");

    res.status(status).send(data);
  });
}

export const config = {
  api: {
    bodyParser: false,
  },
};
