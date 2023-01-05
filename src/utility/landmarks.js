import * as BABYLON from 'babylonjs'
import {GetBlazePoses} from './dummy3.js'
let g_scene = null
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
                BABYLON.Color3.Magenta(),
                BABYLON.Color3.Yellow(),
                new BABYLON.Color3(1.0, 0.7, 0.3),
                BABYLON.Color3.Red(),
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
    unitVecRep.path = path
    unitVecRep.scaling = new BABYLON.Vector3(1, 1, 5)
    let material = new BABYLON.StandardMaterial("redMat")
    material.diffuseColor = colors[index]
    unitVecRep.material = material
    unitVecRep.position.x += 0.8
    vectorReps.push(unitVecRep)
}

export const DrawLandmarks = function (scene) {
    g_scene = scene
    vectorReps.forEach(
        vRep => {
                vRep.dispose()
        }
    )
    vectorReps = []

    let poses = GetBlazePoses()
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
    createExtrudeShape(poses, 23, 24, 4)
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

