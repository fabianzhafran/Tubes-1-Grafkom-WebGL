export function multiplyMatrix(A, B) {
    // Only for arrays with length 6
    // For polygons, you have to divide the polygon to triangles first (array with length 6)
    let out = []
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            let temp = 0
            for (let k = 0; k < 3; k++) {
                temp += A[i * 3 + k] * B[k * 3 + j]
            }
            out.push(temp)
        }
    }
    return out
}

export function addMatrix(A, B) {
    let out = []
    for (let i = 0; i < A.length; i++) {
        out.push(A[i] + b[i])
    }
    return out
}