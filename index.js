;"use strict";

class CookieManager {
    static set(key, value, path = null, life = null) {
        let s = key + "=" + value;
        if (life !== null) {
            let now = new Date().getTime();
            s += ";expires=" + new Date(now + 1000 * life).toUTCString();
        }
        if (path !== null) {
            s += ";path=" + path;
        }
        document.cookie = s;
    }
    static getAll() {
        return document.cookie.split(";")
            .reduce((prev, current) => {
                let tmp = current.split("=");
                prev[tmp[0].trim()] = tmp[1].trim();
                return prev;
            }, {});
    }
    static remove(key,path=null) {
        CookieManager.set(key,"",path,-1)
    }
}

