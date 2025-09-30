//Import libraries
const express = require("express")
const ejs = require("ejs")
const {createClient} =  require("@supabase/supabase-js")
const multer = require("multer")
const argon2 = require("argon2")

//Config
const port = process.env.PORT || 3000
const debug_host = "localhost"
const database_url = process.env.DATABASE || "https://nsdgbqozatxvpowkxkav.supabase.co"
const database_key = process.env.DATABASE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zZGdicW96YXR4dnBvd2t4a2F2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODkxODY4NCwiZXhwIjoyMDc0NDk0Njg0fQ.0UNL6EQjMnRR2KVUzRGC9fRcPZwPbnaGZvHOdomJbFM"
const app = express()
const database = createClient(database_url,database_key)
const upload = multer({ storage: multer.memoryStorage() });
const sessions = {}

app.use(express.urlencoded({extended : true}))
app.set("view engine","ejs")
app.use(express.json())
app.use(express.static("sources"))

const auth = (req,res,next) => {
    const cookie = req.headers.cookie
    if(!cookie)
    {
        res.locals.user = {}
    }
    else
    {
        const sessionId = cookie.split("=")[1]
        if(!sessions[sessionId])
        {
            res.locals.user = {}
        }
        else
            res.locals.user = sessions[sessionId]
    }
    next()
}

//Endpoints
app.get("/",auth,(req,res) => {
    res.render("home")
})

app.get("/login",(req,res) => {
    res.render("login")
})
app.post("/login", async (req,res) => {
    const usern = req.body.username
    const password = await argon2.hash(req.body.password)
    const {response, error} = await database.from("users").select("*").eq("username",usern).single()
    if(error||!response)
    {
        res.render("login",{error : "Username or password incorrect"})
        return
    }
    const match = await argon2.verify(response.hashed_password,password)
    if(match)
    {
        const id = crateCookie()
        sessions[id] = usern
        res.setHeader("Set-Cookie","sessionId=" + id, "HttpOnly")
        res.redirect("/")
        return
    }
    res.render("login",{error : "Username or password incorrect"})
    return
})

app.get("/register",(req,res) => {
    res.render("register")
})
app.post("/register", async (req,res) => {
    const user = req.body.username
    const pass = req.body.password
    const mark = req.body.pic
    const password = await argon2.hash(pass,{
        type : argon2.argon2id
    })
    const {resp,error} = await database.from("users").insert([{
        username : user,
        hashed_password : password,
        mark_pic : mark
    }])
    if(error)
    {
        res.render("register", {error : "Error creating the account, retry"})
        return
    }
    res.redirect("/login")
})

/* app.listen(port,(err) => {
    console.log(err?err:"Server online")
}) */
app.listen(port,debug_host,(err) => {
    console.log(err?err:"Server online : http://" + debug_host + ":" + port)
})