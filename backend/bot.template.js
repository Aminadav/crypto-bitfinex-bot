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

var funcs=_funcs_
for(var i=0;i<funcs.length;i++){
    global[funcs[i]]=command(funcs[i])
}

var variables=_variables_
var botJSON=_botJSON_
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
    
    _fileData_

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