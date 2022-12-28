import React, { useEffect } from 'react'
import * as BABYLON from 'babylonjs'
import 'babylonjs-inspector'
import {TransformLandmarks, GetPoseCenter} from './utility/dummy3.js'
import {CreateRotationAgent, GetRotationMatrix} from './utility/rotation.js'
import {DebugScene, SetSpherePos} from './utility/debugging.js'

let g_engine = null
let g_scene = null
let g_skeleton = null
let g_mesh = null
let g_helper = null
let g_center = null


export default function Babylon3D(props) {
    let width = props.width
    let height = props.height
    let timer = null
    
    var handleResize = function(){
        if (g_engine) {
            g_engine.resize()
        }
    }
    window.addEventListener('resize', handleResize, true)

    var initEngine = async function() {
        const canvas = document.getElementById('canvas_3d')  
        if ("gpu" in navigator) {
            g_engine = new BABYLON.WebGPUEngine(canvas)
            await g_engine.initAsync()
            if (g_engine) {
                console.log('Babylon engine ready...')
                timer = window.setInterval(createScene, 100)
            }
        } else {
            console.log('Browser does not support WebGPU...')
        }
    }

    var loadScene = function (path, model) {
    
        BABYLON.SceneLoader.ImportMesh("", path, model, g_scene,
            function (meshes, particleSystems, skeletons) {          
                g_scene.createDefaultCameraOrLight(true, true, true)
                var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), g_scene)
                light.intensity = 1.0
                g_helper = g_scene.createDefaultEnvironment()
                g_helper.setMainColor(BABYLON.Color3.Gray())
                g_skeleton = skeletons[0]
                g_mesh = meshes[0]

                CreateRotationAgent(g_scene)
                DebugScene(g_scene, g_mesh, g_skeleton)

                //InitBoneVectors(g_skeleton.bones)

                let index = 9
                let bones = g_skeleton.bones
                //let matrix = bones[index].getRestPose() 

                console.log(g_skeleton.bones[index])
                let vector = new BABYLON.Vector3(bones[index].getPosition().x, 
                                                 bones[index].getPosition().y,
                                                 bones[index].getPosition().z)

                let landmark = vector//BABYLON.Vector3.TransformCoordinates(vector, matrix).scale(1.0)

                SetSpherePos(landmark)
                
                g_scene.beforeRender = function () {
                    let matrix = GetRotationMatrix(0, Math.PI/3, 0)
                    g_skeleton.bones[10].setRotationMatrix(matrix)
                    g_skeleton.bones[11].setRotationMatrix(matrix)
                    g_mesh.rotation.y = Math.PI

                    //DEBUG STUFF! draw landmark position by sphere
                    if (g_center !== null) {
                        //console.log(g_center)
                        SetSpherePos(g_center)
                        g_center = null
                    }
                }

                //render loop
                g_engine.runRenderLoop(function(){
                    if (g_scene) { 
                        g_scene.render() 
                    }
                })
            }
        )
    }

    var createScene = function(){
        if (timer) 
            clearTimeout(timer)
        if (g_engine === null) 
            return

        g_scene = new BABYLON.Scene(g_engine)
        let path = "./scenes/dummy3/"
        let model = "dummy3.babylon"
        loadScene(path, model)
    }

    useEffect(() => {
        console.log('3D model mounted')
        // Load the 3D engine
        if (g_engine === null) {
            initEngine()
        }

        return () => {
            console.log('3D model unmounted')
        }
    }) 

    return (
        <div>
            <canvas id="canvas_3d" width={width} height={height}/>
       </div>
    )
}

export const UpdateKeypoints = (bones) => {
    if (bones === undefined || bones.length !== 33) {
        // BlazePose detecting result should contain 33 landmarks
        console.log("UpdateKeypoints:: wrong paramenter")
        return
    }
    TransformLandmarks(bones)
    g_center = GetPoseCenter()
}
