import { multiplyMatrix } from './utils/matrix.js'
import { GLObject } from './GLObject.js'
import { Renderer } from './renderer.js'
console.log(GLObject)
import { createShader } from './loaders/shader.js'


let appState = {
    mousePos : {
        x: 0,
        y: 0
    },
    mousePosBefore : {
        x: 0,
        y: 0
    },
    mouseMoving : false,
    mouseClicking : false
}
var canvas = document.getElementById('webgl-app')

canvas.addEventListener('mousemove', (event) => {
    appState.mouseMoving = true
    const bound = canvas.getBoundingClientRect()
    const res = {
        x: event.clientX - bound.left,
        y: event.clientY - bound.top
    }
    appState.mousePosBefore.x = appState.mousePos.x
    appState.mousePosBefore.y = appState.mousePos.y
    appState.mousePos = res
}, false)

canvas.addEventListener('mousedown', () => {
    appState.mouseClicking = true
})

canvas.addEventListener('mouseup', () => {
    appState.mouseClicking = false
})

canvas.width = 800
canvas.height = 600

var gl = canvas.getContext('webgl2')

function main() {
    if (!gl) {
        alert('Your browser does not support WebGL')
        return
    }

    // draw shader setup
    let vert = 'draw-vert'
    let frag = 'draw-frag'
    let shaderProgram = createShader(gl, vert, frag)
    gl.useProgram(shaderProgram)

    gl.viewport(0,0, gl.canvas.width, gl.canvas.height)
    const u_resolution = gl.getUniformLocation(shaderProgram, 'u_resolution')
    gl.uniform2f(u_resolution, gl.canvas.width, gl.canvas.height)

    // pick shader setup
    let selectVert = 'select-vert'
    let selectFrag = 'select-frag'
    let selectProgram = createShader(gl, selectVert, selectFrag)

    // defining texture buffer    
    const texBuf = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texBuf)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

    // defining depth buffer
    const depBuf = gl.createRenderbuffer()
    gl.bindRenderbuffer(gl.RENDERBUFFER, depBuf)
    gl.bindTexture(gl.TEXTURE_2D, texBuf)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.canvas.width, gl.canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
    gl.bindRenderbuffer(gl.RENDERBUFFER, depBuf)
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, gl.canvas.width, gl.canvas.height)

    // defining frame buffer
    const frameBuf = gl.createFramebuffer()
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuf)
    const attachmentPoint = gl.COLOR_ATTACHMENT0
    const lvl = 0

    // using the texture and depth buffer with frame buffer
    gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, texBuf, lvl)
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depBuf)

    // create object and draw
    let triangleData = [
        100, 100.0,
        100.0, 150.0,
        150.0, 100.0
    ]
    
    let triangleData2 = [
        400, 400.0,
        400.0, 450.0,
        450.0, 400.0
    ]

    let glObject = new GLObject(0, shaderProgram, gl)
    glObject.setVertexArray(triangleData)
    glObject.setPosition(0,0)
    glObject.setRotation(0)
    glObject.setScale(1,1)
    glObject.bind()

    let glObject2 = new GLObject(1, shaderProgram, gl)
    glObject2.setVertexArray(triangleData)
    glObject2.setPosition(0,100)
    glObject2.setRotation(0)
    glObject2.setScale(1,1)
    glObject2.bind()

    let renderer = new Renderer()
    renderer.addObject(glObject)
    renderer.addObject(glObject2)

    function render() {
        gl.clearColor(1,1,1,1)
        gl.clear(gl.COLOR_BUFFER_BIT)
        gl.viewport(0,0, gl.canvas.width, gl.canvas.height)

        // drawing texture
        const frameBuffer = frameBuf
        gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer)
        gl.enable(gl.DEPTH_TEST)
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
        gl.useProgram(selectProgram)
        const resolutionPos = gl.getUniformLocation(selectProgram, 'u_resolution')
        gl.uniform2f(resolutionPos, gl.canvas.width, gl.canvas.height)
        renderer.renderTex(selectProgram)

        // getting the pixel value
        const pixelX = appState.mousePos.x * gl.canvas.width / canvas.clientWidth
        const pixelY = gl.canvas.height - appState.mousePos.y * gl.canvas.height / canvas.clientHeight - 1
        const data = new Uint8Array(4)
        gl.readPixels(pixelX, pixelY, 1,1, gl.RGBA, gl.UNSIGNED_BYTE, data)
        const id = data[0] + (data[1] << 8) + (data[2] << 16) + (data[3] << 24)
        // console.log(id)

        // stop mouse from moving
        setTimeout(() => {
            appState.mouseMoving = false
        }, 1)
        if (appState.mouseMoving && appState.mouseClicking && id !== -1) {
            renderer.objectList.forEach(obj => {
                if (obj.id === id) {
                    let Dx = appState.mousePos.x - appState.mousePosBefore.x
                    let Dy = -1 * (appState.mousePos.y - appState.mousePosBefore.y)
                    let newX = obj.pos[0] + Dx
                    let newY = obj.pos[1] + Dy
                    // console.log(obj.va)
                    obj.setPosition(newX, newY)
                    obj.bind()
                }
            });
            // console.log([appState.mousePos.x - appState.mousePosBefore.x, appState.mousePos.y - appState.mousePosBefore.y])
        }

        gl.bindFramebuffer(gl.FRAMEBUFFER, null)
        // draw the actual objects
        gl.useProgram(shaderProgram)
        renderer.render()
        requestAnimationFrame(render)
    }
    requestAnimationFrame(render)
}

main()