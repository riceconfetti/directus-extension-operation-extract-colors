import { get, getSync } from "@andreekeberg/imagedata";
import payload from "../payload.json" assert { type: "json" };
import { extractColors } from "extract-colors";

const request = async (url) => {
  const response = await fetch(url);
  const buffer = Buffer.from(await (await response.blob()).arrayBuffer());
  let imageData = {
    width: 200,
    height: 200,
    data: buffer,
    colorSpace: "srgb",
  };
  return await extractColors(imageData);

  // return buffer;
};

console.log(await request(payload.src));
