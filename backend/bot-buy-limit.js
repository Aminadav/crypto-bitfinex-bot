var Bot=require('./bot')
var bot=new Bot()

var i=bot.actions.force_maker_order({
    side:'buy',
    all:true,
    symbol:'bchusd',
    wallet:bot.WALLETS.margin,
    amount:0.02
})

i.then(function(){
    process.exit()
}).catch(err=>{
    throw (err)
})