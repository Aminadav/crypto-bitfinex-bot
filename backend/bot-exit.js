// @ts-check

"use strict"

var Bot=require('./bot.js')
var bot=new Bot({})


const  BOT_PARMETERS={
    PRICE_TO_EXIT:80
}
bot.logStep('BOT PARMETERS:' + JSON.stringify(BOT_PARMETERS))

// instruction for bot
// before each step inclue bot.logStep
// must return bot.NO_MORe or bot.DO_AGAIN
// always use await

// @ts-ignore
async function once(){
    bot.logStep('GET PRICE')
    var price=await bot.get_price(bot.SYMBOLS.btcusd)
    
    bot.logStep(`CHECK IF ${price} < ${BOT_PARMETERS.PRICE_TO_EXIT}`)    
    if(price>0 && price<BOT_PARMETERS.PRICE_TO_EXIT) {
        bot.logStep(`CONDITION TRUE`)
        await bot.actions.close_all_orders()
        await bot.actions.close_all_positions()
        await bot.actions.transfer_all_balances_to_exchange()       
        bot.logStep('CHECK BTC IN WALLET') 
        var btc_in_wallet=await bot.realtime.wallets.exchange['BTC']
        bot.logStep('Found:' + btc_in_wallet + '. Selling all')
        await bot.actions.new_order({
            symbol:bot.SYMBOLS.btcusd,
            amount:btc_in_wallet,
            side:bot.ORDER_SIDES.sell,
            type:bot.ORDER_TYPES.exchange_market
        })            
        return bot.NO_MORE
    }
    return bot.DO_AGAIN
}

bot.start(once)

// bot.transfer({
//     amount:0.001,
//     currency:'btc',
//     walletfrom:'trading',
//     walletto:'exchange'
// })


// bot.tra