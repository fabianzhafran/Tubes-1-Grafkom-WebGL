class GLObject {
    // public id: number;
    // public va: number[];
    // public program: WebGLProgram;
    // public pos: [number, number];
    // public rot: number;
    // public scale: [number, number];
    // public projectionMat: number[];
    // public gl: WebGL2RenderingContext;


    constructor(id, type, program, gl) {
        this.id = id
        this.type = type
        this.program = program
        this.color = [1.0, 0.0, 0.0, 1.0]
        this.gl = gl
    }

    setVertexArray(va) {
        this.va = va
    }


    setPosition(x, y) {
        this.pos = [0, 0]
        this.projectionMat = this.calcProjectionMatrix()
    }


    setRotation(rot) {
        this.rot = rot
        this.projectionMat = this.calcProjectionMatrix()
    }


    setScale(x, y) {
        this.scale = [x,y]
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

    changeColor(color) {
        this.color = color
    }

    bind() {
        const gl = this.gl
        const vertexArray = this.va
        gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
        // console.log(this.va)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexArray), gl.DYNAMIC_DRAW)
    }

    draw() {
        const gl = this.gl
        gl.useProgram(this.program)
        var vertexPos = gl.getAttribLocation(this.program, 'a_pos')
        var uniformCol = gl.getUniformLocation(this.program, 'u_fragColor')
        var uniformPos = gl.getUniformLocation(this.program, 'u_proj_mat')
        gl.vertexAttribPointer(vertexPos, 2, gl.FLOAT, false, 0, 0)
        gl.uniformMatrix3fv(uniformPos, false, this.projectionMat)
        gl.uniform4fv(uniformCol, this.color)
        gl.enableVertexAttribArray(vertexPos)
        if (this.type === 'TRIANGLES') {
            gl.drawArrays(gl.TRIANGLES, 0, this.va.length/2)
        } else if (this.type === 'LINES') {
            gl.drawArrays(gl.LINES, 0, this.va.length/2)
        } else if (this.type === 'SQUARE') {
            gl.drawArrays(gl.TRIANGLES, 0, this.va.length/2)
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
        if (this.type === 'TRIANGLES') {
            gl.drawArrays(gl.TRIANGLES, 0, this.va.length/2)
        } else if (this.type === 'LINES') {
            gl.drawArrays(gl.LINES, 0, this.va.length/2)
        } else if (this.type === 'SQUARE') {
            gl.drawArrays(gl.TRIANGLES, 0, this.va.length/2)
        }
    }
}