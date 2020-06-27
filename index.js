console.clear()

require('dotenv').config()

const express = require('express')
const helmet = require('helmet')

const app = express()

app.use(helmet({ frameguard: false }))

app.get('/health', (_, res) => {
    res.end('Healthy')
})

app.use(express.static(__dirname))

app.get('*', (_, res) => {
    res.sendFile(`${__dirname}/index.html`)
})

const port = process.env.VUE_MINI_PORT || 8080

app.listen(port, err => {
    if(err) throw err
    console.log(`Vue Mini Core is running on port ${port}`)
})
