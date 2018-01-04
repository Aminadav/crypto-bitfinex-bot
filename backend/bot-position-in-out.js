var Bot=require('./bot')

var bot=new Bot()

async function init(){
    bot.actions.force_maker_order({
        side:'sell',
        symbol:'BTCUSD',
        wallet:'trading'
    })
}

init().catch(err=>{
    throw err
})