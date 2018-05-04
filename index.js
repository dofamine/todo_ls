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
    get items() {
        if (!this._items) this.load();
        return this._items;
    }

    set items(value) {
        this._items = value;
        this.save();
    }

    load() {
        let _items = window.localStorage.getItem("items");
        this._items = _items ? JSON.parse(_items) : [];
    }

    delete(index) {
        this.items.splice(index, 1);
        this.save();
    }

    static save() {
        window.localStorage.setItem("items",JSON.stringify(this.items));
        this.load()
    }

    add(item) {
        this.items.push(item);
        this.save();
    }
}

class TodoView {
    constructor(){
        this.list = document.querySelector(".list");
        this.form = document.querySelector(".form");
        this.theme = document.getElementById("name");
        this.desc = document.getElementById("desc");
        this.add = this.form.querySelector("button");
    }

    redraw(items) {
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
    onAdd(){
        return Rx.Observable.fromEvent(this.add,"click");
    }
    getName(){
        if (this.theme.value.trim().length < 1) throw new Error("Enter all fields");
        return this.theme.value.trim();
    }
    getDesc(){
        if (this.desc.value.trim().length < 1) throw new Error("Enter all fields");
        return this.desc.value.trim();
    }
    clearForm(){
        this.theme.value = "";
        this.desc.value = "";
    }
    onDel(){
        return Rx.Observable.fromEvent(this.list,"click")
            .filter(e=>e.target.matches("button"))
            .map(e=>e.target.dataset.id);
    }
}

class TodoPresenter {
    constructor(){
        this.view = new TodoView();
        this.model = new ItemRepository();
        this.update();
        this.view.onAdd().subscribe(e=>this.add());
        this.view.onDel().subscribe(id=>this.delete(id));
    }
    update(){
        this.view.redraw(this.model.items)
    }
    add(){
        try {
            this.model.add({
                "name":this.view.getName(),
                "desc":this.view.getDesc(),
            });
            this.view.clearForm();
        } catch (e) {
            alert(e.message);
        }
        this.update();
    }
    delete(id){
        this.model.delete(id);
        this.update();
    }

}

window.addEventListener("load",()=>new TodoPresenter());
