import React, { useEffect } from 'react'
import * as BABYLON from '@babylonjs/core'

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

    var loadScene = function (path, model) {
    
        BABYLON.SceneLoader.ImportMesh("", path, model, scene,
            function (meshes, particleSystems, skeletons) {          
                scene.createDefaultCameraOrLight(true, true, true)
                scene.createDefaultEnvironment()
                scene.beginAnimation(skeletons[0], 0, 300, true)
                var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene)
                light.intensity = 1.0
                light.specular = BABYLON.Color3.Black()

                //render loop
                engine.runRenderLoop(function(){
                    if (scene) { 
                        scene.render() 
                    }
                })
            }
        )
    
        return scene;
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