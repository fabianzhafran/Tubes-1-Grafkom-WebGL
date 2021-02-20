const shaders = {
    'draw-frag' : 
    `precision mediump float;
    uniform vec4 u_fragColor;

    void main() {
        gl_FragColor = u_fragColor;
    }`,

    'draw-vert' : 
    `attribute vec2 a_pos;
    uniform mat3 u_proj_mat;
    uniform vec2 u_resolution;

    void main() {
        vec2 position = (u_proj_mat * vec3(a_pos, 1)).xy;
        vec2 zeroToOne = position / u_resolution;
        vec2 zeroToTwo = zeroToOne * 2.0;
        vec2 clipSpace = zeroToTwo - 1.0;
        gl_Position = vec4(clipSpace, 0, 1);
    }`,

    'select-vert' :
    `attribute vec2 a_pos;
    uniform mat3 u_proj_mat;
    uniform vec2 u_resolution;


    void main() {
        vec2 position = (u_proj_mat * vec3(a_pos, 1)).xy;
        vec2 zeroToOne = position / u_resolution;
        vec2 zeroToTwo = zeroToOne * 2.0;
        vec2 clipSpace = zeroToTwo - 1.0;
        gl_Position = vec4(clipSpace, 0, 1);
    }`,

    'select-frag' :
    `precision mediump float;
    uniform vec4 u_fragColor;
    void main() {
        gl_FragColor = u_fragColor;
    }`
}

export function loadShader (gl, type, source) {
    const rawShader = shaders[source]
    const shader = gl.createShader(type)
    gl.shaderSource(shader, rawShader)
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert('Error when compiling shaders: ' + gl.getShaderInfoLog(shader))
        gl.deleteShader(shader)
        return null
    }
    return shader
}



export function fetchShader(source) {
    const shader = shaders[source]
    return shader
}

export function createShader(gl, vert, frag) {
    const vs = loadShader(gl, gl.VERTEX_SHADER, vert)
    const fs = loadShader(gl, gl.FRAGMENT_SHADER, frag)
    const shaderProgram = gl.createProgram()
    gl.attachShader(shaderProgram, vs)
    gl.attachShader(shaderProgram, fs)
    gl.linkProgram(shaderProgram)

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('Error on initializing shader program: ' + gl.getProgramInfoLog(shaderProgram))
        return null
    }
    return shaderProgram
}