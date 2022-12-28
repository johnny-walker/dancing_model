// dummy.babylon
import * as BABYLON from 'babylonjs'

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

let alignMatrix = null
let scaling = null

let boneVectors = []
let blazePoses = []

export const TransformLandmarks = (landmarks) => {
    blazePoses = []
    initLandmarkAlginment(landmarks)
    for (let i=0; i<landmarks.length; i++ ) {
        let landmark = new BABYLON.Vector3(landmarks[i].x, landmarks[i].y, landmarks[i].z)

        landmark = BABYLON.Vector3.TransformCoordinates(landmark, alignMatrix).scale(scaling)
        blazePoses.push(landmark)
    }
}

export const GetPoseCenter = () => {
    let ret = null
    if (blazePoses.length === 33) {
        ret = new BABYLON.Vector3( (blazePoses[23].x + blazePoses[24].x)/2,
                                   (blazePoses[23].y + blazePoses[24].y)/2,
                                   (blazePoses[23].z + blazePoses[24].z)/2 ) //center

    } 
    if (ret === null) {
        console.log('warning: center lost...')
    }
    return ret
}

export const GetPosePosition = (index) => {
    let ret = null
    if (blazePoses.length > index) {
        ret = blazePoses[index]
    }
    return ret
}

//algin video's person with 3D model 
//3d model's 3D origin(center) is at hip
//detected video skeleton should align with 3D model's center, as well as aling the scale of the body

const initLandmarkAlginment = (landmarks) => {
    //video y-axis positive direction is down (upside down with 3d model's y-axis) 
    alignMatrix = BABYLON.Matrix.RotationAxis(new BABYLON.Vector3(1, 0, 0),  Math.PI)

    //3d model's hip location is 1 meter height
    //align and scale video skeleton's hip, (as detected height depends on the distance from camera) 
    let height_of_hip = ( (landmarks[29].y-landmarks[23].y) + (landmarks[30].y-landmarks[24].y) ) / 2  
    if (height_of_hip !== undefined) {
        scaling = 1.0 / height_of_hip
        let displacement = new BABYLON.Vector3(0, height_of_hip, 0)
        alignMatrix.setTranslation(displacement)   
    } else {
        console.log('warning: landmarks info NAN...')
    }
}