import fs from "node:fs";
import payload from "../payload.json" assert { type: "json" };

import axios from "axios";
import { PNG } from "pngjs";
import { extractColors } from "extract-colors";

const request = async (url) => {
  const beforeImageBuffer = await urlToBuffer(url);
  const beforeImage = PNG.sync.read(beforeImageBuffer);
  const imageData = {
    data: new Uint8Array(beforeImage.data),
    width: 200,
    height: 200,
  };
  return await extractColors(imageData);
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

let palette = (await request(payload.src)).sort((a, b) => b.area - a.area);

let file = "";
palette.forEach((c) => {
  file =
    file +
    '<div style="width: 200px; height: 200px; background:' +
    c.hex +
    ';">' +
    c.hex +
    "</div>\n";
});
fs.writeFileSync("test.html", file);
console.log(palette);
