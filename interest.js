const rate_percent = 1
const time = 1000
const fs = require('fs')

const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function arrayfy(json){
  let array =[]
  let obj = JSON.parse(json)
  for (i=0; i< obj.length; i++){
    array.push(obj[i])
  }
  return array
}

var clients = arrayfy(fs.readFileSync("./data/client.json","utf8"))

setInterval(()=>{

  var clients = arrayfy(fs.readFileSync("./data/client.json","utf8"))

  for (let i=0; i<clients.length; i++){
    if (clients[i].status=="Enrolled"){
      interest = parseInt(clients[i].Balance*(rate_percent/100))
      balance = clients[i].Balance + interest

      clients[i].Balance += interest
      clients[i].status = "Unenrolled"

      let date = new Date()

      let txns = arrayfy(fs.readFileSync(`./data/transactions/${clients[i].email}.json`,"utf8"))


      txn = {
        Amount: interest,
        Balance: balance,
        Type: "Interest",
        Date: `${months[date.getMonth()]}-${date.getFullYear()}`
      }

      console.log(txn)

      txns.push(txn)

      fs.writeFileSync(`./data/transactions/${clients[i].email}.json`,JSON.stringify(txns))
    }
  }

  fs.writeFileSync("./data/client.json",JSON.stringify(clients))

},time)
