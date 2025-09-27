//Import libraries
import express from "express"
import ejs from "ejs"
import createClient from "@supabase/supabase-js"
import multer from "multer"

//Config
const port = process.env.PORT || 3000
const debug_host = "localhost"
const database_url = process.env.DATABASE
const database_key = process.env.DATABASE_KEY
const app = express()
const database = createClient(database_url,database_key)
const upload = multer({ storage: multer.memoryStorage() });
const sessions = {}

app.use(express.urlencoded({extended : true}))
app.set("view engine","ejs")
app.use(express.json())
app.use(express.static("sources"))

const auth = (req,res,next) => {
    const sessionId = req.header.cookie.split("=")[1]
    if(!sessionId)
        return
    if(!sessions[sessionId])
        return
    res.locals.user = sessions[sessionId]
    next()
    return;
}

//Endpoints
app.get("/",auth,(req,res) => {
    res.render("home")
})

/* app.listen(port,(err) => {
    console.log(err?err:"Server online")
}) */
app.listen(port,debug_host,(err) => {
    console.log(err?err:"Server online")
})