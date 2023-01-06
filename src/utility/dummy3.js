// dummy.babylon
import * as BABYLON from 'babylonjs'
import {GetAlignmentMatrix, GetRotationMatrix} from './rotation.js'

let alignMatrix = null

let NUMBER_OF_LANDMARKS = 33
let NUMBER_OF_BONES = 67

let blazePoses = [] //store revised transformation results of the 33 landmarks    
let modelBones = [] //store detected direction of aligned 3D model's 67 bones

export const TransformLandmarks = (landmarks) => {
    //algin video's person with 3D model 
    //3d model's 3D origin(center) is at hip
    //detected video skeleton should align with 3D model's center, as well as aling the scale of the body
    const landmarkAlignment = (landmarks) => {
        //BlazePose y-axis direction (down is positive) is inverse with Babylon 
        alignMatrix = BABYLON.Matrix.RotationAxis(new BABYLON.Vector3(1, 0, 0),  Math.PI)
        //3d model's hip location is 1 meter height
        //align skeleton's hip, (detected height depends on the distance from camera) 
        let height_of_hip = ( (landmarks[29].y-landmarks[23].y) + (landmarks[30].y-landmarks[24].y) ) / 2  
        if (height_of_hip !== undefined ) {
            let displacement = new BABYLON.Vector3(0, height_of_hip, 0)
            alignMatrix.setTranslation(displacement)   
        } else {
            console.log('warning: landmarks info NAN...')
        }
    }
    
    blazePoses = []
    modelBones = []

    for (let i=0; i< NUMBER_OF_BONES; i++) {
        modelBones.push(null)
    }

    if (alignMatrix === null)
        landmarkAlignment(landmarks)

    for (let i=0; i<landmarks.length; i++ ) {
        let landmark = new BABYLON.Vector3(landmarks[i].x, landmarks[i].y, landmarks[i].z)
        landmark = BABYLON.Vector3.TransformCoordinates(landmark, alignMatrix)
        // BlazePose x-axis direction is inverse with Babylon
        landmark.x = - landmark.x   
        blazePoses.push(landmark)
    }

    transformBody(blazePoses)
    transformHead(blazePoses)
    transformLeftHand(blazePoses)
    transformRightHand(blazePoses)
    transformRightLeg(blazePoses)
    transformLeftLeg(blazePoses)
}

export const RotateSpinBody = (bones, mesh) => {
    rotateBones(bones, mesh)
    spinBody(bones)
}

export const GetLandmarkDirection = (index) => {
    let ret = null
    if (index < modelBones.length) {
        ret = modelBones[index]
    }
    return ret
}

export const GetPoseCenter = () => {
    let ret = null
    if (blazePoses.length === NUMBER_OF_LANDMARKS) {
        ret = new BABYLON.Vector3( (blazePoses[23].x + blazePoses[24].x)/2,
                                   (blazePoses[23].y + blazePoses[24].y)/2,
                                   (blazePoses[23].z + blazePoses[24].z)/2 ) //center

    } 
    if (ret === null) {
        console.log('warning: center lost...')
    }
    return ret
}

export const GetModelBones = () => {
    return modelBones
}

export const GetBlazePoses = () => {
    return blazePoses
}

const rotateBones = (bones, mesh) => {
    // World Space direction
    const getBoneDirection = (bones, i, mesh) => {
        let UV = null
        let V = bones[i].getPosition(BABYLON.Space.WORLD, mesh)
        let parent = bones[i].getParent()
        if (parent !== null) {
            let U = parent.getPosition(BABYLON.Space.WORLD, mesh)
            UV = new BABYLON.Vector3(V.x-U.x, V.y-U.y, V.z-U.z)
        } else {
            UV = V
        }
        return UV
    }

    let matrix = new BABYLON.Matrix.Identity()
    for (let i=0; i< bones.length; i++) {
        //console.log(`${i}: ${bones[i].name}`)
        let V = GetLandmarkDirection(i)
        if (V !== null) {
            let U = getBoneDirection(bones, i, mesh)
            if (i === 57 || i === 62){  
                // 3D model's hip-leg bones are 45 degree, should align with y-axis
                U = new BABYLON.Vector3(0, 1, 0)
                matrix = GetAlignmentMatrix(U, V)
            } else {
                matrix = GetAlignmentMatrix(U, V)
            }
            bones[i].setRotationMatrix(matrix) 
        }
    }    
}

