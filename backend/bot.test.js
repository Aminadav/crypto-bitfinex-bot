"use strict"

var bot=require('./bot.js')

async function once(){
    bot.logStep('GET PRICE')

    // var result=await bot.get_positions()
    console.log(result)
    // var price=await bot.get_price(bot.SYMBOLS.btcusd)
    
    // bot.log(`CHECK IF ${price} <8000`)    
    // if(price<8000) {
    //     bot.log(`PRICE IS <8000`)
    // }
}

// once()
// bot.start(once)

bot.transfer({
    amount:'0.001',
    currency:'BTC',
    walletfrom:'trading',
    walletto:'exchange'
})
