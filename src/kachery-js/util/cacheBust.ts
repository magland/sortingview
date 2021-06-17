import { UrlString } from "../types/kacheryTypes"
import randomAlphaString from "./randomAlphaString"

const cacheBust = (url: UrlString): UrlString => {
    if (url.includes('?')) {
        return url + `&cb=${randomAlphaString(10)}` as any as UrlString
    }
    else {
        return url + `?cb=${randomAlphaString(10)}` as any as UrlString
    }
}

export default cacheBust
