import React, { useEffect } from 'react'
import * as BABYLON from 'babylonjs'
import 'babylonjs-inspector'
import {SetCallback, PlayVideo} from './BlazePose.js'
import {TransformLandmarks, RotateSpinBody, GetPoseCenter, GetBlazePoses} from './utility/dummy3.js'
import {CreateRotationAgent} from './utility/rotation.js'
import {DebugScene} from './utility/debugging.js'
import {DrawLandmarks} from './utility/landmarks.js'


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
                g_skeleton = skeletons[0]
                g_mesh = meshes[0]
                g_scene.createDefaultCameraOrLight(true, true, true)
                let light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), g_scene)
                light.intensity = 1.0
                g_helper = g_scene.createDefaultEnvironment()
                g_helper.setMainColor(BABYLON.Color3.Gray())
                g_scene.cameras[0].setPosition(new BABYLON.Vector3(0, 0.8, 4))
 
                // shift the whole model to the right, (visual human poses is on the left)
                 g_mesh.position =  new BABYLON.Vector3(-0.8, 0, 0)  
 
                //scene, mesh, skeleton, showSphere, showViewer, showAxis, showLayer
                DebugScene(g_scene, g_mesh, g_skeleton, false, false, false, false)
                CreateRotationAgent(g_scene)
                            
                g_scene.beforeRender = function () {
                    if (g_center !== null) {
                        RotateSpinBody(g_skeleton.bones)
                        let poses = GetBlazePoses()
                        DrawLandmarks(g_scene, poses)
                    }
                }
                g_scene.afterRender = function () {
                    if(g_center !== null) {
                        g_center = null
                        PlayVideo('play')
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

    // constructor, destructor
    useEffect(() => {
        console.log('3D model mounted')
        SetCallback(updateKeypoints)
        // Load the 3D engine
        if (g_engine === null) {
            initEngine()
        }

        return () => {
            console.log('3D model unmounted')
        }
    }) 

    // callback function
    const updateKeypoints = (bones) => {
        if (bones === undefined || bones.length !== 33) {
            // BlazePose detecting result should contain 33 landmarks
            console.log("UpdateKeypoints:: wrong paramenter")
            return
        }
        // convert BlazePose's landmarks space to Babylon World Space
        TransformLandmarks(bones)
        g_center = GetPoseCenter()
    }

    return (
        <div>
            <canvas id="canvas_3d" width={width} height={height}/>
       </div>
    )
}

