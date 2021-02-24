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

    setObjectList(objList) {
        this.objectList = [...objList]
    }


    removeObject(id) {
        const idx = this.objectList.findIndex(obj => obj.id === id)
        this.objectList.splice(idx, 1)
        this.count--
    }


    render() {
        for (const obj of this.objectList) {
            // console.log(obj.id)
            obj.bind()
            obj.draw()
        }
    }

    renderTex(selectProgram) {
        for (const obj of this.objectList) {
            obj.bind()
            obj.drawSelect(selectProgram)
        }
    }
}