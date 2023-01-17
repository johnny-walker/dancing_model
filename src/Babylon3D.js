import React, { useEffect } from 'react'
import * as BABYLON from 'babylonjs'
import 'babylonjs-inspector'
import {SetCallback, PlayVideo} from './BlazePose.js'
import {CreateRotationAgent} from './utility/rotation.js'
import {DebugScene} from './utility/debugging.js'
import {DrawLandmarkWizard} from './utility/landmarks.js'

import {Transform2Dummy3, RotateSpinDummy3, GetDummy3Center, GetDummy3Poses} from './utility/dummy3.js'
import {Transform2Robot} from './utility/robot.js'


let g_engine = null
let g_scene = null
let g_skeleton = null
let g_mesh = null
let g_helper = null
let g_notifyDetection = false


export default function Babylon3D(props) {
    let width = props.width
    let height = props.height
    let timer = null
    let AVATA = 'dummy3'    // dummy3, robot
    
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
                timer = window.setInterval(createScene, 1000)
            }
        } else {
            console.log('Browser does not support WebGPU...')
        }
    }

    var loadDummy3 = function (path, model) {
    
        BABYLON.SceneLoader.ImportMesh("", path, model, g_scene,
            function (meshes, particleSystems, skeletons) {          
                g_skeleton = skeletons[0]
                g_mesh = meshes[0]
                
                g_scene.createDefaultCameraOrLight(true, true, true)
                let light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), g_scene)
                light.intensity = 1.0
                g_helper = g_scene.createDefaultEnvironment()
                g_helper.setMainColor(BABYLON.Color3.Gray())
                
                const POSITION_SHIFT = 0.8
                g_scene.cameras[0].setPosition(new BABYLON.Vector3(POSITION_SHIFT, 0.5, 4))
                let drawWizard = true
                let translateY = drawWizard ? POSITION_SHIFT : 0.0
                g_mesh.position =  new BABYLON.Vector3(-translateY, 0, 0)  // shift the model
 
                //scene, mesh, skeleton, showSphere, showViewer, showAxis, showLayer
                DebugScene(g_scene, g_mesh, g_skeleton, false, false, true, false)
                CreateRotationAgent(g_scene)
                            
                g_scene.beforeRender = function () {
                    if (g_notifyDetection) {
                        RotateSpinDummy3(g_skeleton.bones)
                        let poses = GetDummy3Poses()
                        if (drawWizard) {
                            // shift the wizard (opposite to model) 
                            DrawLandmarkWizard(g_scene, poses, translateY)  
                        }
                    }
                }
                g_scene.afterRender = function () {
                    if(g_notifyDetection) {
                        g_notifyDetection = false
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

    var loadRobot = function(path, model){
        // Append glTF model to scene.
        BABYLON.SceneLoader.ImportMesh("", "./scenes/", "RobotExpressive.glb", g_scene,
        function (meshes, particleSystems, skeletons) { 
            g_skeleton = skeletons[0]
            //console.log(g_skeleton)
            g_mesh = meshes[0]
            g_mesh.scaling.x = g_mesh.scaling.y = g_mesh.scaling.z = 0.25

            g_scene.createDefaultCameraOrLight(true, true, true)
            let light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), g_scene)
            light.intensity = 1.0
            g_helper = g_scene.createDefaultEnvironment()
            g_helper.setMainColor(BABYLON.Color3.Gray())

            const POSITION_SHIFT = 0.8
            g_scene.cameras[0].setPosition(new BABYLON.Vector3(POSITION_SHIFT, 0.5, -4))
            let drawWizard = true
            let translateY = drawWizard ? POSITION_SHIFT : 0.0
            g_mesh.position =  new BABYLON.Vector3(translateY, 0, 0)  // shift the model

            DebugScene(g_scene, g_mesh, g_skeleton, false, true, true, false)

            //render loop
            g_engine.runRenderLoop(function(){
                if (g_scene) { 
                    g_scene.render() 
                }
            })
        })
    }


    var createScene = function(){
        if (timer) 
            clearTimeout(timer)
        if (g_engine === null) 
            return

        g_scene = new BABYLON.Scene(g_engine)
        
        let path = null
        let model = null

        if (AVATA === 'dummy3') {
            path = "./scenes/dummy3/"
            model = "dummy3.babylon"
            loadDummy3("./scenes/dummy3/", "dummy3.babylon")
        } else if (AVATA === 'robot') {
            path = "./scenes/" 
            model = "RobotExpressive.glb"
            loadRobot(path, model)
        }
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
    let rotateLegs = false
    const updateKeypoints = (bones) => {
        if (bones === undefined || bones.length !== 33) {
            // BlazePose detecting result should contain 33 landmarks
            console.log("UpdateKeypoints:: wrong paramenter")
            return
        }
        // convert BlazePose's landmarks space to Babylon World Space
        if (AVATA === 'dummy3') {
            Transform2Dummy3(bones, rotateLegs)
        } else if (AVATA === 'robot'){
            Transform2Robot(bones, rotateLegs)
        }
        g_notifyDetection = true
    }

    return (
        <div>
            <canvas id="canvas_3d" width={width} height={height}/>
       </div>
    )
}

