const express = require('express');
const app = express()
const bodyParser = require('body-parser');
const fs = require('fs');

function arrayfy(json) {
  let array = []
  let obj = JSON.parse(json)
  for (i = 0; i < obj.length; i++) {
    array.push(obj[i])
  }
  return array
}

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

var clients = arrayfy(fs.readFileSync("./data/client.json", "utf8"))

// var index = fs.readFileSync("./index.html", "utf8")


var user
var e_page
var err

const port = 3000

app.set("view engine", "ejs")
app.use(express.static(__dirname))
app.use(bodyParser.urlencoded({
  extended: false
}))

var error = false;

app.get("/", (req, res) => {
  if (!err) {
    res.render("index",{warn: ""})
  } else {
    err = false;
    res.render("index",{warn: "Please Check Email or Password"})
  }
})


app.post("/", (req, res) => {
  clients.forEach((client, i) => {
    if (client.email == req.body.email && client.password == req.body.password) {
      user = client
      res.redirect("/page")
      return
    } else {
      err = true;
      res.redirect("/")
    }

  });
})

app.get("/page", (req, res) => {
  if (user) {
    let txns = arrayfy(fs.readFileSync(`./data/transactions/${user.email}.json`, "utf8"))

    var txn = []
    var bal = []
    var bal_per = []

    var len = txns.length
    var i
    var j
    var t
    var max

    try{
      for (i = len-1; i>len-6; i--){
        if (txns[i].Type=="Debit"){
          t = {
            Amount: "-"+txns[i].Amount,
            Type: txns[i].Type,
            Date: txns[i].Date,
            Color: "text-danger"
          }
        }
        else if (txns[i].Type=="Credit"){
          t = {
            Amount: "+"+txns[i].Amount,
            Type: txns[i].Type,
            Date: txns[i].Date,
            Color: "text-success"
          }
        }
        else{
          t = {
            Amount: "+"+txns[i].Amount,
            Type: txns[i].Type,
            Date: txns[i].Date,
            Color: "text-primary"
          }
        }
        txn.push(t)
        bal.push(txns[i].Balance)
      }
    }
    catch{
      for (j=i; j<5; j++){
        t = {
          Amount: "",
          Type: "",
          Date: ""
        }
        txn.push(t)
        bal.push(0)
      }
    }

    max = Math.max(bal[0],bal[1],bal[2],bal[3],bal[4])

    for (var i = 0; i < bal.length; i++) {
      bal_per.push(parseInt(bal[i]*100/max))
    }

    if (user.status == "Enrolled") {
      res.render("page", {
        user: user,
        page: e_page,
        type: "disabled",
        value: "Since you have Enrolled you can not Credit/Debit",
        val: "Thanks for Enrolling",
        txn: txn,
        max: max,
        bal: bal,
        bal_per: bal_per
      })
    } else {
      res.render("page", {
        user: user,
        page: e_page,
        type: "",
        value: "Enter amount to Credit/Debit",
        val: "You Can Enroll Here",
        txn: txn,
        max: max,
        bal: bal,
        bal_per: bal_per
      })
    }
    e_page = ""
  } else {
    res.redirect("/")
  }
})

app.post("/txn", (req, res) => {
  if (req.body.submit == "Credit") {
    user.Balance += parseInt(req.body.amount)
    user.c_Score = parseFloat(Math.min(0.99, (user.c_Score + parseInt(req.body.amount) / user.Balance)).toFixed(2))
  } else if (req.body.c_Score > 0.7 && req.body.amount < user.Balance - 1000) {
    user.c_Score = parseFloat(Math.max(0.01, (user.c_Score - parseInt(req.body.amount) / user.Balance)).toFixed(2))
    user.Balance -= parseInt(req.body.amount)
  } else {
    e_page = "We can't process, either you have exceed 1000 Rs limit or have Credit Score less than 0.7"
    res.redirect("/page")
    return
  }
  let date = new Date()

  let txns = arrayfy(fs.readFileSync(`./data/transactions/${user.email}.json`, "utf8"))


  txn = {
    Amount: parseInt(req.body.amount),
    Balance: user.Balance,
    Type: req.body.submit,
    Date: `${months[date.getMonth()]}-${date.getFullYear()}`
  }

  txns.push(txn)

  fs.writeFileSync(`./data/transactions/${user.email}.json`, JSON.stringify(txns))

  for (let i = 0; i < clients.length; i++) {
    if (clients[i].email === user.email && clients[i].password === user.password) {
      clients[i].Balance = user.Balance
      clients[i].c_Score = user.c_Score
      break
    }
  }

  fs.writeFileSync("./data/client.json", JSON.stringify(clients))

  res.redirect("/page")
})

app.post("/enr", (req, res) => {
  user.status = req.body.submit

  for (let i = 0; i < clients.length; i++) {
    if (clients[i].email === user.email && clients[i].password === user.password) {
      clients[i].status = user.status
      break
    }
  }


  fs.writeFileSync("./data/client.json", JSON.stringify(clients))

  res.redirect("/page")
})


app.listen(port, () => {
  console.log(`http://localhost:${port}`);
})
