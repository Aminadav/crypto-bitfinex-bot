"use-strict"
//* @ts-check
var Express=require('express')
var http=require('http')
var app=new Express();
var cp=require('child_process');
var fs=require('fs')
var vm=require('vm')
var cors=require('cors')
var bodyParser=require('body-parser')
var socketio=require('socket.io')
var _=require('lodash')
var shortid=require('shortid')
var moment=require('moment')
var bluebird=require('bluebird')

var db=require('./db')
var Bot=require('./bot.js')
var bitfinexBots={}

var httpServer=http.createServer(app)
var io=socketio(httpServer)
httpServer.listen(80)

var socket;
io.on('connection',(_socket)=>{
    console.log('a user connected')
    socket=_socket
    sendRunningBots()
})

app.use(cors())
app.get('/api/health',(req,res)=>{
    res.send({name:'bitcoin-ok',version:require('./package.json').version})
})

app.get('/api/symbols',(req,res)=>{
    var accounts=fs.readFileSync(__dirname + '/symbols.json')
    res.send(JSON.parse(accounts))
})

app.get('/api/accounts',(req,res)=>{
    var accounts=fs.readFileSync(__dirname + '/accounts.json')
    res.send(JSON.parse(accounts))
})
app.get('/api/bots',async (req,res)=>{
    var bots=await db.getAllBots()
    res.send(bots)
})
app.post('/api/create_bot',bodyParser.json(),async (req,res)=>{
    await db.createBot({name:req.body.name})
    res.send({ok:true})
})
app.post('/api/bots',bodyParser.json(),async (req,res)=>{
    await db.updateBot(req.body)
    res.send({ok:true})
})
var runningBots={}
function stop_bot(id){
    try{
        runningBots[id].running=false
        runningBots[id].process.kill()
    } catch(err){    
    }
    sendRunningBots()
}
app.post('/api/stop_bot',bodyParser.json(),async (req,res)=>{
    stop_bot(req.body.bot)
    res.send({ok:true})
})
function sendRunningBots(){
    var toSend={}
    for(var i in runningBots){
        toSend[i]=_.omit(runningBots[i],['process'])
    }    
    socket.emit('running-bots',toSend)
}
async function start_bot({bot,id,variables,key,secret,account}){
    var botName=bot
    var botId=id
    var apiKey=key
    var apiSecret=secret
    var apiAccount=account
    var botPromise=bluebird.defer()

    if(!bitfinexBots[apiKey]){
        bitfinexBots[apiKey]=new Bot({
            apiKey,
            apiSecret,
            apiAccount,
            maxRetry:3
        })
    }
    var bitfinexBot=bitfinexBots[apiKey]

    var funcs=['transfer','force_maker_order','new_order','startBot','result']
    try{
        var bot_running_id=shortid()
        var botJSON=await db.getBot(botId)
        var fileData=botJSON.source
        var botFileName='./bots-tmp/bot.tmp.js'
        fs.writeFileSync(
            botFileName,
            fs.readFileSync(__dirname + '/bot.template.js').toString()
            .replace('_fileData_',fileData)
            .replace('_variables_',JSON.stringify(variables))
            .replace('_botJSON_',JSON.stringify(botJSON))
            .replace('_funcs_',JSON.stringify(funcs))
        );
        // var theBot=cp.spawn('node' ,['--require',__dirname + '/bots/requires.js',botFileName], {
        var theBot=cp.fork(botFileName, {
            stdio:'pipe',
        })

        runningBots[bot_running_id]={}
        runningBots[bot_running_id]={
            running:true,
            name:botName,
            account:apiAccount,
            key:apiKey,
            secret:apiSecret,
            process:theBot,
            created:moment().format('D MMM hh:mm:ss')
        }
        var botResult='no-result';
        sendRunningBots()
        theBot.stderr.on('data',(data)=>{
            socket.emit('logger',`bot ${botName} [${bot_running_id}] error: ${data}`)
            botPromise.reject(new Error('bot returned stderr: ' + data))
            // runningBots[bot_running_id].running=false
            // sendRunningBots()
        })
        theBot.on('exit',function(){
            socket.emit('logger',`bot ${botName} [${bot_running_id}] exited.`)
            runningBots[bot_running_id].running=false
            console.log(`bot exit ${botName}.Result: ${botResult}`)
            botPromise.resolve(botResult)
            sendRunningBots()
        })
        theBot.on('error',function(err){
            console.log('error while forking bot')
            console.log(err)
        })        
        theBot.stdout.on('data',data=>{
            socket.emit('logger',`bot ${botName} [${bot_running_id}]: ${data}`)
        })
        theBot.on('message',async data=>{
            result=0
            console.log('getMessage:', JSON.stringify(data))
            try{
                if( 
                    data.command=='transfer' ||
                    data.command=='force_maker_order' ||
                    data.command=='new_order'
                ){
                    data.options.log=text=>{
                        socket.emit('logger',`bot ${botName}: ${text}`)
                    }
                    var result=await bitfinexBot[data.command].apply(bitfinexBot,[data.options])
                } else if(data.command=='result'){
                    botResult=data.options
                } else if(data.command=='startBot'){
                    var newBotData={
                        bot:data.options,
                        id: await db.getBotIdByName(data.options),
                        variables: data.options2,
                        key: apiKey,
                        secret: apiSecret,
                        account: apiAccount
                    }
                    result=true
                    console.log('wait before launch bot')
                    await bluebird.delay(3000)
                    var result=await start_bot(JSON.stringify(newBotData))
                } else if(data.command=='getdata'){
                    var result={
                        wallets:await bitfinexBot.realtime.getWallets(data.options),
                        positions:await bitfinexBot.realtime.getPositions(data.options),
                        orders:await bitfinexBot.realtime.getOrders(data.options),
                        trades:await bitfinexBot.realtime.getTrades(data.options),
                        minAsk:await bitfinexBot.realtime.getLowestAsk(data.options),
                        maxBid:await bitfinexBot.realtime.getHighestBid(data.options),
                        bids:await bitfinexBot.realtime.getBids(data.options),
                        asks:await bitfinexBot.realtime.getAsks(data.options),
                    }
                } else if(data.command){
                    throw new Error('command not found:' + JSON.stringify(data))
                }
                try{
                    console.log('send result: ' + data.id)
                    theBot.send({
                        id:data.id,
                        result
                    })
                }
                catch(err) {
                    // console.log('do not send if it is closed')
                }
            } catch(err){
                theBot.send({
                    id:data.id,
                    result:err.message +'\n' + err.stack,
                    error:true
                })
            }
        })
        // var value=vm.runInNewContext(fs.readFileSync(__dirname +'/bots/' + bot + '/bot.js').toString(),{
        //     fs,
        //     variables
        // },{filename:bot}
        // )
        // vm.run
        // socket.emit('logger',`bot ${bot} complete successfully. Return Value=${value}`)
    }
    catch(err) {
        // res.send({error:err.message,stack:err.stack})
        socket.emit('logger',`bot ${botName} error:\n${err.message}\n${err.stack}`)
    }

    return botPromise;
}
app.post('/api/start_bot',bodyParser.json(),async (req,res)=>{
    start_bot(req.body)
    res.send({ok:true})    
})
app.use('/',Express.static(__dirname +'../frontend/build'))

process.on('unhandledRejection',function(err){
    console.log(err.message)
    console.log(err.stack)
})



var onMessage=function(data){
}