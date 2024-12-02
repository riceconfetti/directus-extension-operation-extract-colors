import { createHmac } from "node:crypto";

const IMGPROXY_KEY =
  "fa370f19b0bf2fb55b52c8264ed52d4c2664f183164c4649ac74971e028746967edc51822a2274dff6b2cd231f2eb2a046a7268cfeeb24e30b277b0fb7442529";
const IMGPROXY_SALT =
  "8404322f8278302c278400bd95a60c480aca980fa0de5e73f8bb35c3af7cae0b83edaeb615df99397e973906e912a93fa275b2ae5a07ebb699534b390c610c02";

export default class ProxyService {
  static baseUrl = "s3://s3-daily-drip-015812eb-e529-49ee-b23a-d95053fe9ef9";
  static proxyUrl = "https://images.dailydrip.news";

  static getImage(path, transforms, format) {
    let processParams = "";
    if (transforms) {
      transforms.forEach((tf) => {
        processParams += `/${tf.key}`;
        tf.params.forEach((opt) => {
          processParams += `:${opt}`;
          //
        });
      });
    }

    let target = processParams + "/" + btoa(this.baseUrl + path);
    if (format != undefined) {
      target += "." + format;
    }
    return `${ProxyService.proxyUrl}${sign(target)}`;
  }
}

const hexDecode = (hex) => Buffer.from(hex, "hex");

function sign(target) {
  const hmac = createHmac("sha256", hexDecode(IMGPROXY_KEY));
  hmac.update(hexDecode(IMGPROXY_SALT));
  hmac.update(target);

  const signature = hmac.digest("base64url");

  return `/${signature}${target}`;
}
