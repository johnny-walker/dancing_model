import * as React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"
import VideoMode from "./VideoMode"
import AppFrame from "./Appframe"

function App() {
  const [videoPath, setVideoPath] = React.useState('demo1.mp4')
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<AppFrame setVideoPath={setVideoPath}/>}>
            <Route path="/" element={<VideoMode videoPath={videoPath}/>} />
            <Route path="*" element={<h1>page not found</h1>} />
          </Route>
        </Routes>
      </Router>
    </>
  )
}

export default App
