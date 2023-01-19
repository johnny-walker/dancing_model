// https://blog.tensorflow.org/2021/08/3d-pose-detection-with-mediapipe-blazepose-ghum-tfjs.html
import React, { useEffect } from 'react'
import * as poseDetection from '@tensorflow-models/pose-detection'
//import * as handPoseDetection from '@tensorflow-models/hand-pose-detection'
import '@tensorflow/tfjs-backend-webgl'
import '@mediapipe/pose'
//import '@mediapipe/hands'

let detectorInvoked = false
let warmedUp = false
let resumePlayback = false
let slowMotion = false
let mounted = false
let timer = null
let interval = 100

let g_pose = null
let g_funUpdateKeypoints = null

function BlazePose(props) {
    let poseDetector = null

    // Must be a multiple of 32 and defaults to 256. The recommended range is [128, 512]
    let width  = props.width  -  props.width  % 32
    let height = props.height -  props.height % 32
    console.log(`res: ${width}x${height}`)
    var initDetector = async function() {
        const modelPose = poseDetection.SupportedModels.BlazePose
        const poseDetectorConfig =  {
                                        runtime: 'tfjs',        // 'mediapipe' or 'tfjs'
                                        modelType: 'lite',      // 'lite ', 'full', 'heavy'
                                        //multiPoseMaxDimension: 512
                                    }
        const timestamp = performance.now()
        poseDetector = await poseDetection.createDetector(modelPose, poseDetectorConfig, timestamp)
        console.log('3D POSE detector ready...')
        console.log(performance.now() - timestamp)

        //window.requestAnimationFrame(estimatePose)    // too early
        timer = window.setInterval(estimatePose, 100)   // delay for 0.1 sec
    }


    var estimatePose = async function() {
        clearTimeout(timer)

        if (!mounted) {
            timer = window.setInterval(estimatePose, interval)
            return
        }

        const video = document.getElementById('video')
        video.pause()

        const timestamp = performance.now()
        let poses = await poseDetector.estimatePoses(video)
        //console.log(performance.now() - timestamp)

        if (!warmedUp) {
            g_pose = poses[0]
            console.log('3D POSE frist detecting done...')
            console.log(performance.now() - timestamp)
            warmedUp = true
        }

        if (resumePlayback && poses[0] !== undefined) {
            g_pose = poses[0]
            //video.play()  // let Babylon3D calls PlayVideo() after Model is renderred
        } 

        if ( g_funUpdateKeypoints && g_pose !== undefined ) {
            g_funUpdateKeypoints(g_pose.keypoints3D)
        }

        timer = window.setInterval(estimatePose, interval)
        //window.requestAnimationFrame(estimatePose)
    }

    const onClick = () => {
        resumePlayback = !resumePlayback 
    }
    const onDoubleClick = () => {
        slowMotion = !slowMotion 
    }


    useEffect(() => {
        console.log('BlazePose mounted')
        const video = document.getElementById('video')
        video.addEventListener('click', onClick, true) 
        video.addEventListener('dblclick', onDoubleClick, true) 

        // Load the 3D engine
        if (!detectorInvoked) {
            detectorInvoked = true
            initDetector()
        }
        mounted = true

        return () => {
            console.log('BlazePose unmounted')
            video.addEventListener("click", null, true)
            mounted = false
        }
    }) 

    return (
        <div>
            <video 
                id = "video"
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

export const PlayVideo = (state) => {
    const video = document.getElementById('video')
    if (state === 'play' && resumePlayback) {
        video.play()
        if (slowMotion) {
            video.pause()   //debugging purpuse, pause() immediately after play()
        }
    } else if (state === 'pause') {
        video.pause()
    }
}

export default BlazePose