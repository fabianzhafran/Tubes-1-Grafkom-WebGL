export class Renderer {
    // public objectList: Array<GLObject>;
    // public count: number;

    constructor() {
        this.objectList = new Array();
        this.count = 0;
    }


    addObject(obj) {
        this.objectList.push(obj)
        this.count++
    }


    removeObject(id) {
        const idx = this.objectList.findIndex(obj => obj.id === id)
        this.objectList.splice(idx, 1)
        this.count--
    }


    render() {
        for (const obj of this.objectList) {
            // console.log(obj);
            obj.draw()
        }
    }

    renderTex(selectProgram) {
        for (const obj of this.objectList) {
            obj.drawSelect(selectProgram)
        }
    }
}