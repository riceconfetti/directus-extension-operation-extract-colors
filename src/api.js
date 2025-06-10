import { defineOperationApi } from "@directus/extensions-sdk";
import { PNG } from "pngjs";
import { extractColors } from "extract-colors";
import ProxyService from "./imgproxy.js";
import axios from "axios";
import { formatCSS, hex2oklch } from "colorizr";

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
    const path = `/${character.splash_art.filename_disk}`;

    const fp = [
      character.splash_art.focal_point_x / character.splash_art.width,
      character.splash_art.focal_point_y / character.splash_art.height,
    ];

    const transformOptions = [
      { key: "trim", params: [1, "FF00FF"] },
      {
        key: "gravity",
        params: [
          "fp",
          fp[0] + Math.random() * 0.2 - 0.1,
          fp[1] + Math.random() * 0.2 - 0.1,
        ],
      },
      {
        key: "crop",
        params: [
          character.options.find((opt) => (opt.key = "icon")).width,
          character.options.find((opt) => (opt.key = "icon")).height,
        ],
      },
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

      const colors = (await extractColors(imageData, imgoptions))
        .sort((a, b) => b.area - a.area)
        .map((c) => {
          let colorObj = {
            area: c.area,
          };
          const hex = c.hex;
          Object.assign(colorObj, hex2oklch(hex));
          colorObj.css = formatCSS(hex2oklch(hex), { format: "oklch" });
          return colorObj;
        });

      return colors;
    };

    return { data: await request(src) };
  },
});
