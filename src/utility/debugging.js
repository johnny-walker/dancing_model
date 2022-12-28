import * as BABYLON from 'babylonjs'

let sphere = null
export const  DebugScene = function (scene, mesh, skeleton,  showAxis=true, showLayer=false) {
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
    
    if (showAxis)
        new BABYLON.AxesViewer(scene, 0.25)

    if (showLayer)
        scene.debugLayer.show()
    
    /* print out bone names    
    let index = 0
    skeleton.bones.forEach(
        bone => {
            console.log(`${index}:${bone.name}`)
            index++
        }
    )
    */

    //debug to show hip's (center) location 
    sphere = BABYLON.MeshBuilder.CreateSphere("sphere", { diameterX: 0.1, 
                                                          diameterY: 0.1, 
                                                          diameterZ: 0.1 }, scene)
                
    var material = new BABYLON.StandardMaterial(scene)
    material.alpha = 1
    material.diffuseColor = new BABYLON.Color3(1.0, 0.2, 0.7)
    sphere.material = material
}

export const SetSpherePos = function (landmark) {
    sphere.position = landmark
}