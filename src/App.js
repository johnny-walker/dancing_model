import * as React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import VideoMode from "./VideoMode";
import AppFrame from "./Appframe"

function App() {

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<AppFrame />}>
            <Route path="/" element={<VideoMode />} />
            <Route path="*" element={<h1>no page found</h1>} />
          </Route>
        </Routes>
      </Router>
    </>
  )
}

export default App;
