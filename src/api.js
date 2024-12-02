import { defineOperationApi } from "@directus/extensions-sdk";
import { get, getSync } from "@andreekeberg/imagedata";
import ProxyService from "./imgproxy.js";
import { extractColors } from "extract-colors";
import fetch from "node-fetch";

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
    const path =
      "/characters/" +
      character.game +
      "/" +
      character.id +
      "/gachaSplash.webp";

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

    const response = await fetch(src);
    const image = await response.blob();
    const imageData = await image.arrayBuffer();
    const buffer = Buffer.from(imageData);
    return {
      src: src,
      fetch: image,
    };

    let results;
    try {
      results = getSync(buffer);
      return {
        res: results,
      };
    } catch (error) {
      results = error;
    }

    // get(buffer, (error, data) => {
    //   if (error) {
    //     return error;
    //   } else {
    //     extractColors(data, imgoptions)
    //       .then((col) => {
    //         return {
    //           colors: col.sort((a, b) => b.area - a.area),
    //         };
    //       })
    //       .catch((err) => err);
    //   }
    // });
    return "nothing returned";
  },
});
