import * as React from 'react'
import { styled } from '@mui/material/styles'
import Paper from '@mui/material/Paper'
import Grid from '@mui/material/Unstable_Grid2'
import Box from '@mui/material/Box'

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  margin: 'auto',
  marginTop: theme.spacing(1),
  marginLeft: theme.spacing(1)/2,
  marginRight: theme.spacing(1)/2,
  textAlign: 'center',
  color: theme.palette.text.secondary,
}))

function AppHome() {
  return (
    <div >
      <Grid container spacing={2}>
        <Grid xs={3}>
          <Item>
            < video
                src = "dancing_girl.mp4" autoplay = "true" loop
                width= "100%"
                height= ""
                preload= "auto"
                muted= "muted"
            />
          </Item>
        </Grid>
        <Grid xs={9}>
          <Item>
          < Box
                width={window.innerWidth*3/4}
                height={window.innerHeight - 120 }
          />
          </Item>
        </Grid>
      </Grid>
    </div>
  );
}

export default AppHome;
