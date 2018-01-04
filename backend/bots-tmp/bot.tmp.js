/** @ts-check */
var fs=require('fs')
var Big=require('big.js')
var _=require('lodash')
var cp=require('child_process')
var bluebird=require('bluebird')
var defers={}
process.on('message',data=>{
    fs.appendFileSync('output.txt',botJSON.name + ': bot getting message:' + JSON.stringify(data)+ '\n') 
    if(data.error){
        var x=new Error(data.result)
        defers[data.id].reject(x)
    } else {
        defers[data.id].resolve(data.result)
    }
    delete defers[data.id]
})
function command(command){
    return async function(options,options2){
        var defer=bluebird.defer()
        var id=new Date().valueOf()
        fs.appendFileSync('output.txt',botJSON.name + ': bot sending message:' + id + ' '  + command + ' ' + JSON.stringify(arguments) +  '\n') 
        process.send({
            id,
            command,
            options,
            options2,
            botName:botJSON.name
        })
        defers[id]=defer
        return defer.promise
    }
}


// var getHighestBid=command('getHighestBid')
// var getLowestAsk=command('getLowestAsk')

var funcs=["transfer","force_maker_order","new_order","startBot","result"]
for(var i=0;i<funcs.length;i++){
    global[funcs[i]]=command(funcs[i])
}

var variables={}
var botJSON={"id":7,"name":"maker_oder","variables":{"symbol":"symbol","amount":"number","wallet":"wallet","side":"side"},"loop":0,"source":"var price\nvar oldPrice\nvar remaingAmount=0\nvar orders\nvar thisOrder\nvar oldOrder_id=''\nvar is_cancelled=false\nvar firstTime=true\n\nprice_precious=1\nif (variables.symbol.pair=='btcusd') price_precious=0.1\nvar allBalance=variables.amount==-1\n\nvar price\nwhile(true) {\n\n\n\n  if(variables.side=='buy') {\n    if(oldPrice!=maxBid) {\n       price=parseFloat(Big(maxBid).plus(price_precious).toFixed())\n    }\n    if(price>=minAsk) price=parseFloat(Big(minAsk).minus(price_precious).toFixed())\n  } else {\n    if(oldPrice!=minAsk) {\n      price=parseFloat(Big(minAsk).minus(price_precious).toFixed())\n    }\n    if(price<=maxBid) price=parseFloat(Big(maxBid).plus(price_precious).toFixed())\n  } \n\n  if(variables.side=='buy'){\n    currency=variables.symbol.pair.slice(3).toUpperCase()\n  } else {\n    currency=variables.symbol.pair.slice(0,3).toUpperCase()\n  }\n  if(allBalance){\n     if(variables.side=='buy')\n        remaingAmount=Big(wallets[variables.wallet][currency]/price).toFixed(4)\n     else\n        remaingAmount=wallets[variables.wallet][currency]\n  }\n  console.log('remaingAmount=',remaingAmount)\n  console.log('price=',price)\n  if(0){ \n    await bluebird.delay(3000); continue\n  }\n\n  if(\n      (firstTime || is_cancelled) ||   //  If it is the firstTime or it is cancel bease post type\n      (remaingAmount && (oldPrice !=price)) // OR the last order did not completed succesfully, and the price moves.\n  ) {\n        firstTime=false\n        oldPrice=price\n\n        try {\n            var order=await new_order({\n                oldOrder_id,\n                symbol:variables.symbol.pair,\n                amount: remaingAmount || variables.amount,\n                price,\n                side:variables.side,\n                type: variables.wallet=='exchange' ? 'exchange limit' : 'limit' ,\n                is_postonly:true,\n                retries:1\n            })\n        } catch(abc){\n//            console.log('error on trying order:', abc.message)\n            if(abc.message.indexOf('404')==0 || abc.message.indexOf('Order could not')>=0) {\n                console.log('cannot cancel. order is fullfilled. great. break')\n                break;\n            } else {\n               console.log('error on trying order:', abc.message)\n                throw abc\n            }\n        }\n    }\n//    console.log('posted order:', JSON.stringify( order))\n\n    while(true) {                   \n        thisOrder=orders && orders[order.id]\n        if(thisOrder) {\n            break\n        }\n        await bluebird.delay(100)\n    }\n    if(thisOrder.amount==0) { // no more amount. order fullfilled\n        console.log('order fullfilled!')\n        break;\n    } else if(thisOrder.status=='POSTONLY CANCELED') {   // 'ACTIVE',                        \n        console.log('It is cancleded because it is post only. we need to break and try again')\n        is_cancelled=true\n    } else { \n        // order exist. \n        remaingAmount=Math.abs (thisOrder.amount) // The remaining amount is the new amount (amount is negative in selling)\n        // next time replace this order\n        oldOrder_id=thisOrder.id\n    }                \nawait bluebird.delay(2000)\n}"}
var getDataInterval