const spinBody = (bones) => {
    // spin upper body
    let angle = getBodySpinAngle(0)
    let matrix = GetRotationMatrix(0, angle, 0)
    bones[2].setRotationMatrix(matrix) 
    bones[3].setRotationMatrix(matrix) 

    // spin hip
    angle = getBodySpinAngle(1)/4
    matrix = GetRotationMatrix(0, angle, 0)
    bones[0].setRotationMatrix(matrix) 
    bones[1].setRotationMatrix(matrix) 

}

const getBodySpinAngle = (index) => {
    let direction = null
    if ( index === 0 ) {
        //should spin
        direction = new BABYLON.Vector3(blazePoses[12].x-blazePoses[11].x, 
                                        blazePoses[12].y-blazePoses[11].y, 
                                        blazePoses[12].z-blazePoses[11].z)   
    } else if ( index === 1 ) {
        //hip spin
        direction = new BABYLON.Vector3(blazePoses[24].x-blazePoses[23].x, 
                                        blazePoses[24].y-blazePoses[23].y, 
                                        blazePoses[24].z-blazePoses[23].z)   
    } 
    // calculate angle
    let unitX = new BABYLON.Vector3(1, 0, 0) 
    let projXZ = new BABYLON.Vector3(direction.x, 0, direction.z).normalize() 
    let AdotB = BABYLON.Vector3.Dot(unitX, projXZ)
    let angle = Math.acos(AdotB)
    
    // calculate sign, acos range between 0 ~ pie, must judge the sign
    let AxB =  BABYLON.Vector3.Cross(unitX, projXZ)
    angle = (AxB.y<0) ? -angle : angle

    return angle
}

const transformBody = (landmarks) => {
    //0: 'mixamorig:Hips'
    let keypoint1 = new BABYLON.Vector3((landmarks[23].x+landmarks[24].x)/2, 
                                        (landmarks[23].y+landmarks[24].y)/2, 
                                        (landmarks[23].z+landmarks[24].z)/2)
    modelBones[0] = keypoint1
    
    //4: 'mixamorig:Neck'
    let keypoint2 = new BABYLON.Vector3((landmarks[11].x+landmarks[12].x)/2, 
                                        (landmarks[11].y+landmarks[12].y)/2, 
                                        (landmarks[11].z+landmarks[12].z)/2)   
    modelBones[4] = keypoint2

    //1: 'mixamorig:Spine'                                   
    //2: 'mixamorig:Spine1'                                    
    //3: 'mixamorig:Spine2'                                   
    let intepolate = new BABYLON.Vector3((keypoint1.x+keypoint2.x)*3/4, 
                                         (keypoint1.y+keypoint2.y)*3/4, 
                                         (keypoint1.z+keypoint2.z)*3/4)  
    modelBones[3] = intepolate
                                       
}

const transformHead = (landmarks) => {
    //5: 'mixamorig:Head'
    let keypoint1 = new BABYLON.Vector3((landmarks[9].x+landmarks[10].x)/2, 
                                        (landmarks[9].y+landmarks[10].y)/2, 
                                        (landmarks[9].z+landmarks[10].z)/2)

    let keypoint2 = new BABYLON.Vector3(landmarks[0].x-keypoint1.x, 
                                        landmarks[0].y-keypoint1.y, 
                                        landmarks[0].z-keypoint1.z)    
    //modelBones[5] = keypoint2   

    //6: 'mixamorig:HeadTop_End'    
    //7: 'mixamorig:LeftEye'
    keypoint1 = new BABYLON.Vector3(landmarks[2].x-landmarks[0].x, 
                                    landmarks[2].y-landmarks[0].y, 
                                    landmarks[2].z-landmarks[0].z)
    modelBones[7] = keypoint1   
    
    //8: 'mixamorig:RightEye'
    keypoint2 = new BABYLON.Vector3(landmarks[5].x-landmarks[0].x, 
                                    landmarks[5].y-landmarks[0].y, 
                                    landmarks[5].z-landmarks[0].z)
    modelBones[8] = keypoint2                                    
}

