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
        console.log(matrix)
    }
    return matrix
}

export const EularRotationAngles = (V) => {
    const vNorm =  V.normalize()
    const vecProjYZ = new BABYLON.Vector3(0, V.y, V.z).normalize() 
    const vecProjXZ = new BABYLON.Vector3(V.x, 0, V.z).normalize() 
    const vecProjXY = new BABYLON.Vector3(V.x, V.y, 0).normalize() 

    let alpha = Math.acos(BABYLON.Vector3.Dot( vecProjYZ, vNorm ))
    let beta  = Math.acos(BABYLON.Vector3.Dot( vecProjXZ, vNorm ))
    let gamma = Math.acos(BABYLON.Vector3.Dot( vecProjXY, vNorm ))

    console.log(alpha)
    console.log(beta)
    console.log(gamma)

    return [alpha, beta, gamma]
}    

