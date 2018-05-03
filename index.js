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
class ItemRepository{
    static get items(){
        if(!this._items) this.load();
        return this._items;
    }
    static set items(value){
        this._items = value;
        this.save();
    }
    static load(){
        let _items = CookieManager.getAll().items;
        this._items = _items ? JSON.parse(_items) : [];
    }
    static delete(index){
        this.items.splice(index,1);
        this.save();
    }
    static save(life=3600*30){
        CookieManager.set("items",
            JSON.stringify(this.items),
            null,
            life);
        this.load()
    }
    static add(item){
        this.items.push(item);
        this.save();
    }
}
class TodoView extends ItemRepository{
    static init(){
        this.list = document.querySelector(".list");
    }
}