import { defineOperationApi } from "@directus/extensions-sdk";
import ProxyService from "./imgproxy";
import { extractColors } from "extract-colors";
import { getPixels } from "get-pixels";

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
  handler: async ({}, { data }) => {
    const payload = data.$trigger.payload;

    const c = payload;
    return {
      character: c,
    };

    const path = "/characters/" + c.game + "/" + c.id + "/gachaSplash.webp";
    const src = ProxyService.getImage(
      path,
      [
        { key: "gravity", params: ["fp", c.fp[0], c.fp[1]] },
        { key: "crop", params: ["1000", "1000"] },
      ],
      "png"
    );
    return {
      img: src,
    };

    const imgoptions = {
      pixels: 100000,
      distance: 0.18,
      saturationDistance: 0.2,
      colorValidator: (red, green, blue, alpha = 255) =>
        !isGraytone(red, green, blue) && alpha > 250,
      lightnessDistance: 0.2,
      hueDistance: 0.083,
    };

    let results;

    getPixels(src, async (err, pixels) => {
      if (!err) {
        const data = [...pixels.data];
        const [width, height] = pixels.shape;
        let col = await extractColors({ data, width, height }, imgoptions);

        results = {
          colors: col.sort((a, b) => b.area - a.area),
        };
      }
    });
    return results;
  },
});
