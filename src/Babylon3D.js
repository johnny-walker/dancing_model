import React, { useEffect } from 'react'
import * as BABYLON from 'babylonjs'
import 'babylonjs-inspector'

let g_engine = null
let g_scene = null
let g_skeleton = null
let g_mesh = null
let g_helper = null

let detectedBones = []
let g_matrix = null
let g_scaling = 1.0
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
    var debugScene = function (showAxis=false, showLayer=false) {
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
            new BABYLON.AxesViewer(g_scene, 1.0)

        if (showLayer)
            g_scene.debugLayer.show()
        //g_scene.beginAnimation(skeleton, 0, 300, true)    
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
               
                //console.log(g_skeleton.bones[0].position)
                //console.log(g_skeleton.bones[60].position)

                g_mesh = meshes[0]
	        	g_mesh.rotation.y = Math.PI 
                
                debugScene()

                g_scene.beforeRender = function () {
                    if (detectedBones.length > 0) {
                        //for (let i=0; i<detectedBones.length; i++ ) {
                        for (let i=23; i<detectedBones.length; i++ ) {
                                let index = dummy3_mapping[i]
                            if (index === undefined) {
                                continue
                            }
                            // setAbsolutePosition
                            let vec3 = detectedBones[i]
                            //console.log(vec3)
                            g_skeleton.bones[index].setAbsolutePosition(vec3, g_mesh)
                        }
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
        g_matrix = null

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

const dummy3_mapping = {
    0:  5,              //nose, mixamorig:Head (5)
    1: undefined,       //left_eye_inner, (undefined)
    2:  7,              //left_eye, mixamorig:LeftEye (7)
    3: undefined,       //left_eye_outer, (undefined)
    4: undefined,       //right_eye_inner, (undefined)
    5:  8,              //right_eye, mixamorig:RightEye (8)
    6: undefined,       //right_eye_outer, (undefined)
    7: undefined,       //left_ear, (undefined)
    8: undefined,       //right_ear, (undefined)
    9: undefined,       //mouth_left, (undefined)
    10:undefined,       //mouth_right, (undefined)
    11: 9,              //left_shoulder, mixamorig:LeftShoulder (9)
    12: 33,             //right_shoulder, mixamorig:RightShoulder (33)
    13: 10,             //left_elbow, mixamorig:LeftArm (10)
    14: 34,             //right_elbow, mixamorig:RightArm(34)   
    15: 11,             //left_wrist, mixamorig:LeftForeArm (11) 
    16: 35,             //right_wrist, mixamorig:RightForeArm (35)
    17: 31,             //left_pinky, mixamorig:LeftHandPinky1~4 (29~32)    
    18: 55,             //right_pinky, mixamorig:RightHandPinky1~4 (53~56)   
    19: 23,             //left_index, mixamorig:LeftHandIndex1~4 (21~24)
    20: 47,             //right_index, mixamorig:RightHandIndex1~4 (45~48)
    21: 19,             //left_thumb, mixamorig:LeftHandThumb1~4 (17~20)   
    22: 43,             //right_thumb, mixamorig:RightHandThumb1~4 (14~44)
    23: undefined,      //left_hip, (undefined)
    24: undefined,      //right_hip, (undefined)
    25: 62,             //left_knee, mixamorig:LeftUpLeg (62)       
    26: 57,             //right_knee, mixamorig:RightUpLeg (57)
    27: 63,             //left_ankle, mixamorig:LeftLeg (63)
    28: 58,             //right_ankle, mixamorig:RightLeg (58)
    29: 64,             //left_heel, mixamorig:LeftFoot (64)
    30: 59,             //right_heel, mixamorig:RightFoot (59)     
    31: 65,             //left_foot_index, mixamorig:LeftToeBase (65)
    32: 60,             //right_foot_index, mixamorig:RightFoot (60)
}

export const UpdateKeypoints = (bones) => {
    if (bones === undefined || bones.length !== 33) {
        console.log("UpdateKeypoints:: wrong paramenter")
        return
    }
    
    //console.log(bones[0])
    //console.log(bones[23])
    //console.log(bones[24])
    //console.log(bones[29])
    //console.log(bones[30])

    if(g_matrix === null) {
        g_matrix = BABYLON.Matrix.RotationAxis(new BABYLON.Vector3(1, 0, 0),  Math.PI)
        let translate = ( (bones[29].y-bones[23].y) + (bones[30].y-bones[24].y) ) / 2
        g_scaling = 1.0 / translate
        let vecDisp = new BABYLON.Vector3(0, translate, 0)
        g_matrix.setTranslation(vecDisp)
    }

    detectedBones = []
    for (let i=0; i<bones.length; i++ ) {
        let vec = new BABYLON.Vector3(bones[i].x, bones[i].y, bones[i].z)

        vec = BABYLON.Vector3.TransformCoordinates(vec, g_matrix).scale(g_scaling)
        detectedBones.push(vec)
    }
}
