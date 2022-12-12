const path = require('path')
const express = require('express')
const app = express()
const port = 3000

app.use(favicon(path.join(__dirname, '%PUBLIC_URL%', '/favicon.ico')))

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '%PUBLIC_URL%', 'index.html'))
})

app.listen(port, () => {
  console.log(`Server.js: listening on port ${port}`)
})