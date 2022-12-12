import * as React from 'react'
import { styled } from '@mui/material/styles'
import Paper from '@mui/material/Paper'
import Grid from '@mui/material/Unstable_Grid2'

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
          <Item>video</Item>
        </Grid>
        <Grid xs={9}>
          <Item>skeleton</Item>
        </Grid>
      </Grid>
    </div>
  );
}

export default AppHome;
