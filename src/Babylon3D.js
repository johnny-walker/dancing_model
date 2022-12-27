import React, { useEffect } from 'react'
import * as BABYLON from 'babylonjs'
import 'babylonjs-inspector'
import {TransformLandmarks, GetPoseCenter} from './utility/dummy3.js'

let g_engine = null
let g_scene = null
let g_skeleton = null
let g_mesh = null
let g_arrow = null  
let g_sphere = null
let g_helper = null
let g_center = null
let timer = null


export default function Babylon3D(props) {
    let width = props.width
    let height = props.height
    
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

    //DEBUG STUFF!
    var debugScene = function (showAxis=true, showLayer=false) {
        let options = {
            pauseAnimations : false, 
            returnToRest : false, 
            computeBonesUsingShaders : true, 
            useAllBones : false,
            displayMode :  BABYLON.Debug.SkeletonViewer.DISPLAY_SPHERE_AND_SPURS,
            displayOptions : {
                sphereBaseSize : 1,
                sphereScaleUnit : 10, 
                sphereFactor : 0.9, 
                midStep : 0.25,
                midStepFactor : 0.05
            }
        }
        
        new BABYLON.Debug.SkeletonViewer(
            g_skeleton, 
            g_mesh,
            g_scene,
            false, //autoUpdateBoneMatrices?
            (g_mesh.renderingGroupId > 0 )?g_mesh.renderingGroupId+1:1,  // renderingGroup
            options
        )
        
        if (showAxis)
            new BABYLON.AxesViewer(g_scene, 0.25)

        if (showLayer)
            g_scene.debugLayer.show()
        
        //g_scene.beginAnimation(skeleton, 0, 300, true)    
        
        /* print out bone names    
        let index = 0
        g_skeleton.bones.forEach(
            bone => {
                console.log(`${index}:${bone.name}`)
                index++
            }
        )
        */

        //debug to show hip's (center) location 
        g_sphere = BABYLON.MeshBuilder.CreateSphere("sphere", { diameterX: 0.5, 
                                                                diameterY: 0.2, 
                                                                diameterZ: 0.2 }, g_scene)
                    
        var material = new BABYLON.StandardMaterial(g_scene)
        material.alpha = 1
        material.diffuseColor = new BABYLON.Color3(1.0, 0.2, 0.7)
        g_sphere.material = material
    }

    var loadArrow = function () {
        // generate matrix from arrow object
        g_arrow = BABYLON.MeshBuilder.CreateCylinder('box', { height: 0.2, 
                                                              diameterTop: 0, 
                                                              diameterBottom: 0.1, 
                                                              tessellation: 6 },  g_scene)
                                                           
        g_arrow.position.x = 1.5
        g_arrow.position.y = 2
        g_arrow.visibility = false    
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

                loadArrow()
                //debugScene()
 
                g_scene.beforeRender = function () {
                    g_arrow.rotation.y = Math.PI/3
                    let matrix = g_arrow.getWorldMatrix()
                    g_skeleton.bones[34].setRotationMatrix(matrix)
                    g_skeleton.bones[11].setRotationMatrix(matrix)
                    g_mesh.rotation.y = Math.PI

                    if (g_sphere !== null && g_center !== null) {
                        //console.log(g_center)
                        g_sphere.position = g_center
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
