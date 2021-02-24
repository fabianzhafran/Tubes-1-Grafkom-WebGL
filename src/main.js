console.log(GLObject)

let appState = {
    clickedObjId : -1,
    mousePos : {
        x: 0,
        y: 0
    },
    mousePosBefore : {
        x: 0,
        y: 0
    },
    mouseMoving : false,
    mouseClicking : false,
    resizeValue :  1,
    resizing : false,
    changeColorValue : 1,
    changingColor : false
}

// canvas setup
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

// resize handler
var resizeButton = document.getElementById('resize-button')

resizeButton.addEventListener('click', (event) => {
    var inputValue = document.getElementById('resize-input').value
    appState.resizeValue = inputValue
    appState.resizing = true
    // console.log(appState.resize)
})

// color handler
var colorButton = document.getElementById('change-color-button')

const colorMap = {
    '1' : [1.0, 0.0, 0.0, 1.0],
    '2' : [0.0, 0.0, 1.0, 1.0],
    '3' : [0.0, 1.0, 0.0, 1.0],
    '4' : [1.0, 1.0, 0.0, 1.0],
}

colorButton.addEventListener('click', (event) => {
    var colorValue = document.getElementById('change-color').value
    console.log(colorValue)
    appState.changeColorValue = colorValue
    appState.changingColor = true
    // console.log(appState.resize)
})

// help handler
document.getElementById('help').addEventListener('click', () => {
    // Isi help disini
    alert(' \n\
        Langkah Penggunaan Website: \n\
        1. Masukkan file .json pada folder \n\
        2. Pastikan format file .json sudah sesuai dan memiliki atribut id, shape, posisi, color, dan array of vertices\n\
        3. Untuk memulai inisialisasi pembuatan objek pada canvas, tekan tombol "choose File" kemudian pilih file json yang ingin digunakan \n\
        4. Kemudian gambar dari objek akan ditampilkan sesuai dengan spesifikasi yang ada pada json file \n\
        5. Jika ingin melakukan resize, pastikan telah membuat dan mengklik objek persegi. Kemudian isi field disebelah tombol resize sesuai skala yang diinginkan, kemudian tekan tombol resize. \n\
        6. Jika ingin mengubah warna objek, pertama klik dulu objeknya, kemudian pilih warna disebelah tombol "Change Color". \n\
        7. Anda bisa menyimpan file dari gambar yang telah anda buat kedalam sebuah file json dengan menekan tombol "Save"\n\
    ')
})

// input file handler
var jsonObj

document.getElementById('input-file').addEventListener('change', (event) => {
	const input = event.target
    const file = input.files[0]
    
    if ('files' in input && input.files.length > 0) {
        readFileContent(file).then(content => {
            jsonObj = JSON.parse(content)
            // alert(typeof jsonObj)
            // var jsonObject = JSON.parse(JSON.stringify(jsonObj))
            console.log(jsonObj);
            main(jsonObj)
        }).catch(error => console.log(error))
    }
})

function readFileContent(file) {
	const reader = new FileReader()
  return new Promise((resolve, reject) => {
    reader.onload = event => resolve(event.target.result)
    reader.onerror = error => reject(error)
    reader.readAsText(file)
  })
}


canvas.width = 800
canvas.height = 600

var gl = canvas.getContext('webgl2')