const transformLeftHand = (landmarks) => {
    //9: 'mixamorig:LeftShoulder'
    let keypoint1 = new BABYLON.Vector3(landmarks[11].x-landmarks[12].x, 
                                        landmarks[11].y-landmarks[12].y, 
                                        landmarks[11].z-landmarks[12].z)
    //modelBones[9] = keypoint1    

    //10:'mixamorig:LeftArm'
    keypoint1 = new BABYLON.Vector3(landmarks[13].x-landmarks[11].x, 
                                    landmarks[13].y-landmarks[11].y, 
                                    landmarks[13].z-landmarks[11].z)
    modelBones[10] = keypoint1    

    //11:'mixamorig:LeftForeArm'
    keypoint1 = new BABYLON.Vector3(landmarks[15].x-landmarks[13].x, 
                                    landmarks[15].y-landmarks[13].y, 
                                    landmarks[15].z-landmarks[13].z)
    modelBones[11] = keypoint1   

    //12:'mixamorig:LeftHand'
    keypoint1 = new BABYLON.Vector3((landmarks[19].x-landmarks[15].x), 
                                    (landmarks[19].y-landmarks[15].y), 
                                    (landmarks[19].z-landmarks[15].z))
    modelBones[12] = keypoint1    

    // Thumb keeps original direction
    //17:'mixamorig:LeftHandThumb1'
    //18:'mixamorig:LeftHandThumb2'
    //19:'mixamorig:LeftHandThumb3'
    //20:'mixamorig:LeftHandThumb4'
  
    // the other fingers change based on the same interpolation vector 
    let intepolate = new BABYLON.Vector3((landmarks[19].x+landmarks[21].x)/2, 
                                         (landmarks[19].y+landmarks[21].y)/2, 
                                         (landmarks[19].z+landmarks[21].z)/2)
    keypoint1 = new BABYLON.Vector3((intepolate.x-landmarks[15].x), 
                                    (intepolate.y-landmarks[15].y), 
                                    (intepolate.z-landmarks[15].z))
    //13:'mixamorig:LeftHandMiddle1'
    //14:'mixamorig:LeftHandMiddle2'
    //15:'mixamorig:LeftHandMiddle3'
    //16:'mixamorig:LeftHandMiddle4'
    modelBones[13] = keypoint1    
    //modelBones[14] = keypoint1    
    //modelBones[15] = keypoint1    
    //modelBones[16] = keypoint1    

    //21:'mixamorig:LeftHandIndex1'
    //22:'mixamorig:LeftHandIndex2'
    //23:'mixamorig:LeftHandIndex3'
    //24:'mixamorig:LeftHandIndex4'
    modelBones[21] = keypoint1    
    //modelBones[22] = keypoint1  
    //modelBones[23] = keypoint1  
    //modelBones[24] = keypoint1  

    //25:'mixamorig:LeftHandRing1'
    //26:'mixamorig:LeftHandRing2'
    //27:'mixamorig:LeftHandRing3'
    //28:'mixamorig:LeftHandRing4'
    modelBones[25] = keypoint1    
    //modelBones[26] = keypoint1    
    //modelBones[27] = keypoint1    
    //modelBones[28] = keypoint1    

    //29:'mixamorig:LeftHandPinky1'
    //30:'mixamorig:LeftHandPinky2'
    //31:'mixamorig:LeftHandPinky3'
    //32:'mixamorig:LeftHandPinky4'
    modelBones[29] = keypoint1    
    //modelBones[30] = keypoint1    
    //modelBones[31] = keypoint1    
    //modelBones[32] = keypoint1    
}

