const fs = require('fs');

// var a =[{
//   Amount: 9000,
//   Balance: 9000,
//   Type: "Credit",
//   Date: "Jan-2021",
//   },
// {
//   Amount: 1000,
//   Balance: 10000,
//   Type: "Interest",
//   Date: "Feb-2021"
//   },
// {
//   Amount: 1000,
//   Balance: 9000,
//   Type: "Debit",
//   Date: "Mar-2021"
//   }]
var a = fs.readFileSync("./transactions/gauravsahitya@gmail.com.json","utf8")

function arrayfy(json){
  let array =[]
  let obj = JSON.parse(json)
  for (i=0; i< obj.length; i++){
    array.push(obj[i])
  }
  return array
}


let obj = arrayfy(a)
console.log(obj)




// console.log(JSON.parse(a))
