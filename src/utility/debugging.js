import * as BABYLON from 'babylonjs'

let g_skeleton = null
let g_sphere = null
export const  DebugScene = function (scene, mesh, skeleton, showSphere=true, showViewer=true, showAxis=true, showLayer=false) {
    g_skeleton = skeleton
    //debug to show landmark location 
    if (showSphere) {
        g_sphere = BABYLON.MeshBuilder.CreateSphere("sphere", { diameterX: 0.1, 
                                                                diameterY: 0.1, 
                                                                diameterZ: 0.1 }, scene)
                    
        var material = new BABYLON.StandardMaterial(scene)
        material.alpha = 1
        material.diffuseColor = new BABYLON.Color3(1.0, 0.2, 0.7)
        g_sphere.material = material
    }
    if (showViewer) {   
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
            skeleton, 
            mesh,
            scene,
            false, //autoUpdateBoneMatrices?
            (mesh.renderingGroupId > 0 ) ? mesh.renderingGroupId+1:1,  // renderingGroup
            options
        )
    }

    if (showAxis) {
        new BABYLON.AxesViewer(scene, 0.25)
    }

    if (showLayer) {
        scene.debugLayer.show()
    }
    
    /* print out bone names    
    let index = 0
    skeleton.bones.forEach(
        bone => {
            console.log(`${index}:${bone.name}`)
            index++
        }
    )
    */
}

export const ShowBonePos = function (index) {
    if (g_sphere !== null) {
        let bones = g_skeleton.bones
        /*
        let vector = new BABYLON.Vector3(bones[index].getPosition().x, 
                                         bones[index].getPosition().y,
                                         bones[index].getPosition().z)
        */
        g_sphere.position = bones[index].getPosition() //vector
    }
}