const transformRightHand = (landmarks) => {
    //33:'mixamorig:RightShoulder'
    let keypoint1 = new BABYLON.Vector3(landmarks[12].x-landmarks[11].x, 
                                        landmarks[12].y-landmarks[11].y, 
                                        landmarks[12].z-landmarks[11].z)
    //modelBones[33] = keypoint1    
    //34:'mixamorig:RightArm'
    keypoint1 = new BABYLON.Vector3(landmarks[14].x-landmarks[12].x, 
                                    landmarks[14].y-landmarks[12].y, 
                                    landmarks[14].z-landmarks[12].z)
    modelBones[34] = keypoint1    

    //35:'mixamorig:RightForeArm'
    keypoint1 = new BABYLON.Vector3(landmarks[16].x-landmarks[14].x, 
                                    landmarks[16].y-landmarks[14].y, 
                                    landmarks[16].z-landmarks[14].z)
    modelBones[35] = keypoint1   

    //36:'mixamorig:RightHand'
    keypoint1 = new BABYLON.Vector3(landmarks[20].x-landmarks[16].x, 
                                    landmarks[20].y-landmarks[16].y, 
                                    landmarks[20].z-landmarks[16].z)
    modelBones[36] = keypoint1  

    // Thumb keeps original direction
    //41:'mixamorig:RightHandThumb1'
    //42:'mixamorig:RightHandThumb2'
    //43:'mixamorig:RightHandThumb3'
    //44:'mixamorig:RightHandThumb4'
    
    // the other fingers change based on the same interpolation vector 
    let intepolate = new BABYLON.Vector3((landmarks[20].x+landmarks[22].x)/2, 
                                         (landmarks[20].y+landmarks[22].y)/2, 
                                         (landmarks[20].z+landmarks[22].z)/2)
    keypoint1 = new BABYLON.Vector3((intepolate.x-landmarks[16].x), 
                                    (intepolate.y-landmarks[16].y), 
                                    (intepolate.z-landmarks[16].z))
    //37:'mixamorig:RightHandMiddle1'
    //38:'mixamorig:RightHandMiddle2'
    //39:'mixamorig:RightHandMiddle3'
    //40:'mixamorig:RightHandMiddle4'
    modelBones[37] = keypoint1    
    //modelBones[38] = keypoint1    
    //modelBones[39] = keypoint1    
    //modelBones[40] = keypoint1   

    //45:'mixamorig:RightHandIndex1'
    //46:'mixamorig:RightHandIndex2'
    //47:'mixamorig:RightHandIndex3'
    //48:'mixamorig:RightHandIndex4'
    modelBones[45] = keypoint1    
    //modelBones[46] = keypoint1    
    //modelBones[47] = keypoint1    
    //modelBones[48] = keypoint1  

    //49:'mixamorig:RightHandRing1'
    //50:'mixamorig:RightHandRing2'
    //51:'mixamorig:RightHandRing3'
    //52:'mixamorig:RightHandRing4'
    modelBones[49] = keypoint1    
    //modelBones[50] = keypoint1    
    //modelBones[51] = keypoint1    
    //modelBones[52] = keypoint1 

    //53:'mixamorig:RightHandPinky1'
    //54:'mixamorig:RightHandPinky2'
    //55:'mixamorig:RightHandPinky3'
    //56:'mixamorig:RightHandPinky4'
    modelBones[53] = keypoint1    
    //modelBones[54] = keypoint1    
    //modelBones[55] = keypoint1    
    //modelBones[56] = keypoint1     
}

const transformRightLeg = (landmarks) => {
    //57:'mixamorig:RightUpLeg'
    let keypoint1 = new BABYLON.Vector3(landmarks[26].x-landmarks[24].x, 
                                        landmarks[26].y-landmarks[24].y, 
                                        landmarks[26].z-landmarks[24].z)
    modelBones[57] = landmarks[24]  

    //58:'mixamorig:RightLeg'
    keypoint1 = new BABYLON.Vector3(landmarks[28].x-landmarks[26].x, 
                                    landmarks[28].y-landmarks[26].y, 
                                    landmarks[28].z-landmarks[26].z)
    //modelBones[58] = keypoint1  

    //59:'mixamorig:RightFoot'
    keypoint1 = new BABYLON.Vector3(landmarks[32].x-landmarks[28].x, 
                                    landmarks[32].y-landmarks[28].y, 
                                    landmarks[32].z-landmarks[28].z)
    //modelBones[59] = keypoint1  

    //60:'mixamorig:RightToeBase'
    keypoint1 = new BABYLON.Vector3(landmarks[30].x-landmarks[28].x, 
                                    landmarks[30].y-landmarks[28].y, 
                                    landmarks[30].z-landmarks[28].z)
    //modelBones[60] = keypoint1  
    //61:'mixamorig:RightToe_End'
}