function main(jsonObj) {
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
    let objectsToDraw = []
    let id = 0
    jsonObj.objects.forEach((object) => {
        let glObject = new GLObject(id, object.shape, shaderProgram, gl)
        // console.log(object.shape)
        glObject.setVertexArray(object.vertices)
        glObject.setPosition(object.pos[0], object.pos[1])
        glObject.setRotation(0)
        glObject.setScale(1,1)
        glObject.changeColor(object.color)
        objectsToDraw.push(glObject)
        id += 1
    })

    let renderer = new Renderer()
    renderer.setObjectList(objectsToDraw)

    // download json handler
    document.getElementById('save').addEventListener('click', () => {
        download(renderer.objectList, 'json.txt', 'json');
    })

    function download(objectList, fileName, contentType) {
        var a = document.createElement("a");
        var objectToWrite = {
            objects: []
        }
        objectList.forEach((obj) => {
            objectToWrite.objects.push({
                id: obj.id,
                shape: obj.type,
                pos: obj.pos,
                color: obj.color,
                vertices: obj.va
            })
        })
        var file = new Blob([JSON.stringify(objectToWrite)], {type: contentType});
        a.href = URL.createObjectURL(file);
        a.download = fileName;
        a.click();
    }

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
        console.log(pixelX, pixelY)
        const id = data[0] + (data[1] << 8) + (data[2] << 16) + (data[3] << 24)
        // console.log(id)

        // stop mouse from moving
        setTimeout(() => {
            appState.mouseMoving = false
        }, 1)
        
        if (id !== -1) {
            if (appState.mouseClicking) {
                appState.clickedObjId = id
            }
            console.log(appState.clickedObjId)
            if (appState.mouseMoving && appState.mouseClicking) {
                renderer.objectList.forEach(obj => {
                    if (obj.id === id) {
                        let Dx = appState.mousePos.x - appState.mousePosBefore.x
                        let Dy = -1 * (appState.mousePos.y - appState.mousePosBefore.y)
                        let temp = [...obj.va]
                        let clickUjung = false;

                        for (let a = 0; a < temp.length; a += 2) {
                            // detect ujung
                            if (Math.abs(temp[a] - pixelX) < 20 && Math.abs(temp[a + 1] - pixelY) < 20) {
                                clickUjung = true
                                temp[a] += Dx
                                temp[a + 1] += Dy
                                // console.log(temp)
                            }
                        }
                        if (!clickUjung) {
                            for (let a = 0; a < temp.length; a++) {
                                if (a % 2 === 0) {
                                    temp[a] += Dx
                                } else {
                                    temp[a] += Dy
                                }
                            }
                        }
                        obj.setVertexArray(temp)
                    }
                });
            }
        }
        if (appState.resizing) {
            renderer.objectList.forEach(obj => {
                if (obj.id === appState.clickedObjId) {
                    appState.resizing = false;
                    if (obj.type === 'SQUARE') {
                        obj.va[3] = obj.va[3] * appState.resizeValue
                        obj.va[4] = obj.va[4] * appState.resizeValue
                        obj.va[6] = obj.va[6] * appState.resizeValue
                        obj.va[7] = obj.va[7] * appState.resizeValue
                        obj.va[8] = obj.va[8] * appState.resizeValue
                        obj.va[11] = obj.va[11] * appState.resizeValue
                    } else if (obj.type === 'LINES') {
                        const konstanta = appState.resizeValue
                        let x0 = obj.va[0]
                        let x1 = obj.va[2]
                        let y0 = obj.va[1]
                        let y1 = obj.va[3]
                        let xmin = Math.min(x0, x1)
                        let ymin = Math.min(y0, y1)
                        x0 -= xmin
                        x1 -= xmin
                        y0 -= ymin
                        y1 -= ymin
                        if (x0 === 0) {
                            x1 *= konstanta
                        } else {
                            x0 *= konstanta
                        }
                        if (y0 === 0) {
                            y1 *= konstanta
                        } else {
                            y0 *= konstanta
                        }
                        x0 += xmin
                        x1 += xmin
                        y0 += ymin
                        y1 += ymin
                        obj.va[0] = x0
                        obj.va[2] = x1
                        obj.va[1] = y0
                        obj.va[3] = y1
                    } else {
                        alert('Object must be a SQUARE or a LINE')
                    }
                    // console.log(obj.va)
                }
            });
        }
        if (appState.changingColor) {
            renderer.objectList.forEach(obj => {
                if (obj.id === appState.clickedObjId) {
                    appState.changingColor = false;
                    console.log(colorMap[appState.changeColorValue])
                    obj.changeColor(colorMap[appState.changeColorValue])
                    // console.log(obj.va)
                }
            });
        }

        gl.bindFramebuffer(gl.FRAMEBUFFER, null)
        // draw the actual objects
        gl.useProgram(shaderProgram)
        renderer.render()
        requestAnimationFrame(render)
    }
    requestAnimationFrame(render)
}

// main()