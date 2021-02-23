import { multiplyMatrix } from './utils/matrix.js'

export class GLObject {
    // public id: number;
    // public va: number[];
    // public shader: WebGLProgram;
    // public pos: [number, number];
    // public rot: number;
    // public scale: [number, number];
    // public projectionMat: number[];
    // public gl: WebGL2RenderingContext;


    constructor(id, shape, shader, gl) {
        this.id = id;
        this.shape = shape;
        this.shader = shader;
        this.gl = gl;
    }

    setVertexArray(va) {
        this.va = va;
    }


    setPosition(x, y) {
        this.pos = [x,y];
        this.projectionMat = this.calcProjectionMatrix()
    }


    setRotation(rot) {
        this.rot = rot;
        this.projectionMat = this.calcProjectionMatrix()
    }


    setScale(x, y) {
        this.scale = [x,y];
        this.projectionMat = this.calcProjectionMatrix()
    }

    calcProjectionMatrix() {
        if (this.pos === undefined || this.rot === undefined || this.scale === undefined) return null
        const [u,v] = this.pos
        const translateMat = [
            1, 0, 0,
            0, 1, 0,
            u, v, 1
        ]

        const [k1, k2] = this.scale
        const scaleMat = [
            1, 0, 0,
            0, 1, 0,
            0, 0, 1
        ]
        const projectionMat = multiplyMatrix(scaleMat, translateMat)
        return projectionMat
    }

    createPolygonCoords() {
        let coordinates = this.va
        let polygonCoords = []
        let counter = 0
        let x0 = coordinates[0]
        let y0 = coordinates[1]
        for (let i = 2; i < coordinates.length - 3; i += 2) {
            // console.log('~~~~')
            // console.log(i)
            // console.log(i+1)
            // console.log(i+2)
            // console.log(i+3)
            polygonCoords.push(x0)
            polygonCoords.push(y0)
            polygonCoords.push(coordinates[i])
            polygonCoords.push(coordinates[i+1])
            polygonCoords.push(coordinates[i+2])
            polygonCoords.push(coordinates[i+3])
        }
        this.va = polygonCoords
    }

    bind() {
        const gl = this.gl
        const vbo = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.va), gl.STATIC_DRAW)
    }

    draw() {
        const gl = this.gl
        gl.useProgram(this.shader)
        var vertexPos = gl.getAttribLocation(this.shader, 'a_pos')
        var uniformCol = gl.getUniformLocation(this.shader, 'u_fragColor')
        var uniformPos = gl.getUniformLocation(this.shader, 'u_proj_mat')
        gl.vertexAttribPointer(vertexPos, 2, gl.FLOAT, false, 0, 0)
        gl.uniformMatrix3fv(uniformPos, false, this.projectionMat)
        gl.uniform4fv(uniformCol, [1.0, 0.0, 0.0, 1.0])
        gl.enableVertexAttribArray(vertexPos)
        if(this.shape.trim() === "TRIANGLE"){
            gl.drawArrays(gl.TRIANGLES, 0, this.va.length/2)
        } else if(this.shape.trim() === "LINE") {
            gl.drawArrays(gl.LINES, 0, this.va.length/2)
        }

    }

    drawSelect(selectProgram) {
        const gl = this.gl
        const id = this.id
        gl.useProgram(selectProgram)
        var vertexPos = gl.getAttribLocation(selectProgram, 'a_pos')
        var uniformCol = gl.getUniformLocation(selectProgram, 'u_fragColor')
        var uniformPos = gl.getUniformLocation(selectProgram, 'u_proj_mat')
        gl.uniformMatrix3fv(uniformPos, false, this.projectionMat)
        gl.vertexAttribPointer(
            vertexPos,
            2, // it's 2 dimensional
            gl.FLOAT,
            false,
            0,
            0
        )
        gl.enableVertexAttribArray(vertexPos)
        const uniformId = [
            ((id >> 0) & 0xFF) / 0xFF,
            ((id >> 8) & 0xFF) / 0xFF,
            ((id >> 16) & 0xFF) / 0xFF,
            ((id >> 24) & 0xFF) / 0xFF,
        ]
        gl.uniform4fv(uniformCol, uniformId)
        if(this.shape.trim() === "TRIANGLE"){
            gl.drawArrays(gl.TRIANGLES, 0, this.va.length/2)
        } else if(this.shape.trim() === "LINE") {
            gl.drawArrays(gl.LINES, 0, this.va.length/2)
        }
    }
}