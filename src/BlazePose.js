// https://blog.tensorflow.org/2021/08/3d-pose-detection-with-mediapipe-blazepose-ghum-tfjs.html
import React, { useEffect } from 'react'
import * as poseDetection from '@tensorflow-models/pose-detection'
import '@tensorflow/tfjs-backend-webgl'
import '@mediapipe/pose'

let model = null
let detector = null
let poses = null
//let timer1 = null
let firstDetect = false

function BlazePose(props) {
    // Must be a multiple of 32 and defaults to 256. The recommended range is [128, 512]
    let width  = props.width  -  props.width  % 32
    let height = props.height -  props.height % 32

    var initDetector = async function() {
        model = poseDetection.SupportedModels.BlazePose
        const detectorConfig =  {
                                    runtime: 'tfjs',        // 'mediapipe' or 'tfjs'
                                    modelType: 'lite',      // 'lite ', 'full', 'heavy'
                                    multiPoseMaxDimension: 512
                                }
        const timestamp = performance.now()
        detector = await poseDetection.createDetector(model, detectorConfig, timestamp)
        console.log('3D POSE detector ready...')
        //timer1 = window.setInterval(detectPoses, 500)
        window.requestAnimationFrame(estimatePose)
    }

   
    var estimatePose = async function() {
        if (!firstDetect) {
            console.log('3D POSE warmup detecting...')
        }

        const video = document.getElementById('dance_video')
        video.pause()

        const timestamp = performance.now()
        poses = await detector.estimatePoses(video)
        console.log(performance.now() - timestamp)

        if (!firstDetect) {
            console.log('3D POSE frist detecting done...')
            firstDetect = true
        }
        
        console.log(poses[0]?.keypoints3D[0])
        //console.log(poses[0]?.keypoints[0])
        poses = []

        video.play()
        window.requestAnimationFrame(estimatePose)
    }

    useEffect(() => {
        console.log('BlazePose mounted')

        // Load the 3D engine
        if (!model) {
            initDetector()
        }
        
        return () => {
            console.log('BlazePose unmounted')
            /*
            if (timer1) {
                clearTimeout(timer1)
            }
            */
    }
    }) 

    return (
        <div>
            <video 
                id = "dance_video"
                src = "dancing_girl.mp4" loop
                width= {width}
                height= {height}
                preload= "auto"
                muted= "muted"
            />
        </div>
    )
}


export default BlazePose