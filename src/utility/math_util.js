import * as BABYLON from 'babylonjs'

function EularMatX(alpha) {
    let Rx = new BABYLON.Matrix.Identity()
    /*
       1   0    0 0     //
       0 cos -sin 0     // row 1
       0 sin  con 0     // row 2
       0   0    0 1     //
    */
    // row 1
    Rx.m[5] =  Math.cos(alpha) 
    Rx.m[6] = -Math.sin(alpha) 
    // row 2
    Rx.m[9]  = Math.sin(alpha)
    Rx.m[10] = Math.cos(alpha) 

    return Rx 
}

function EularMatY(beta) {
    let Ry = new BABYLON.Matrix.Identity()
    /*
       cos 0 sin 0      // row 0
       0   1   0 0      //
      -sin 0 cos 0      // row 2
       0   0   0 1      //
    */
    // row 0
    Ry.m[0] = Math.cos(beta) 
    Ry.m[2] = Math.sin(beta) 
    // row 2
    Ry.m[8] = -Math.sin(beta)
    Ry.m[10] =  Math.cos(beta) 
    return Ry 
}

function EularMatZ(gamma) {
    let Rz = new BABYLON.Matrix.Identity()
    /*
       cos -sin 0 0     // row 0
       sin  cos 0 0     // row 1
       0      0 1 0     //
       0      0 0 1     //
    */    
    // row 0
    Rz.m[0] = Math.cos(gamma) 
    Rz.m[1] = -Math.sin(gamma) 
    // row 1
    Rz.m[4]  = Math.sin(gamma)
    Rz.m[5] = Math.cos(gamma) 
                                 
    return Rz 
}


export const EularRotationMatrix = (V) => {
    const vNorm =  V.normalize()
    const vecProjYZ = new BABYLON.Vector3(0, V.y, V.z).normalize() 
    const vecProjXZ = new BABYLON.Vector3(V.x, 0, V.z).normalize() 
    const vecProjXY = new BABYLON.Vector3(V.x, V.y, 0).normalize() 

    let alpha = Math.PI/4 //Math.acos(BABYLON.Vector3.Dot( vecProjYZ, vNorm ))
    let beta  = Math.PI/4 //Math.acos(BABYLON.Vector3.Dot( vecProjXZ, vNorm ))
    let gamma = Math.PI/4 //Math.acos(BABYLON.Vector3.Dot( vecProjXY, vNorm ))

    let MatX = EularMatX(alpha)
    let MatY = EularMatY(beta)
    let MatZ = EularMatZ(gamma)
    
    //console.log(alpha)
    //console.log(MatX)
    console.log(beta)
    //console.log(MatY)    
    //console.log(gamma)
    //console.log(MatZ)

    let MatZY = MatZ.multiply(MatY)
    let MatZYX = MatZY.multiply(MatX)
    //console.log(MatZY)
    //console.log(MatZYX)
    return MatX
}    


export const RotationMatrix = (U, V) => {
    const axis = BABYLON.Vector3.Cross(U, V)
    const cosA = BABYLON.Vector3.Dot( U, V )
    const k = 1.0 / (1.0 + cosA)

    let mat = new BABYLON.Matrix.Identity()
    mat.m[0]  = (axis.x * axis.x * k) + cosA
    mat.m[1]  = (axis.y * axis.x * k) - axis.z 
    mat.m[2]  = (axis.z * axis.x * k) + axis.y
    // mat.m[3] = 0
    mat.m[4]  = (axis.x * axis.y * k) + axis.z
    mat.m[5]  = (axis.y * axis.y * k) + cosA 
    mat.m[6]  = (axis.z * axis.y * k) - axis.x
    // mat.m[7] = 0
    mat.m[8]  = (axis.x * axis.z * k) - axis.y
    mat.m[9]  = (axis.y * axis.z * k) + axis.x
    mat.m[10] = (axis.z * axis.z * k) + cosA
    // mat.m[11] 
    // mat.m[12] = mat.m[13] = mat.m[13] = 0
    // mat.m[15] = 1
                                 
    return mat 
}
