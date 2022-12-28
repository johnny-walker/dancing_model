import * as BABYLON from 'babylonjs'

let rotationAgent = null
export const CreateRotationAgent = function (scene) {
    // generate matrix from rotation agent
    rotationAgent = BABYLON.MeshBuilder.CreateCylinder('box', { height: 0.2, 
                                                                diameterTop: 0, 
                                                                diameterBottom: 0.1, 
                                                                tessellation: 6 },  scene)
                                                       
    rotationAgent.position.x = 1.5
    rotationAgent.position.y = 2
    rotationAgent.visibility = false    
}

export const GetRotationMatrix = function (alpha, beta, gamma) {
    let matrix = new BABYLON.Matrix.Identity()
    if (rotationAgent !== null) {
        rotationAgent.rotation.x = alpha
        rotationAgent.rotation.y = beta
        rotationAgent.rotation.z = gamma
        matrix = rotationAgent.getWorldMatrix()
        //console.log(matrix)
    }
    return matrix
}

//https://gist.github.com/kevinmoran/b45980723e53edeb8a5a43c49f134724
// rotate a rigid object from U to V
// U: original directon
// V: new direction
export const GetAlignmentMatrix = (U, V) => {
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

