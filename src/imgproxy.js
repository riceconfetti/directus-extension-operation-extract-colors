import dotenv from 'dotenv'
import { createHmac } from 'node:crypto';
dotenv.config()

export default class ProxyService {
    static  baseUrl = 's3://s3-daily-drip-015812eb-e529-49ee-b23a-d95053fe9ef9';
    static  proxyUrl = 'https://images.dailydrip.news'

    static getImage(path, transforms, format) {
        let processParams = ''
        if (transforms){
            transforms.forEach((tf)=>{
                processParams +=`/${tf.key}`
                tf.params.forEach((opt)=>{
                    processParams+= `:${opt}`
                    //
                })
            })
        }
    
        let target = processParams +'/' + btoa(this.baseUrl + path)
        if(format !=undefined) {
            target += '.' +format
        } 
        return `${ProxyService.proxyUrl}${sign(target)}`
    } 
}

const hexDecode = (hex) => Buffer.from(hex, 'hex')

function sign(target) {
    const hmac = createHmac('sha256', hexDecode(process.env.IMGPROXY_KEY))
    hmac.update(hexDecode(process.env.IMGPROXY_SALT))
    hmac.update(target)
  
    const signature = hmac.digest('base64url')

    return `/${signature}${target}`
}