import payload from "../payload.json" assert { type: "json" };
import { Jimp } from "jimp";
import { extractColors } from "extract-colors";

const request = async (url) => {
  const image = await Jimp.read(url);
  const imageData = {
    data: new Uint8ClampedArray(image.bitmap.data),
    width: 200,
    height: 200,
  };
  return await extractColors(imageData);

  // return buffer;
};

console.log(await request(payload.src));
