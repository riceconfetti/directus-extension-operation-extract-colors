import { get, getSync } from "@andreekeberg/imagedata";
import payload from "../payload.json" assert { type: "json" };
import { extractColors } from "extract-colors";

const request = async (url) => {
  const response = await fetch(url);
  const buffer = Buffer.from(await (await response.blob()).arrayBuffer());
  try {
    return await extractColors(getSync(buffer));
  } catch (error) {
    console.log(error);
  }
  // return buffer;
};

console.log(await request(payload.src));