async function botFunction(){
    var data
    var symbols,wallets,positions,trades,orders,maxBid,minAsk

    if(!variables.symbol){
        throw new Error('every bot must have a symbol variable.')
    }

    await getNewData();

    async function getNewData(){
       data=await command('getdata')(variables.symbol.pair)       
       symbols=data.symbols
       wallets=data.wallets
       positions=data.positions
       trades=data.trades
       orders=data.orders
       maxBid=data.maxBid
       minAsk=data.minAsk
       bids=data.bids
       asks=data.asks

       getDataInterval=setTimeout(function(){
           getNewData()
       },500)
    }
    
    var price
var oldPrice
var remaingAmount=0
var orders
var thisOrder
var oldOrder_id=''
var is_cancelled=false
var firstTime=true

price_precious=1
if (variables.symbol.pair=='btcusd') price_precious=0.1
var allBalance=variables.amount==-1

var price
while(true) {



  if(variables.side=='buy') {
    if(oldPrice!=maxBid) {
       price=parseFloat(Big(maxBid).plus(price_precious).toFixed())
    }
    if(price>=minAsk) price=parseFloat(Big(minAsk).minus(price_precious).toFixed())
  } else {
    if(oldPrice!=minAsk) {
      price=parseFloat(Big(minAsk).minus(price_precious).toFixed())
    }
    if(price<=maxBid) price=parseFloat(Big(maxBid).plus(price_precious).toFixed())
  } 

  if(variables.side=='buy'){
    currency=variables.symbol.pair.slice(3).toUpperCase()
  } else {
    currency=variables.symbol.pair.slice(0,3).toUpperCase()
  }
  if(allBalance){
     if(variables.side=='buy')
        remaingAmount=Big(wallets[variables.wallet][currency]/price).toFixed(4)
     else
        remaingAmount=wallets[variables.wallet][currency]
  }
  console.log('remaingAmount=',remaingAmount)
  console.log('price=',price)
  if(0){ 
    await bluebird.delay(3000); continue
  }

  if(
      (firstTime || is_cancelled) ||   //  If it is the firstTime or it is cancel bease post type
      (remaingAmount && (oldPrice !=price)) // OR the last order did not completed succesfully, and the price moves.
  ) {
        firstTime=false
        oldPrice=price

        try {
            var order=await new_order({
                oldOrder_id,
                symbol:variables.symbol.pair,
                amount: remaingAmount || variables.amount,
                price,
                side:variables.side,
                type: variables.wallet=='exchange' ? 'exchange limit' : 'limit' ,
                is_postonly:true,
                retries:1
            })
        } catch(abc){
//            console.log('error on trying order:', abc.message)
            if(abc.message.indexOf('404')==0 || abc.message.indexOf('Order could not')>=0) {
                console.log('cannot cancel. order is fullfilled. great. break')
                break;
            } else {
               console.log('error on trying order:', abc.message)
                throw abc
            }
        }
    }
//    console.log('posted order:', JSON.stringify( order))

    while(true) {                   
        thisOrder=orders && orders[order.id]
        if(thisOrder) {
            break
        }
        await bluebird.delay(100)
    }
    if(thisOrder.amount==0) { // no more amount. order fullfilled
        console.log('order fullfilled!')
        break;
    } else if(thisOrder.status=='POSTONLY CANCELED') {   // 'ACTIVE',                        
        console.log('It is cancleded because it is post only. we need to break and try again')
        is_cancelled=true
    } else { 
        // order exist. 
        remaingAmount=Math.abs (thisOrder.amount) // The remaining amount is the new amount (amount is negative in selling)
        // next time replace this order
        oldOrder_id=thisOrder.id
    }                
await bluebird.delay(2000)
}

}
function init(){
    botFunction()
    .then(result=>{
        if(result) console.log(result)
        if(botJSON.loop) {
            setTimeout(init,1000)
        }
    })
    .catch(err=>{
        if(botJSON.loop) {
            console.error(err.message)
            console.error(err.stack)
            setTimeout(init,1000)
        } else {
            console.error(err.message)
            console.error(err.stack)
            process.exit()
        }
    }).then(function(){
        clearInterval(getDataInterval)
        process.exit()
    })
}

init()