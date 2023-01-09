import * as React from "react";
import { useLocation, Link } from "react-router-dom";
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";

import HomeIcon from '@mui/icons-material/Home';
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

const ModeItems = [
  {
    name: "Video Mode",
    icon: <HomeIcon />,
    link: "video",
  },
  {
    name: "Camera Mode",
    icon: <CalendarMonthIcon />,
    link: "camera",
  }
]

export default function SideBarItems({ handleDrawerClose }) {
  const location = useLocation();
  const currentPath = location.pathname;
  return (
    <>
      {
        ModeItems.map((item) => (
          <ListItemButton
            key={item.name}
            component={Link}
            to={item.link}
            selected={currentPath === item.to}
            onClick={handleDrawerClose}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.name} />
          </ListItemButton>
        ))
      }
    </>
  );
}
