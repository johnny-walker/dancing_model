import React, { useEffect } from 'react'
import * as BABYLON from 'babylonjs'
import 'babylonjs-inspector'

let engine = null
let scene = null
let timer = null

function Babylon3D(props) {
    let width = props.width
    let height = props.height
    
    var handleResize = function(){
        if (engine) {
            engine.resize()
        }
    }
    window.addEventListener('resize', handleResize, true)

    var initEngine = async function() {
        const canvas = document.getElementById('canvas_3d')  
        if ("gpu" in navigator) {
            engine = new BABYLON.WebGPUEngine(canvas)
            await engine.initAsync()
            if (engine) {
                console.log('Babylon engine ready...')
                timer = window.setInterval(createScene, 100)
            }
        } else {
            console.log('Browser does not support WebGPU...')
        }
    }

    //DEBUG STUFF!
    var debugScene = function (skeleton, mesh, showLayer=false) {
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
        
        let skeletonView = new BABYLON.Debug.SkeletonViewer(
            skeleton, 
            mesh,
            scene,
            false, //autoUpdateBoneMatrices?
            (mesh.renderingGroupId > 0 )?mesh.renderingGroupId+1:1,  // renderingGroup
            options
        )

        if (showLayer)
            scene.debugLayer.show()
        //scene.beginAnimation(skeleton, 0, 300, true)    
    }

    var loadScene = function (path, model) {
    
        BABYLON.SceneLoader.ImportMesh("", path, model, scene,
            function (meshes, particleSystems, skeletons) {          
                scene.createDefaultCameraOrLight(true, true, true)
                var helper = scene.createDefaultEnvironment()
                var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene)
                light.intensity = 1.0
                helper.setMainColor(BABYLON.Color3.Gray())
                var skeleton = skeletons[0]
        		var bones = skeleton.bones
                //console.log(bones.length)
               
                var mesh = meshes[0]
	        	mesh.rotation.y = Math.PI 
                
                debugScene(skeleton, mesh)

                //render loop
                engine.runRenderLoop(function(){
                    if (scene) { 
                        scene.render() 
                    }
                })
            }
        )
    }

    var createScene = function(){
        if (timer) clearTimeout(timer)
        if (!engine) return

        scene = new BABYLON.Scene(engine)
        let path = "./scenes/dummy3/"
        let model = "dummy3.babylon"
        loadScene(path, model)
    }

    useEffect(() => {
        console.log('3D model mounted')
        // Load the 3D engine
        if (!engine)
            initEngine()
 
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

export default Babylon3D