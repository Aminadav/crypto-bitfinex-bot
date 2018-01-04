var Bot=require('./bot')
var bluebird=require('bluebird')

var bot=new Bot()

// BOT PARAMS
const START=6483
const FINISH=8000
const STEPS=10

async function init(){
    for(var i=START; (START>FINISH && i>FINISH) || i<FINISH && i<FINISH; i+=STEPS * (START>FINISH ? -1 : 1)){
        console.log('for:' + i)
        var result=await get_available({
            rate:i
        })
        console.log(result)
        if(result>0.004) {
            await bot.actions.new_order({
                amount:result,
                symbol:'BTCUSD',
                price:i,
                side:'buy',
                type:bot.ORDER_TYPES.stop,
            })
        }
        await bluebird.delay(5000)
    }
    console.log('finish')
    prcoess.exit()
}

init().catch(err=>{
    throw err
})


function get_available({rate}){
    const crypto = require('crypto')
    const request = require('request')
    var bluebird=require('bluebird')
    var defer=bluebird.defer()

    const apiKey = 'cqF0WYs5yS7oSfQTX1cdkatAiFP86EzpcM603aQNnRm'
    const apiSecret = 'tHXtHQh9GZAl4iJQmCrhB26NWiDlyZh7NdtZUTaDfKx'

    const apiPath = 'v2/auth/calc/order/avail'
    const nonce = Date.now().toString()
    const body = {
            symbol: 'tBTCUSD',
            dir: 1, 
            rate,
            type: 'TRADING'
        }
    const rawBody = JSON.stringify(body)
    let signature = `/api/${apiPath}${nonce}${rawBody}`

    signature = crypto
    .createHmac('sha384', apiSecret)
    .update(signature)
    .digest('hex')

    const options = {
    url: `https://api.bitfinex.com/${apiPath}`,
    headers: {
        'bfx-nonce': nonce,
        'bfx-apikey': apiKey,
        'bfx-signature': signature
    },
    body: body,
    json: true
    }
    request.post(options, (error, response, body) => {
        if(error) {
            defer.reject(error)
        } else {
            defer.resolve(body[0])
        }
    })  
    return defer.promise
}