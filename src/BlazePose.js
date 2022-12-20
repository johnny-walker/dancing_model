// https://blog.tensorflow.org/2021/08/3d-pose-detection-with-mediapipe-blazepose-ghum-tfjs.html
import React, { useEffect } from 'react'
import * as poseDetection from '@tensorflow-models/pose-detection'
import '@tensorflow/tfjs-backend-webgl'
import '@mediapipe/pose'

let model = null
let detector = null
let poses = null
let timer = null
let firstDetect = false

function BlazePose(props) {

    var initDetector = async function() {
        model = poseDetection.SupportedModels.BlazePose
        const detectorConfig =  {
                                    runtime: 'tfjs',    // 'mediapipe' or 'tfjs'
                                    enableSmoothing: true,
                                    modelType: 'lite'   // 'lite ', 'full', 'heavy'
                                }
        const timestamp = performance.now()
        detector = await poseDetection.createDetector(model, detectorConfig, timestamp)
        console.log('3D POSE detector ready...')
        timer = window.setInterval(detectPoses, 500)
    }

    var detectPoses = async function(){
        if (!model || !detector) {
            return
        }
        const video = document.getElementById('dance_video')

        clearTimeout(timer)
        video.pause()

        if (!firstDetect) {
            console.log('3D POSE first detecting...')
        }

        const timestamp = performance.now()
        poses = await detector.estimatePoses(video)
        console.log(performance.now() - timestamp)
        
        if (!firstDetect) {
            console.log('3D POSE frist detecting done...')
            firstDetect = true
        }
        video.play()


        console.log(poses[0].keypoints3D[0])
        //console.log(poses[0].keypoints[0])

        timer = window.setInterval(detectPoses, 1000)
    }

    useEffect(() => {
        console.log('BlazePose mounted')
        // Load the 3D engine
        if (!model) {
            initDetector()
        }
        
        return () => {
            console.log('BlazePose unmounted')
            if (timer) {
                clearTimeout(timer)
            }
    }
    }) 

    return (
        <video
            id = "dance_video"
            src = "dancing_girl.mp4" loop
            width= "100%"
            height= ""
            preload= "auto"
            muted= "muted"
        />
    )
}


export default BlazePose