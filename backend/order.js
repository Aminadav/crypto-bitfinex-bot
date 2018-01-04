var Bot=require('./bot')

var bot=new Bot()


async function init(){
    await bot.actions.force_maker_order({
        type:bot.ORDER_TYPES.exchange_limit,
        wallet:bot.WALLETS.margin,
        side:bot.ORDER_SIDES.sell,
        symbol:bot.SYMBOLS.bchusd,
        amount:0.02
    })
}

try {
    init().catch(err=>{
        console.
    })
} catch(err){
    throw err
}