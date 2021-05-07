const express = require('express');
const app = express()
const bodyParser = require('body-parser');
const port = 3000

app.use(bodyParser.urlencoded({extended: false}))


app.get("/", (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

app.post("/page", (req, res)=>{
  console.log(req.body.email, req.body.password)
  if (req.body.email != "" && req.body.password != ""){

    res.sendFile(__dirname + "/page.html")
  }
  else{
    res.redirect("/")
  }
})

app.get("/page", (req, res)=>{
})


app.listen(port, () => {
  console.log(`http://localhost:${port}`);
})
