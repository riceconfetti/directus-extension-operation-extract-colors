import { defineOperationApi } from "@directus/extensions-sdk";
import { PNG } from "pngjs";
import { extractColors } from "extract-colors";
import ProxyService from "./imgproxy.js";
import axios from "axios";

function isGraytone(r, g, b) {
  if ((r == g && r == b && r == 0) || r + g + b < 20) {
    return true;
  } else {
    const mean = (r + g + b) / 3;
    const sum2diff = (r - mean) ** 2 + (g - mean) ** 2 + (b - mean) ** 2;
    const variance = sum2diff / 3;
    const standDev = Math.sqrt(variance);
    return standDev / mean <= 0.05;
  }
}

export default defineOperationApi({
  id: "operation-extract-colors",
  handler: async ({ character }) => {
    const path = "/characters/" + character.game + "/" + character.id + ".webp";

    const transformOptions = [
      { key: "trim", params: [1, "FF00FF"] },
      {
        key: "gravity",
        params: [
          "fp",
          character.focalPoint.x + Math.random() * 0.2 - 0.1,
          character.focalPoint.y + Math.random() * 0.2 - 0.1,
        ],
      },
      { key: "crop", params: [300 * character.crop.x, 300 * character.crop.y] },
      { key: "resize", params: ["fill", 200, 200] },
    ];

    const src = ProxyService.getImage(path, transformOptions, "png");

    const imgoptions = {
      pixels: 100000,
      distance: 0.18,
      saturationDistance: 0.2,
      colorValidator: (red, green, blue, alpha = 255) =>
        !isGraytone(red, green, blue) && alpha > 250,
      lightnessDistance: 0.2,
      hueDistance: 0.083,
    };

    const urlToBuffer = async (url) => {
      return axios({
        method: "get",
        url: url,
        responseType: "arraybuffer",
      })
        .then((res) => Buffer.from(res.data))
        .then((buffer) => {
          console.log("is buffer?", Buffer.isBuffer(buffer));
          console.log(buffer);
          return buffer;
        });
    };

    const request = async (url) => {
      const beforeImageBuffer = await urlToBuffer(url);
      const beforeImage = PNG.sync.read(beforeImageBuffer);
      const imageData = {
        data: new Uint8Array(beforeImage.data),
        width: 200,
        height: 200,
      };

      return (await extractColors(imageData, imgoptions)).sort(
        (a, b) => b.area - a.area
      );
    };

    return { data: await request(src) };
  },
});
