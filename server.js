// Check if .env file is loaded properly
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express')
const app = express()
const expressLayouts = require('express-ejs-layouts')


const indexRouter = require('./routes/index')

app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
//idea behind layouts, everysingle file will be put here so we dont have to copy everysingle file like headers and footers
app.set('layout', 'layouts/layout') 

app.use(expressLayouts)

// Ensure you have this line here to serve static files from public like css
app.use(express.static('public'))

//To access files in the data folder 
app.use('/data', express.static('data'))


const mongoose = require('mongoose')
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true  }) 

const db = mongoose.connection

// Listen for MongoDB connection errors
db.on('error', error => console.error(error))
db.once('open', () => console.log('Connected to Mongoose'))

app.use('/', indexRouter)


app.listen(process.env.PORT || 3000)