const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const path = require("path");


const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

/* MYSQL CONNECTION */

const mysql = require("mysql2");

const db = mysql.createConnection({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT
});

db.connect((err) => {
  if (err) {
    console.log("Database connection failed:", err);
  } else {
    console.log("Connected to Railway MySQL database");
  }
});
/* HOME PAGE */

app.get("/",(req,res)=>{
res.sendFile(path.join(__dirname,"index.html"));
});



/* ================= USER AUTH ================= */

/* REGISTER */

app.post("/register",(req,res)=>{

const {name,email,password} = req.body;

db.query(
"INSERT INTO users(name,email,password) VALUES(?,?,?)",
[name,email,password],
(err,result)=>{
if(err) return res.json(err);

res.json({status:"registered"});
});

});


/* LOGIN */

app.post("/login",(req,res)=>{

const {email,password} = req.body;

db.query(
"SELECT * FROM users WHERE email=? AND password=?",
[email,password],
(err,result)=>{

if(result.length>0){
res.json(result[0]);
}else{
res.json({status:"invalid"});
}

});

});



/* ================= CHAT SYSTEM ================= */

/* SEND MESSAGE */

app.post("/send-message",(req,res)=>{

const {user_id,message} = req.body;

db.query(
"INSERT INTO messages(user_id,message) VALUES(?,?)",
[user_id,message],
(err,result)=>{

if(err) return res.json(err);

res.json({status:"message saved"});
});

});


/* GET MESSAGES */

app.get("/messages",(req,res)=>{

db.query(
"SELECT messages.*, users.name FROM messages JOIN users ON users.id = messages.user_id",
(err,result)=>{
if(err){
console.log(err);
res.json([]);
}else{
res.json(result);
}
});

});


/* ADMIN REPLY */

app.post("/reply",(req,res)=>{

const {id,reply} = req.body;

db.query(
"UPDATE messages SET reply=? WHERE id=?",
[reply,id],
(err,result)=>{
res.json({status:"reply added"});
});

});


/* DELETE MESSAGE */

app.delete("/delete/:id",(req,res)=>{

const id = req.params.id;

db.query(
"DELETE FROM messages WHERE id=?",
[id],
(err,result)=>{
res.json({status:"deleted"});
});

});


/* SERVER */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});