const transformLeftLeg = (landmarks) => {
    //62:'mixamorig:LeftUpLeg'
    let keypoint1 = new BABYLON.Vector3(landmarks[25].x-landmarks[23].x, 
                                        landmarks[25].y-landmarks[23].y, 
                                        landmarks[25].z-landmarks[23].z)
    modelBones[62] = landmarks[23]      

    //63:'mixamorig:LeftLeg'
    keypoint1 = new BABYLON.Vector3(landmarks[27].x-landmarks[25].x, 
                                    landmarks[27].y-landmarks[25].y, 
                                    landmarks[27].z-landmarks[25].z)
    //modelBones[63] = keypoint1  

    //64:'mixamorig:LeftFoot'
    keypoint1 = new BABYLON.Vector3(landmarks[31].x-landmarks[27].x, 
                                    landmarks[31].y-landmarks[27].y, 
                                    landmarks[31].z-landmarks[27].z)
    //modelBones[64] = keypoint1      

    //65:'mixamorig:LeftToeBase'
    keypoint1 = new BABYLON.Vector3(landmarks[29].x-landmarks[27].x, 
                                    landmarks[29].y-landmarks[27].y, 
                                    landmarks[29].z-landmarks[27].z)
    //modelBones[65] = keypoint1  
    //66:'mixamorig:LeftToe_End'
}

/* bones info
let BoneNames = {
    0: 'mixamorig:Hips',
    1: 'mixamorig:Spine', 
    2: 'mixamorig:Spine1',
    3: 'mixamorig:Spine2',
    4: 'mixamorig:Neck',
    5: 'mixamorig:Head',
    6: 'mixamorig:HeadTop_End',
    7: 'mixamorig:LeftEye',
    8: 'mixamorig:RightEye',
    9: 'mixamorig:LeftShoulder',
    10:'mixamorig:LeftArm',
    11:'mixamorig:LeftForeArm',
    12:'mixamorig:LeftHand',
    13:'mixamorig:LeftHandMiddle1',
    14:'mixamorig:LeftHandMiddle2',
    15:'mixamorig:LeftHandMiddle3',
    16:'mixamorig:LeftHandMiddle4',
    17:'mixamorig:LeftHandThumb1',
    18:'mixamorig:LeftHandThumb2',
    19:'mixamorig:LeftHandThumb3',
    20:'mixamorig:LeftHandThumb4',
    21:'mixamorig:LeftHandIndex1',
    22:'mixamorig:LeftHandIndex2',
    23:'mixamorig:LeftHandIndex3',
    24:'mixamorig:LeftHandIndex4',
    25:'mixamorig:LeftHandRing1',
    26:'mixamorig:LeftHandRing2',
    27:'mixamorig:LeftHandRing3',
    28:'mixamorig:LeftHandRing4',
    29:'mixamorig:LeftHandPinky1',
    30:'mixamorig:LeftHandPinky2',
    31:'mixamorig:LeftHandPinky3',
    32:'mixamorig:LeftHandPinky4',
    33:'mixamorig:RightShoulder',
    34:'mixamorig:RightArm',
    35:'mixamorig:RightForeArm',
    36:'mixamorig:RightHand',
    37:'mixamorig:RightHandMiddle1',
    38:'mixamorig:RightHandMiddle2',
    39:'mixamorig:RightHandMiddle3',
    40:'mixamorig:RightHandMiddle4',
    41:'mixamorig:RightHandThumb1',
    42:'mixamorig:RightHandThumb2',
    43:'mixamorig:RightHandThumb3',
    44:'mixamorig:RightHandThumb4',
    45:'mixamorig:RightHandIndex1',
    46:'mixamorig:RightHandIndex2',
    47:'mixamorig:RightHandIndex3',
    48:'mixamorig:RightHandIndex4',
    49:'mixamorig:RightHandRing1',
    50:'mixamorig:RightHandRing2',
    51:'mixamorig:RightHandRing3',
    52:'mixamorig:RightHandRing4',
    53:'mixamorig:RightHandPinky1',
    54:'mixamorig:RightHandPinky2',
    55:'mixamorig:RightHandPinky3',
    56:'mixamorig:RightHandPinky4',
    57:'mixamorig:RightUpLeg',
    58:'mixamorig:RightLeg',
    59:'mixamorig:RightFoot',
    60:'mixamorig:RightToeBase',
    61:'mixamorig:RightToe_End',
    62:'mixamorig:LeftUpLeg',
    63:'mixamorig:LeftLeg',
    64:'mixamorig:LeftFoot',
    65:'mixamorig:LeftToeBase',
    66:'mixamorig:LeftToe_End'
}
*/

