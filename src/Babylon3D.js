import React, { useEffect } from 'react'
import * as BABYLON from 'babylonjs'
import 'babylonjs-inspector'
import {TransformLandmarks, RotateBones, SpinBody, GetPoseCenter} from './utility/dummy3.js'
import {CreateRotationAgent} from './utility/rotation.js'
import {DebugScene} from './utility/debugging.js'

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
                let bones = g_skeleton.bones

                //console.log(g_skeleton.bones)
                CreateRotationAgent(g_scene)
                //scene, mesh, skeleton, showSphere, showViewer, showAxis, showLayer
                DebugScene(g_scene, g_mesh, g_skeleton, false, false, false, false)

                g_scene.beforeRender = function () {
                    if (g_center !== null) {
                        RotateBones(bones)
                        SpinBody(bones) 
                    }
                    // rotate the whole mesh
                    g_mesh.rotation.y = Math.PI
                }

                //render loop
                g_engine.runRenderLoop(function(){
                    if (g_scene && g_center) { 
                        g_scene.render() 
                        g_center = null
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
    // convert BlazePose's landmarks space to Babylon World Space
    TransformLandmarks(bones)
    g_center = GetPoseCenter()
}
