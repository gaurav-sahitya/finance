const express = require('express');
const app = express()
const bodyParser = require('body-parser');
const fs = require('fs');

function arrayfy(json){
  let array =[]
  let obj = JSON.parse(json)
  for (i=0; i< obj.length; i++){
    array.push(obj[i])
  }
  return array
}

const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

var clients = JSON.parse(fs.readFileSync("./data/client.json","utf8"))

var index = fs.readFileSync("./index.html","utf8")


var user
var e_page

const port = 3000

app.set("view engine","ejs")
app.use(express.static(__dirname))
app.use(bodyParser.urlencoded({extended: false}))

var error = false;

app.get("/", (req, res) => {
  if (!error){
    res.sendFile(__dirname + '/index.html')
  }
  else{
    res.send(index.replace("DISPLAY",""))
  }
})


app.post("/", (req, res)=>{
  clients.forEach((client, i) => {
    if(client.email == req.body.email && client.password == req.body.password){
      user = client
      res.redirect("/page")
      return
    }
    else{
      error = true;
      res.redirect("/")
    }

  });
})

app.get("/page", (req, res)=>{
  if (user){
    res.render("page",{user: user, page: e_page})
    e_page=""
  }
  else{
    res.redirect("/")
  }
})

app.post("/txn",(req, res)=>{
  if (req.body.submit == "Credit"){
    user.Balance += parseInt(req.body.amount)
    user.c_Score = parseFloat(Math.min(0.99,(user.c_Score + parseInt(req.body.amount)/user.Balance)).toFixed(2))
  }
  else if(req.body.c_Score > 0.7 && req.body.amount < user.Balance - 1000){
    user.c_Score = parseFloat(Math.max(0.01,(user.c_Score - parseInt(req.body.amount)/user.Balance)).toFixed(2))
    user.Balance -= parseInt(req.body.amount)
  }
  else{
    e_page= "We can't process, either you have exceed 1000 Rs limit or have Credit Score less than 0.7"
  }

  const date = new Date()

  let txns = fs.readFileSync(`./data/transactions/${user.email}.json`,"utf8")


  txn = {
    Amount: parseInt(req.body.amount),
    Balance: user.Balance,
    Type: req.body.submit,
    Date: `${months[date.getMonth()]}-${date.getFullYear()}`
  }

  txns.push(txn)

  fs.writeFileSync(`./data/transactions/${user.email}.json`,JSON.stringify(txns))

  for (let i=0; i<clients.length; i++){
    if (clients[i].email === user.email && clients[i].password === user.password){
      clients[i].Balance = user.Balance
      clients[i].c_Score = user.c_Score
      break
    }
  }

  fs.writeFileSync("./data/client.json",JSON.stringify(clients))

  res.redirect("/page")
})


app.listen(port, () => {
  console.log(`http://localhost:${port}`);
})
