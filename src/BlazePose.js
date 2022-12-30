// https://blog.tensorflow.org/2021/08/3d-pose-detection-with-mediapipe-blazepose-ghum-tfjs.html
import React, { useEffect } from 'react'
import * as poseDetection from '@tensorflow-models/pose-detection'
import '@tensorflow/tfjs-backend-webgl'
import '@mediapipe/pose'

let detectorInvoked = false
let resumePlayback = false
let warmedUp = false
let timer = null

let g_pose = null
let g_funUpdateKeypoints = null

function BlazePose(props) {
    let detector = null

    // Must be a multiple of 32 and defaults to 256. The recommended range is [128, 512]
    let width  = props.width  -  props.width  % 32
    let height = props.height -  props.height % 32
    console.log('res:('+width+','+height+')')
    var initDetector = async function() {
        const model = poseDetection.SupportedModels.BlazePose
        const detectorConfig =  {
                                    runtime: 'tfjs',        // 'mediapipe' or 'tfjs'
                                    modelType: 'lite',      // 'lite ', 'full', 'heavy'
                                    multiPoseMaxDimension: 512
                                }
        const timestamp = performance.now()
        detector = await poseDetection.createDetector(model, detectorConfig, timestamp)
        console.log('3D POSE detector ready...')
        console.log(performance.now() - timestamp)

        //window.requestAnimationFrame(estimatePose)    // too early
        timer = window.setInterval(estimatePose, 100)   // delay for 0.1 sec
    }


    var estimatePose = async function() {
        if (!warmedUp) 
        {
            console.log('3D POSE warm up detecting...')
            clearTimeout(timer)
        }

        const video = document.getElementById('dance_video')
        video.pause()

        const timestamp = performance.now()
        let poses = await detector.estimatePoses(video)

        if (!warmedUp) {
            g_pose = poses[0]
            console.log('3D POSE frist detecting done...')
            console.log(performance.now() - timestamp)
            warmedUp = true
        }

        if (resumePlayback && poses[0] !== undefined) {
            g_pose = poses[0]
            video.play()
            console.log(g_pose)
        } 

        if ( g_funUpdateKeypoints && g_pose !== undefined ) {
            g_funUpdateKeypoints(g_pose.keypoints3D)
        }

        //timer = window.setInterval(estimatePose, 100)
        window.requestAnimationFrame(estimatePose)
    }

    const clickToPlayPause = () => {
        resumePlayback = !resumePlayback 
    }


    useEffect(() => {
        console.log('BlazePose mounted')

        const video = document.getElementById('dance_video')
        video.addEventListener('click', clickToPlayPause, true) 

        // Load the 3D engine
        if (!detectorInvoked) {
            detectorInvoked = true
            initDetector()
        }
        
        return () => {
            console.log('BlazePose unmounted')
            video.addEventListener("click", null, true)
        }
    }) 

    return (
        <div>
            <video 
                id = "dance_video"
                src = {props.src} loop
                width= {width}
                height= {height}
                preload= "auto"
                muted= "muted"
            />
        </div>
    )
}

export const SetCallback = (updateKeypoints) => {
    g_funUpdateKeypoints = updateKeypoints
}
export default BlazePose