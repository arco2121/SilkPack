//Import libraries
const express = require("express")
const ejs = require("ejs")
const {createClient} =  require("@supabase/supabase-js")
const multer = require("multer")
const argon2 = require("argon2")
const crypto = require("crypto")

//Config
const port = process.env.PORT || 3000
const debug_host = "localhost"
const database_url = process.env.DATABASE || "https://nsdgbqozatxvpowkxkav.supabase.co"
const database_key = process.env.DATABASE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zZGdicW96YXR4dnBvd2t4a2F2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODkxODY4NCwiZXhwIjoyMDc0NDk0Njg0fQ.0UNL6EQjMnRR2KVUzRGC9fRcPZwPbnaGZvHOdomJbFM"
const app = express()
const database = createClient(database_url,database_key)
const upload = multer({ storage: multer.memoryStorage() })
const sessions = {}
const debug = true

app.use(express.urlencoded({extended : true}))
app.set("view engine","ejs")
app.use(express.json())
app.use(express.static("sources"))

const requireCookieId = (req) => {
    const cookie = req.headers.cookie
    if(!cookie)
    {
        return ""
    }
    const sessionId = cookie.split("=")[1]||""
    return sessionId
}
const auth = (req,res,next) => {
    const sessionId = requireCookieId(req)
    if(!sessions[sessionId])
    {
        res.locals.user = null
    }
    else
    {
        if(debug) console.log(sessions[sessionId])
        res.locals.user = sessions[sessionId]
    }
    next()
}
const createCookie = () => {
    return crypto.randomBytes(32).toString("hex")
}
const exc = (handler) => {
  return async (req, res, next) => {
        try
        {
            await handler(req, res, next)
        }
        catch (err) 
        {
            res.render("error", {error : err})
        }
  }
}

//Endpoints
app.get("/",auth,(req,res) => {
    res.render("index")
})

app.get("/login",(req,res) => {
    res.render("login")
})
app.post("/login", exc(async (req,res) => {
    const usern = req.body.username
    const password = req.body.password
    const {data, error} = await database.from("users").select("*").eq("username",usern).single()
    if(error||!data)
    {
        if(debug) console.log(error)
        res.render("login",{error : "Username or password incorrect"})
        return
    }
    const match = await argon2.verify(data.hashed_password,password)
    if(match)
    {
        const id = createCookie()
        sessions[id] = data
        res.setHeader("Set-Cookie","sessionId=" + id, "HttpOnly")
        res.redirect("/")
        return
    }
    res.render("login",{error : "Password incorrect"})
    return
}))

app.get("/register",(req,res) => {
    res.render("register")
})
app.post("/register", exc(async (req,res) => {
    const user = req.body.username
    const pass = req.body.password
    const mark = req.body.pic
    const password = await argon2.hash(pass)
    const {data,error} = await database.from("users").insert([{
        username : user,
        hashed_password : password,
        mark_pic : mark
    }])
    if(error)
    {
        if(debug) console.log(error)
        return res.render("register", {error : "Error creating the account, retry"})
    }
    res.redirect("/login")
}))

app.get("/explore", exc(async (req, res) => {
    const searchParam = req.query.search || ""
    const [action, value] = searchParam.split(":")
    const searchValue = value || action || ""
    let field
    switch(action)
    {
        case "owner" : {
            field = "users.username"
            break
        }
        default : {
            field = "id_name"
        }
    }
    let query = database.from("webs").select(`*, users:owner_id (username)`).eq("is_public", true)
    if (searchValue.trim())
    {
        query = query.ilike(field, `%${searchValue}%`)
    }
    const { data, error } = await query
    if (error) 
    {
        return res.render("explore",{value : searchParam})
    }
    if (!data || data.length === 0) 
    {
        return res.render("explore",{value : searchParam})
    }
    res.render("explore", { webs: data , value : searchParam})
}))


/* app.listen(port,(err) => {
    console.log(err?err:"Server online")
}) */
app.listen(port,debug_host,(err) => {
    console.log(err?err:"Server online : http://" + debug_host + ":" + port)
})