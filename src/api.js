import { defineOperationApi } from "@directus/extensions-sdk";
import ProxyService from "./imgproxy.js";
import { extractColors } from "extract-colors";
import { createCanvas, loadImage, close } from "puppet-canvas";

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

async function getImageData(src) {
  const canvas = await createCanvas(200, 200);
  const ctx = await canvas.getContext("2d");

  const image = await loadImage(src, canvas);
  await ctx.drawImage(image, 0, 0, 200, 200);
  const data = await ctx.getImageData(0, 0, 200, 200);

  await close();
  return data;
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

    const request = async (url) => {
      // const response = await fetch(url);
      // const buffer = Buffer.from(await (await response.blob()).arrayBuffer());
      let imageData = await getImageData(url);
      return await extractColors(imageData, imgoptions);
    };

    return { data: await request(src) };
  },
});
