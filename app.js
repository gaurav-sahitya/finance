const express = require('express');
const app = express()
const bodyParser = require('body-parser');
const fs = require('fs');

const clients = JSON.parse(fs.readFileSync("./data/client.json","utf8"))

var index = fs.readFileSync("./index.html","utf8")

const port = 3000

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



app.post("/page", (req, res)=>{
  clients.forEach((client, i) => {

    if(client.email == req.body.email && client.password == req.body.password){
      // console.log(index)
      res.sendFile(__dirname + "/page.html")
      return
    }
    else{
      error = true;
      res.redirect("/")
    }

  });
})


app.listen(port, () => {
  console.log(`http://localhost:${port}`);
})
