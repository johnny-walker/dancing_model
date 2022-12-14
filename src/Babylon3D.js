import React, { useEffect } from 'react'
import * as BABYLON from '@babylonjs/core'

let engine = null
let scene = null
let timer = null

function Babylon3D(props) {
    let width = props.width
    let height = props.height
    
    var handleResize = function(){
        width = window.innerWidth*3/4 - 12*5
        height= window.innerHeight - 64 - 12*3
        if (engine) {
            engine.resize()
        }
    }
    window.addEventListener('resize', handleResize, true)

    var initEngine = async function(){
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
    
    var createScene = function(){
        if (timer) clearTimeout(timer)
        if (!engine) return

        // This creates a basic Babylon Scene object (non-mesh)
        scene = new BABYLON.Scene(engine);
  
        const canvas = document.getElementById('canvas_3d')    
        // This creates and positions a free camera (non-mesh)
        const camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene)
        // This targets the camera to scene origin
        camera.setTarget(BABYLON.Vector3.Zero())
        // This attaches the camera to the canvas
        camera.attachControl(canvas, true)
        // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
        const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene)
        // Default intensity is 1. Let's dim the light a small amount
        light.intensity = 0.7
        // Our built-in 'sphere' shape.
        const sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter: 2, segments: 32}, scene)
        // Move the sphere upward 1/2 its height
        sphere.position.y = 1

        //render loop
        engine.runRenderLoop(function(){
            if (scene)
                scene.render()
        })
    }

    useEffect(() => {
        console.log('3D model mounted')
        // Load the 3D engine
        if (!engine)
            initEngine()
 
        return () => {
            console.log('3D model unmounted')
        }
    }, [])  //[] means props changes wont invoke again

    return (
        <div>
            <canvas id="canvas_3d" width={width} height={height}/>
       </div>
    )
}

export default Babylon3D