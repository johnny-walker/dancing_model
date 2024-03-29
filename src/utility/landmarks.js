import * as BABYLON from 'babylonjs'

let g_scene = null
let g_translateY = 0

let vectorReps = []
const s = 0.01
const shape = [
                new BABYLON.Vector3(-s,  0, 0),
                new BABYLON.Vector3( 0, -s, 0),
                new BABYLON.Vector3( s,  0, 0),
                new BABYLON.Vector3( 0,  s, 0)
              ]
const colors = [
                BABYLON.Color3.Purple(),
                BABYLON.Color3.Yellow(),
                BABYLON.Color3.Red(),
                new BABYLON.Color3(0.9, 0.5, 0.3),
                new BABYLON.Color3(0.3, 0.7, 0.9),
                BABYLON.Color3.Green(),
                BABYLON.Color3.Blue(),
               ]  

const extrudeScaling = function(i, distance) {
    const scale = (1 - i)
    return scale
}

const createExtrudeShape = function(poses, from, to, index) {
    let fromVec = BABYLON.Vector3.Zero()
    let toVec = new BABYLON.Vector3(1, 1, 1)
    if (poses.length > 0 &&  poses[from]  !== null &&  poses[to]  !== null ) {
        fromVec =  poses[from] 
        toVec   = poses[to]    
    }

    let path = [fromVec, toVec]
    let unitVecRep = null
    unitVecRep = BABYLON.MeshBuilder.ExtrudeShapeCustom("unitVecRep", 
                                                        {shape: shape, 
                                                        path: path, 
                                                        closeShape: true, 
                                                        scaleFunction: extrudeScaling, 
                                                        }, 
                                                        g_scene)
    
    let material = new BABYLON.StandardMaterial("Material")
    material.diffuseColor = colors[index]

    unitVecRep.scaling = new BABYLON.Vector3(1, 1, 5)
    unitVecRep.material = material
    unitVecRep.position.x += g_translateY   // shift the wizard
    vectorReps.push(unitVecRep)
}

export const DisposeLandmarkWizard = function () {
    vectorReps.forEach(
        vRep => {
            vRep.dispose()
        }
    )
    vectorReps = []
}

export const DrawLandmarkWizard = function (scene, poses, translateY=0) {
    g_scene = scene
    g_translateY = translateY

    DisposeLandmarkWizard()

    //head
    createExtrudeShape(poses, 0, 2, 5)
    createExtrudeShape(poses, 0, 5, 5)
    createExtrudeShape(poses, 1, 3, 5)
    createExtrudeShape(poses, 4, 6, 5)
    createExtrudeShape(poses, 3, 7, 5)
    createExtrudeShape(poses, 6, 8, 5)
    createExtrudeShape(poses, 9, 10, 6)
    createExtrudeShape(poses, 9, 11, 6)
    createExtrudeShape(poses, 10, 12, 6)
    //body
    createExtrudeShape(poses, 11, 12, 4)
    createExtrudeShape(poses, 24, 23, 4)
    //left arm
    createExtrudeShape(poses, 23, 11, 0)
    createExtrudeShape(poses, 11, 13, 0)
    createExtrudeShape(poses, 13, 15, 0)
    createExtrudeShape(poses, 15, 17, 0)
    createExtrudeShape(poses, 15, 19, 0)
    createExtrudeShape(poses, 15, 21, 0)
    //right arm
    createExtrudeShape(poses, 24, 12, 1)
    createExtrudeShape(poses, 12, 14, 1)
    createExtrudeShape(poses, 14, 16, 1)
    createExtrudeShape(poses, 16, 18, 1)
    createExtrudeShape(poses, 16, 20, 1)
    createExtrudeShape(poses, 16, 22, 1)
    //left leg
    createExtrudeShape(poses, 23, 25, 2)
    createExtrudeShape(poses, 25, 27, 2)
    createExtrudeShape(poses, 27, 29, 2)
    createExtrudeShape(poses, 27, 31, 2)
    //right leg
    createExtrudeShape(poses, 24, 26, 3)
    createExtrudeShape(poses, 26, 28, 3)
    createExtrudeShape(poses, 28, 30, 3)
    createExtrudeShape(poses, 28, 32, 3)
}

