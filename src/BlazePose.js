// https://blog.tensorflow.org/2021/08/3d-pose-detection-with-mediapipe-blazepose-ghum-tfjs.html
import React, { useEffect } from 'react'
import * as poseDetection from '@tensorflow-models/pose-detection'
import '@tensorflow/tfjs-backend-webgl'

let model = null
let detector = null
let poses = null
let timer = null

function BlazePose(props) {

    var initDetector = async function() {
        model = poseDetection.SupportedModels.BlazePose
        const detectorConfig =  {
                                    runtime: 'tfjs',
                                    modelType: 'full'
                                }
        detector = await poseDetection.createDetector(model, detectorConfig)
        //timer = window.setInterval(detectPoses, 33)
    }

    var detectPoses = async function(){
        //if (timer) clearTimeout(timer)
        if (!model || !detector) return

        const video = document.getElementById('video')
        poses = await detector.estimatePoses(video)
        console.log(poses)
    }

    useEffect(() => {
        console.log('BlazePose mounted')
        // Load the 3D engine
        if (!model)
            initDetector()
 
        return () => {
            console.log('BlazePose unmounted')
        }
    }) 

    return (
        <video
            src = "dancing_girl.mp4" autoPlay loop
            width= "100%"
            height= ""
            preload= "auto"
            muted= "muted"
        />
    )
}


export default BlazePose