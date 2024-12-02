import { get, getSync } from "@andreekeberg/imagedata";
import payload from "../payload.json" assert { type: "json" };
import { extractColors } from "extract-colors";

const request = async (url) => {
  const response = await fetch(url);
  const buffer = Buffer.from(await (await response.blob()).arrayBuffer());
  // let colors = await extractColors(getSync(buffer));

  return await getSync(Buffer.from(buffer));
  // return buffer;
};

console.log(await request(payload.src));
