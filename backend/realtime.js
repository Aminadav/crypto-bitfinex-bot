const WebSocket = require('ws')
var bluebird = require('bluebird')
var _ = require('lodash')
var fs = require('fs')
var moment = require('moment-timezone')
const crypto = require('crypto-js')
var nReadLines = require('n-readlines');
var events = require('events')

// Same currencies here and in symbols.json
var currencies=['BTCUSD']

const TIME_TO_RELOAD = 1000 * 60 * 3
/*
    ps	position snapshot
    pn	new position
    pu	position update
    pc	position close
    ws	wallet snapshot
    wu	wallet update
    os	order snapshot
    on	new order
    ou	order update
    oc	order cancel
    te	trade executed
    tu	trade execution update
*/

class Realtime {
    constructor({ apiKey, apiSecret, record_filename = '', replay_filename = '', replay_speed_factor = 1 }) {
        var self=this
        if (replay_filename) {
            console.log('DOING REPLAY ON', replay_filename, 'SPEED=', replay_speed_factor)
        }
        
        var bids;
        var asks
        var wallets;

        /** @type {[{price:number,amount:number}]} */
        var publicTrades

        /** @type {[{id:number,symbol:string,amount:number,type:string,price:number,status:string}]} */
        var orders = {}

        /** @type {[{tsymbol:string,status:string,amount:number,basePrice:number}]} */
        var positions = {}

        /** @type {[{id:string,symbol:string,order_id:number,amount:string,price:number,type:string,fee:number,fee_currency:string}]} */
        var trades = {}
        var channels = {}
        /** @type {{BID:string,BID_SIZE:string,ASK:string,ASK_SIZE:string,DAILY_CHANGE:string,DAILY_CHANGE_PERC:string,LAST_PRICE:string,VOLUME:string,HIGH:string,LOW:string}} */
        var ticker = {}
        var wss
        // Every couple of seconds renew socket.
        
        async function onMessageFunction(event) {
            var channel
            var msg = JSON.parse(event.data)
            if (_.isArray(msg)) {
                channel = msg.shift()
            }
            if (record_filename && !replay_filename && msg[0] != 'hb') {
                fs.appendFileSync(record_filename, moment().tz('Asia/Jerusalem').format('YYYY-MM-DD HH:mm:ss') + ' ' + new Date().valueOf() + ' ' + event.data + '\n')
            }
            if (msg.event == 'subscribed') {
                channels[msg.chanId] = {
                    channel:msg.channel,
                    pair:msg.pair
                }
                asks[msg.pair]={}
                bids[msg.pair]={}
                positions[msg.pair]={}
                trades[msg.pair]={}
                return
            }
            if (msg[0] == 'hb') {
                return
            }
            if (channel == 0) {
                var action = msg[0]
                var data = msg[1]

                // POSITIONS
                if (action == 'ps') {
                    // data=[["tBTCUSD","ACTIVE",0.0142,7419,-0.00329218,0]]]
                    for (var i = 0; i < data.length; i++) {
                        var thisData = data[i]
                        positions[thisData[0]] = {
                            tsymbol: thisData[0],
                            status: thisData[1],
                            amount: thisData[2],
                            basePrice: thisData[3],
                        }
                    }
                } else if (action == 'pn' | action == 'pu' || action == 'pc') {
                    // data=["tBTCUSD","ACTIVE",0.0142,7419,0,0]]
                    // data=["tBTCUSD","CLOSED",0.0142,7419,-0.00329218,0]]
                    positions[data[0]] = {
                        tsymbol: data[0],
                        status: data[1],
                        amount: data[2],
                        basePrice: data[3],
                    }
                }

                // WALLETS
                else if (action == 'ws') {
                    // data=[["trading","BTC",0,0],["exchange","BTC",0,0],["trading","USD",0,0],["exchange","USD",35.24890042,0]]]
                    for (var i = 0; i < data.length; i++) {
                        var thisData = data[i]
                        if(thisData[0]=='trading') thisData[0]='margin'
                        if(thisData[0]=='deposit') thisData[0]='funding'
                        wallets[thisData[0]][thisData[1]] = thisData[2]
                    }
                } else if (action == 'wu') {
                    // data=[0,"wu",["exchange","USD",0.12384052,0]]
                    wallets[data[0]][data[1]] = data[2]
                } else if (action == 'os') {
                    // data=[[4877994472,"BTCUSD",-0.0047,-0.0047,"EXCHANGE LIMIT","ACTIVE",8000,0,"2017-11-05T08:09:42Z",0,0,0]]]
                    for (var i = 0; i < data.length; i++) {
                        var thisData = data[i]
                        orders[thisData[0]] = {
                            id: thisData[0],
                            symbol: thisData[1],
                            amount: thisData[2],
                            type: thisData[4],
                            price: thisData[6]
                        }
                    }
                } else if (action == 'on' || action == 'ou' || action == 'oc') {
                    orders[data[0]] = {
                        id: data[0],
                        symbol: data[1],
                        amount: data[2],
                        amount_orig: data[3],
                        type: data[4],
                        status: data[5],
                        price: data[6]
                    }
                } else if (action == 'te') {
                    // ["1109460-BTCUSD","BTCUSD",1509863548,4876403711,0.0047,7458.5,null,null]]
                    trades[data[0]] = {
                        id: data[0],
                        symbol: data[1],
                        order_id: data[3],
                        amount: data[4],
                        price: data[5],
                    }
                } else if (action == 'tu') {
                    // ["1109460-BTCUSD",85418682,"BTCUSD",1509863548,4876403711,0.0047,7458.5,"EXCHANGE MARKET",7458.5,-0.0701099,"USD"]]
                    trades[data[0]] = {
                        id: data[0],
                        symbol: data[2],
                        order_id: data[4],
                        amount: data[5],
                        price: data[6],
                        type: data[7],
                        fee: data[9],
                        fee_currency: data[10]
                    }
                }
            // } else if (channels[channel] && channels[channel].channel == 'ticker') {
                // ticker = {
                //     BID: msg[0],
                //     BID_SIZE: msg[1],
                //     ASK: msg[2],
                //     ASK_SIZE: msg[3],
                //     DAILY_CHANGE: msg[4],
                //     DAILY_CHANGE_PERC: msg[5],
                //     LAST_PRICE: msg[6],
                //     VOLUME: msg[7],
                //     HIGH: msg[8],
                //     LOW: msg[9],
                // }
            } else if (channels[channel] && channels[channel].channel == 'book') {
                // public channel                                
                if (msg[0][0]) {
                    msg = msg[0]
                } else {
                    msg = [msg]
                }
                for (var i = 0; i < msg.length; i++) {
                    var price = msg[i][0]
                    var count = msg[i][1]
                    var amount = msg[i][2]
                    let orders
                    if (amount > 0) {
                        orders = bids
                    } else {
                        orders = asks
                    }
                    if (count && price && amount) {
                        orders[channels[channel].pair][price] = {
                            count,
                            price,
                            amount
                        }
                    } else {
                        delete orders[channels[channel].pair][price]
                    }
                }
            } else if (channels[channel] && channels[channel].channel == 'trades') {
                // public channel                                
                if (_.isArray(msg[0])) {
                    msg = msg[0]
                } else {
                    if(msg[0]!='te') return
                    msg.shift()
                    msg = [msg]
                }
                for (var i = 0; i < msg.length; i++) {
                    var price = msg[i][2]
                    var amount = msg[i][3]
                    publicTrades[channels[channel].pair].unshift({amount,price})
                    if(publicTrades[channels[channel].pair].length>200) {
                        publicTrades[channels[channel].pair].pop()
                    }
                }
            }
        }
        if (!replay_filename) {
            openWebSocket()
            setInterval(openWebSocket, TIME_TO_RELOAD)
        } else {
            (async function () {
                var liner = new nReadLines('./' + replay_filename);
                var lastTimestamp = 0
                var line
                while (line = liner.next()) {
                    line = line.toString();
                    var data = line.slice(34)
                    var thisTimeStamp = parseInt(line.split(' ')[2])

                    if (lastTimestamp) {
                        // We should delay
                        await bluebird.delay((1 / replay_speed_factor) * (thisTimeStamp - lastTimestamp))
                    }
                    lastTimestamp = thisTimeStamp
                    onMessageFunction({ data })
                }
            })().catch(err => {
                console.log(err.stack)
            }).then(function () {
                console.log('finish replay')
            })
        }
        
        async function waitForOnline(){
            if(this.connected) return true                
            var defer=bluebird.defer()
            var y=setInterval(function(){
                if(this.connected) {
                    clearInterval(y)
                    defer.resolve()
                }
            },1000)
        }
        async function getOrders(pair){
            await waitForData(pair)
            return orders
        }
        async function getTrades(pair){
            await waitForData(pair)
            return trades
        }
        async function getPublicTradesRatio(pair){
            var pt=await waitForData(pair)
            pt=pt.publicTrades
            var plus=_.filter(pt,(i=>{
                return i.amount>0
            }))
            var minus=_.filter(pt,(i=>{
                return i.amount<0
            }))
            var plusLength=plus.length || 0.0000001
            var minusLength=minus.length
            return parseInt(plusLength / (plusLength+minusLength) * 100)
        }
        async function getPublicTrades(pair){
            var pt=await waitForData(pair)
            return pt.publicTrades
        }
        async function getWallets(pair){
            var wallets=await waitForData(pair)
            return wallets.wallets
        }
        async function getPositions(pair){
            var positions=await waitForData(pair)
            return positions.positions
        }
        async function getBids(pair) {
            var obj=await waitForData(pair)
            return obj.bids
        }
        async function getAsks(pair) {
            var obj=await waitForData(pair)
            return obj.asks
        }
        async function getHighestBid(pair) {
            var obj=await waitForData(pair)
            return _.last(_.sortBy(obj.bids, 'price')).price
        }
        async function getLowestAsk(pair) {
            var obj=await waitForData(pair)
            return _.first(_.sortBy(obj.asks, 'price')).price
        }
        async function waitForData(pair) {
            if(pair){
                pair=pair.toUpperCase()
            }
            var defer = bluebird.defer()
            // console.log(bids)
            test()
            if(!defer.promise.isResolved()) {
                var y = setInterval(test, 50)
            }
            function test() {
                if (_.keys(bids[pair]).length && _.keys(asks[pair]).length) {
                    clearInterval(y)
                    defer.resolve({
                        bids:bids[pair],
                        asks:asks[pair],
                        positions:positions['t' + pair],
                        publicTrades:publicTrades[pair],
                        wallets
                    })
                }
            }
            return defer.promise
        }
        this.getHighestBid = getHighestBid
        this.connected=false
        this.getLowestAsk = getLowestAsk
        this.getOrders= getOrders
        this.getTrades= getTrades
        this.getBids= getBids
        this.getAsks= getAsks
        this.getWallets= getWallets
        this.getPositions= getPositions
        this.getPublicTrades= getPublicTrades
        this.getPublicTradesRatio= getPublicTradesRatio

        function openWebSocket (){
            bids = {}
            asks = {}
            publicTrades={}
            positions={}
            for(var i=0;i<currencies.length;i++){
                bids[currencies[i]]={}
                asks[currencies[i]]={}
                publicTrades[currencies[i]]=[]
                positions[currencies[i]]=[]
            }
            orders = {}
            trades = {}
            channels = {}
            ticker = {}
            wallets= {}
            wallets.funding = {}
            wallets.exchange = {}
            wallets.margin = {}

            if (wss) {
                try{
                    wss.close()
                }
                catch(err){}
            }

            wss = new WebSocket('wss://api.bitfinex.com/ws/')
            
            wss.onerror=()=>{
                self.connected=false
                setTimeout(openWebSocket,5*1000)
                return                
            }
            wss.onclose=()=>{
                self.connected=false
            }
            wss.onmessage = onMessageFunction
            wss.onopen = () => {
                self.connected=true
                const authNonce = Date.now() * 1000
                const authPayload = 'AUTH' + authNonce
                const authSig = crypto
                    .HmacSHA384(authPayload, apiSecret)
                    .toString(crypto.enc.Hex)

                const payload = {
                    apiKey,
                    authSig,
                    authNonce,
                    authPayload,
                    event: 'auth'
                }
                wss.send(JSON.stringify(payload))
                
                for(var i=0;i<currencies.length;i++){
                    wss.send(JSON.stringify({
                        "event": "subscribe",
                        "channel": "book",
                        "pair": currencies[i],
                        "prec": "P0",
                        "freq": "F0"
                    }))
                    wss.send(JSON.stringify({
                        "event": "subscribe",
                        "channel": "trades",
                        "pair": currencies[i],
                        "prec": "P0",
                        "freq": "F0"
                    }))
                }
            }
        }
    }

}
module.exports = {
    Realtime
}

var firstTime=0
//  _.each(bids,(_,key,obj)=>{delete obj[key] })