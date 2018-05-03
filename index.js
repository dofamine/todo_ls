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

    static remove(key, path = null) {
        CookieManager.set(key, "", path, -1)
    }

}

class ItemRepository {
    static get items() {
        if (!this._items) this.load();
        return this._items;
    }

    static set items(value) {
        this._items = value;
        this.save();
    }

    static load() {
        let _items = window.localStorage.getItem("items");
        this._items = _items ? JSON.parse(_items) : [];
    }

    static delete(index) {
        this.items.splice(index, 1);
        this.save();
    }

    static save() {
        window.localStorage.setItem("items",JSON.stringify(this.items));
        this.load()
    }

    static add(item) {
        this.items.push(item);
        this.save();
    }
}

class TodoView {
    static init() {
        this.list = document.querySelector(".list");
        this.form = document.querySelector(".form");
        this.theme = document.getElementById("name");
        this.desc = document.getElementById("desc");
        this.add = this.form.querySelector("button");
    }

    static redraw(items) {
        this.list.innerHTML = "";
        items.forEach((item, i) => {
            this.list.insertAdjacentHTML("beforeEnd", `
            <li>
                <h3>${item.name}</h3>
                <p>${item.desc}</p>
                <button data-id = "${i}">delete</button>
             </li>
            `)
        });
    }
    static onAdd(){
        return Rx.Observable.fromEvent(this.add,"click");
    }
    static getName(){
        if (this.theme.value.trim().length < 1) throw new Error("Enter all fields");
        return this.theme.value.trim();
    }
    static getDesc(){
        if (this.desc.value.trim().length < 1) throw new Error("Enter all fields");
        return this.desc.value.trim();
    }
    static clearForm(){
        this.theme.value = "";
        this.desc.value = "";
    }
    static onDel(){
        return Rx.Observable.fromEvent(this.list,"click")
            .filter(e=>e.target.matches("button"))
            .map(e=>e.target.dataset.id);
    }
}

class TodoPresenter {
    static init(){
        TodoView.init();
        this.update();
        TodoView.onAdd().subscribe(e=>this.add());
        TodoView.onDel().subscribe(id=>this.delete(id));
    }
    static update(){
        TodoView.redraw(ItemRepository.items)
    }
    static add(){
        try {
            ItemRepository.add({
                "name":TodoView.getName(),
                "desc":TodoView.getDesc(),
            });
            TodoView.clearForm();
        } catch (e) {
            alert(e.message);
        }
        this.update();
    }
    static delete(id){
        ItemRepository.delete(id);
        this.update();
    }

}

window.addEventListener("load",()=>TodoPresenter.init());