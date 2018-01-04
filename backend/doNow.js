// @ts-check

var bluebird=require('bluebird')
var readline=require('readline')

// modules
var bot=require('./bot')
// const rl = readline.createInterface({
//   input: process.stdin,
//   output: process.stdout,
// });
// bluebird.promisifyAll(rl)

async function doNow(){
    // setInterval(async function(){
    console.log(await bot.realtime.getHighestBid() , ' <-> ' ,await bot.realtime.getLowestAsk())
    // },100)
    // var amount=await question('Amount to buy? ')
    await doOrder()
    var currentOrder
    async function doOrder() {
        var balance=await bot.get_balance({
            currency:bot.CURRENCIES.usd,
            wallet:bot.WALLETS.exchange
        })
        var price=await bot.realtime.getHighestBid()
        if(price+0.1<await bot.realtime.getLowestAsk()) {
            price+=0.1
        }
        price+=10
        var amount=balance.available/price
        amount=parseInt(amount*1e6)/1e6
        console.log(amount,typeof amount)

        currentOrder=await bot.actions.new_order({
            oldOrder_id:currentOrder && currentOrder.id,
            symbol:bot.SYMBOLS.btcusd,
            price,
            amount,
            side:bot.ORDER_SIDES.buy,
            type:bot.ORDER_TYPES.exchange_limit,
            is_postonly:true,
        })
        while(true){
            await bluebird.delay(5000)
            // try{
            var orderStatus=await bot.get_order(currentOrder.id)        
            // } catch(err){
                // console.log(err.message)
            // }
            if(!orderStatus.is_live){
                bot.logStep('order is not alive')
                if(parseFloat(orderStatus.remaining_amount)>0) {
                    bot.logStep('there is reaming amount')
                    await doOrder()
                } else {
                    bot.logStep('order is no reaming amount')
                    return 
                }
            } else {
                var new_price=await bot.realtime.getHighestBid()
                if(new_price+0.1<await bot.realtime.getLowestAsk()) {
                    new_price+=0.1
                }
                if(new_price==price){
                    bot.logStep('it is the same price, no need to cancel')
                    // check again in few seconds
                } else {
                    bot.logStep('cancel order')
                    await doOrder()
                    break;
                }
            }
        }
    }
}

doNow().catch(err=>{
    console.log(err)
    console.log(err.stack)
})

async function question(query){
    var defer=bluebird.defer()
    rl.question(query,ans=>{defer.resolve(ans)})
    return defer.promise
}