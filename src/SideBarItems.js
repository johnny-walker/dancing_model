import * as React from "react";
//import { useLocation, Link } from "react-router-dom";
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
//import Divider from "@mui/material/Divider";

//import HomeIcon from '@mui/icons-material/Home';
//import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
//import CameraAltIcon from '@mui/icons-material/CameraAlt';
import OndemandVideoIcon from '@mui/icons-material/OndemandVideo';

const ModeItems = [
  {
    name: "Easy",
    icon: <OndemandVideoIcon />,
    path: "demo1.mp4",
  },
  {
    name: "Middle",
    icon: <OndemandVideoIcon />,
    path: "demo2.mp4",
  },
  {
    name: "Hard",
    icon: <OndemandVideoIcon />,
    path: "dancing.mp4",
  },  
  /*
  {
    name: "Video Mode",
    icon: <VideoLibraryIcon />,
    link: "video",
  },
  {
    name: "Camera Mode",
    icon: <CameraAltIcon />,
    link: "camera",
  }
  */
]

export default function SideBarItems(props) {
  //const location = useLocation();
  let currentPath =  'demo1.mp4'
  let mapPaths = {
                  'Easy':   'demo1.mp4',
                  'Middle': 'demo2.mp4',
                  'Hard':   'dancing.mp4'
                 }


  const handleClick = (e) => {
    currentPath = mapPaths[e.target.innerText]
    props.setVideoPath(currentPath) 
    console.log(currentPath)
    props.handleDrawerClose()
  }

  return (
    <>
      {
        ModeItems.map((item) => (
          <ListItemButton
            key={item.name}
            //component={Link}
            //to={item.path}
            selected={currentPath === item.path}
            onClick={handleClick}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.name} />
          </ListItemButton>
        ))
      }
    </>
  );
}
