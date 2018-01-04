// @ts-check
"use strict"

// modules
const crypto = require('crypto')
var _=require('lodash')
var request=require('request-promise')
var bluebird=require('bluebird')
var colors=require('colors')
var moment=require('moment-timezone')
const EventEmitter = require('events');
var Big=require('big.js')



// Modules
var Realtime=require('./realtime').Realtime



class Bot {
    constructor(props){
        var log=arguments && arguments[0] && arguments[0].log
        if(!log) log=function(){console.log.apply(console,arguments)}
        
        // check_enviroment()
        check_props(props)
        
        
        // if(arguments.length>0){
        //     check_props(arguments[0])
        // } else {
        //     check_arguments()
        // }

        // CONST VARIABLES
        const NO_MORE='NO_MORE_ONCE'
        const DO_AGAIN='DO_AGAIN'
        const baseUrl = 'https://api.bitfinex.com'
        const CURRENCIES={
            'btc':'btc',
            'usd':'usd',
            'btg':'btg',
            'bch':'bch',
            'bt1':'bt1',
            'bt2':'bt2',
            'eth':'eth',
        }
        const WALLETS={
            'margin':'trading',
            'exchange':'exchange'
        }
        const SYMBOLS={
            'btcusd':'btcusd',
            'bt1usd':'bt1usd',
            'bt2usd':'bt2usd',
            'bchusd':'bchusd',
        }
        const ORDER_TYPES={
            'market':'market',
            'limit':'limit',
            'stop':'stop',
            'trailing_stop':'trailing-stop',
            'fill_or_kill':'fill-or-kill',
            'exchange_market':'exchange market',
            'exchange_limit':'exchange limit',
            'exchange_stop':'exchange stop',
            'exchange_trailing_stop':'exchange trailing-stop',
            'exchange_fill_or_kill':'exchange fill-or-kill',
        }
        const ORDER_SIDES={
            'buy':'buy',
            'sell':'sell'
        }
        const RETRY_DELAY_MS=6000 

        logDebug('account: ',account)
        logDebug('max_retry: ',MAX_RETRY)
        logDebug('retry_delay_ms: ',RETRY_DELAY_MS)
        logDebug('====')


        async function transfer({amount,currency,walletfrom,walletto,log}){
            log('transfer: ' + JSON.stringify(arguments[0]))
            // if(!_.isFinite(amount)){ throw new Error('invalid amount')}
            // if(_.indexOf(_.toArray(CURRENCIES),currency)<0 ){ throw new Error('invalid currency')}
            // if(_.indexOf(_.toArray(WALLETS),walletfrom)<0 ){ throw new Error('invalid walletfrom')}
            // if(_.indexOf(_.toArray(WALLETS),walletto)<0 ){ throw new Error('invalid walletto')}
            // if(walletto==walletfrom) { throw new Error('walletto must be non equal to walletfrom')}
            if(ONLY_VERIFICATION) return
            arguments[0].amount=arguments[0].amount.toString()
            arguments[0].currency=arguments[0].currency.toUpperCase()
            return await doAndRetry('transfer',arguments[0],null,function(i){
                return i && i[0] && i[0].status=='success'
            },log)
        }

        async function close_all_orders(){
            logAction('CLOSE_ALL_ORDERS')
            if (ONLY_VERIFICATION) {
                return
            }
            return doAndRetry('order/cancel/all',null,null,function(i){
            return i.status=='success' || i.result=='None to cancel'
            })
        }

        async function get_price(ticker){
            logDebug('get_price: ' + ticker)
            logDebug('checking get_price validation ',ticker)
            return await realtime.getLowestAsk()
            // if(_.indexOf(_.toArray(SYMBOLS),ticker)<0) throw new Error('ticker not found')
            // var ticker= await doAndRetry('pubticker/' + ticker,null,true,function(ticker){
                // return ticker.bid
            // })
            // return parseFloat(ticker.bid)
        }
        async function doAndRetry(action,parameters,is_get,validation,log){
            var retry
            var error
            var max_retries=MAX_RETRY
            if(parameters && parameters.retries) {
                max_retries=parameters.retries
            }
            for(retry=1;retry<=max_retries;retry++) {
                error=null
                log('try ' + retry + '/' + MAX_RETRY,action,parameters ? JSON.stringify(parameters) : '')
                try{
                    var result=await sendActions(action,parameters,is_get)
                    if(validation){
                        var is_valid=validation(result)
                        if(!is_valid) throw new Error('response not valid:' + JSON.stringify(result))
                    }            
                    break;
                }
                catch(err) {
                    error=err
                    log('try not success: ' + err.message)
                }
                log('waiting: ' + RETRY_DELAY_MS)
                await bluebird.delay(RETRY_DELAY_MS)
            }
            if (retry>MAX_RETRY) {
                logError('no more retries. sorry')
                throw new Error('No more retries')
            } else {
            }
            if(error) {
                log('try error')
                throw error
            } else {
                log('try success')
                return result
            }

            /*
                We define it here, becaues we don't want any function
                to call it directly without using the retring algorithm
            */
            async function sendActions(action,parameters,is_get){
                const url = '/v1/' + action
                const nonce = Date.now().toString()
                const completeURL = baseUrl + url
                const body = {
                request: url,
                nonce
                }
                Object.assign(body,parameters)
                const payload = new Buffer(JSON.stringify(body)).toString('base64')

                const signature = crypto.createHmac('sha384', apiSecret).update(payload).digest('hex')

                const options = {
                    url: completeURL,
                    headers: {
                        'X-BFX-APIKEY': apiKey,
                        'X-BFX-PAYLOAD': payload,
                        'X-BFX-SIGNATURE': signature
                    },
                    json: body
                }
                var method
                if(is_get) {
                    var response=await request.get( options)
                    if(response) {
                        response.status='success'
                    }
                } else {
                    var response=await request.post( options )
                }
                logDebug('response:' + JSON.stringify(response))
                if(!response) {
                    throw new Error('no response')
                }
                return response; //success
            }
        }
        function now(){
            return moment().tz('Asia/Jerusalem').format('YYYY-MM-DD HH:mm:ss')
        }
        function logStep(argument){
            log(colors.green(argument))
        }
        function logErrorExit(argument){
            logError(argument)
            process.exit()
        }
        function logError(argument){
            console.error(colors.red(argument))
        }
        function logError(argument){
            log(colors.green(argument))
        }
        function logAction(argument){
            log('>>>>>>>>',colors.red(argument + ' ' +( ONLY_VERIFICATION ? '[DRY]' : '[WET]')))
        }
        function logDebug(){
            log('=============================',now(), ...arguments)
        }
        async function import_notification(message){
        }

        async function loop(once){
            while(true) {
                try{
                    logStep('START ALGORITHM')
                    var result=await once()
                    if(result==NO_MORE) {
                        logStep('ONCE REQUESTED TO STOP BY USING BOT.NO_MORE_ONCE\n')
                        break;
                    }
                    else if(result==DO_AGAIN) {
                        logStep('ONCE REQUESTED TO START AGAIN\n')
                    } else {
                        logError('PLEASE return `bot.DO_AGAIN or `return bot.NO_MORE` in your once function. By default we continue\n')
                    }
                    logStep('FINISH ALGORITHM. DELAYING\n')
                } catch(err){
                    logStep('ERROR IN ONCE, SO WE START AGAIN!!!' + err.message)
                }
                await bluebird.delay(5000)
            }
        }


        var ONLY_VERIFICATION
        async function start(once){

            // once or loop
            if(process.argv.join().indexOf('--once')!=-1) {
                logStep(`BOT WILL LAUNCH ONLY ONE TIME`)
                return once().then(()=>{
                            logDebug('once returned without error')
                        })
                        .catch(err=>{
                            logDebug('once returned with error:')
                            logDebug(err)
                            throw err
                        })
            }
            else if(process.argv.join().indexOf('--loop')!=-1) {
                logStep(`BOT RUNNING IN A INFINITE LOOP`)
                loop(once)
            } else {
                logStep('YOU MUST PROVIDE COMMAND LINE ARGUMENT --once OR --loop')
            }
        }

        function get_command_line_argument(name){
            var nameIndex=_.indexOf(process.argv,name)
            if (nameIndex>=0 && nameIndex<process.argv.length-1){
                return process.argv[nameIndex+1]
            }
        }

        async function new_order({oldOrder_id=0,symbol,amount,price,side,type,is_postonly=false,use_all_available=0,retries=0,log}){
            //https://bitfinex.readme.io/v1/reference#rest-auth-new-order
            amount=parseFloat(amount).toFixed(7)
            price=parseFloat(price).toFixed(2)
            symbol=symbol.toLowerCase()
            logAction('NEW ORDER: ' + JSON.stringify(arguments[0]))
            if(_.indexOf(_.toArray(SYMBOLS),symbol)<0) throw new Error('symbol not found')
            if(!_.inRange(amount,0,10000000)) throw new Error('amount is not in range')
            if(type!=ORDER_TYPES.market && type!=ORDER_TYPES.exchange_market) {
                if(!_.inRange(price,0,10000000)) throw new Error('price not valid')
            }
            if(_.indexOf(_.toArray(ORDER_TYPES),type)<0) throw new Error('type is not found')
            if(_.indexOf(_.toArray(ORDER_SIDES),side)<0) throw new Error('side is not found')

            if(use_all_available) use_all_available=1
            if(ONLY_VERIFICATION) {
                return
            }            
            return await doAndRetry(oldOrder_id ? 'order/cancel/replace' : 'order/new',{
                order_id:oldOrder_id ? oldOrder_id : undefined,
                symbol:symbol.toLowerCase(),
                amount:amount.toString(),
                price:price ? price.toString() : Math.random().toString(),
                side,
                type,
                use_all_available,
                is_postonly,
                retries                
            },null,function(result){
                return result && parseInt(result.id)>0
            },log)

            // {"id":4970686970,"cid":30561975837,"cid_date":"2017-11-09","gid":null,"symbol":"btcusd","exchange":"bitfinex","price":"7238.8","avg_execution_price":"0.0","side":"sell","type":"exchange limit","timestamp":"1510216162.033013382","is_live":true,"is_cancelled":false,"is_hidden":false,"oco_order":null,"was_forced":false,"original_amount":"0.0046593","remaining_amount":"0.0046593","executed_amount":"0.0","src":"api","order_id":4970686970}
        }

        async function close_all_positions(){
            // close positions by start with getting them
            logAction('close all positions')
            var positions=await get_positions()
            _.remove(positions,i=>{i.status!='ACTIVE'})

            for(var i=0;i<positions.length;i++){
                var position=positions[i]
                logAction('closing position #1' + JSON.stringify(position))
                await new_order({
                    symbol:position.symbol,
                    amount:position.amount>0 ? position.amount : -position.amount,  // amount must be positive,
                    side:parseFloat(position.amount)>0 ? ORDER_SIDES.sell : ORDER_SIDES.buy,
                    type:ORDER_TYPES.market,
                    price:null,
                })
            }
        }

        async function buy_limit(){
            new_order
        }

        async function get_positions(){
            return await doAndRetry('positions',null,true,function(result){
                return _.isArray(result)
            })
        }

        async function get_balances(){
            return await doAndRetry('balances',null,true,function(result){
                return _.isArray(result)
            })
        }
        async function get_order(order_id){
            return await doAndRetry('order/status',{order_id:order_id},null,function(result){
                return result.id
            })
        }

        async function cancel_order(order_id){
            logAction('CANCAL ORDER:' + order_id)
            return await doAndRetry('order/cancel',{order_id:order_id},null,function(result){
                return result.is_cancelled=true
            })
        }
        async function get_balance({wallet,currency}){
            var balances= await doAndRetry('balances',null,true,function(result){
                return _.isArray(result)
            })
            var n=_.find(balances,i=>{
                return i.type==wallet && i.currency==currency
            })
            if(n) {
                return {
                    available:n.available,
                    amount:n.amount
                }
            }
        }

        async function transfer_all_balances_to_exchange(){
            await get_balances();
            logAction('transfer_all_balances_to_exchange')
            var balances=await get_balances()
            for (var i=1;i<balances.length;i++){
                var balance=balances[i]
                balance.amount=parseFloat(balance.available)
                balance.available=parseFloat(balance.available)
                if(balance.amount==0) continue;
                if(balance.type!='trading') continue;
                if(balance.available<balance.amount){
                    throw new Error('cannot transfer balance. not all your balance available')
                }
                await transfer({
                    amount:balance.available,
                    currency:balance.currency,
                    walletfrom:'trading',
                    walletto:'exchange'
                })
            }
        }

        var account,apiKey,apiSecret
        var MAX_RETRY
        var REPLAY_FILENAME    
        var RECORD_FILENAME   
        var REPLAY_SPEED_FACTOR    
        function check_enviroment(){
            apiKey=process.env.bitfinex_key
            apiSecret=process.env.bitfinex_secret
        }
        function check_props(props){
            apiKey=props.apiKey
            apiSecret=props.apiSecret
            MAX_RETRY=props.maxRetry
        }
        function check_arguments(){
            // dry run or wet run
            if(process.argv.join().indexOf('--dry')!=-1) {
                logStep(`BOT WILL LAUNCH USING DRY RUN`)
                ONLY_VERIFICATION=true
            } else if(process.argv.join().indexOf('--wet')!=-1) {
                ONLY_VERIFICATION=false
                logStep(`BOT WILL LAUNCH ON REAL DATA`)
            } else {
                logErrorExit('YOU MUST PROVIDE COMMAND LINE ARGUMENT --wet OR --dry')
                process.exit()
            }
            account=get_command_line_argument('--account')
            if(!account) logErrorExit('you must provide --account')
            apiKey=get_command_line_argument('--key')
            if(!apiKey) logErrorExit('you must provide --key')
            apiSecret=get_command_line_argument('--secret')
            if(!apiSecret) logErrorExit('you must provide --secret')

            MAX_RETRY=parseInt(get_command_line_argument('--max-retry'))
            // if(!MAX_RETRY) logErrorExit('you must provide --max-retry')
            if(!MAX_RETRY) MAX_RETRY=10

            REPLAY_FILENAME=get_command_line_argument('--replay')
            RECORD_FILENAME=get_command_line_argument('--record')
            REPLAY_SPEED_FACTOR=parseFloat(get_command_line_argument('--replay-speed'))
        }

        async function force_maker_order({side,symbol,wallet,amount=0,log}){
            var oldOrder_id=0
            var firstTime=true
            var is_cancelled=false
            var price
            var remaingAmount
            while(true)  {
                var bid=await realtime.getHighestBid(symbol.toUpperCase())
                var ask=await realtime.getLowestAsk(symbol.toUpperCase())
                
                if(side==ORDER_SIDES.buy) {
                    if(bid+0.1<ask) {
                        var new_price=parseFloat(Big(bid).add(0.1).toFixed())
                        log(`price set to bid+0.1 (${new_price}) because bid is ${bid} and ask is${ask}`)
                        price=new_price
                    } else {
                        log(`price set to bid (${bid}) because bid is ${bid} and ask is${ask}`)
                        price=bid
                    }           
                } 
                else 
                {
                    // sell
                    if(ask-0.1>bid) {
                        var new_price=parseFloat(Big(ask).minus(0.1).toFixed())
                        log(`price set to ask-0.1 (${new_price}) because ask is ${ask} and bid is${bid}`)
                        price=new_price
                    } else {
                        log(`price set to ask (${ask}) because ask is ${ask} and bid is${ask}`)
                        price=ask 
                    }           
                }
                
                console.log('firstTime:',firstTime)
                console.log('is_cancelled:',is_cancelled)
                console.log('oldPrice:',oldPrice)
                console.log('price:',price)
                if(
                    (firstTime || is_cancelled) ||   //  If it is the firstTime or it is cancel bease post type
                    (remaingAmount && (oldPrice !=price)) // OR the last order did not completed succesfully, and the price moves.
                )
                try {
                    var order=await new_order({
                        oldOrder_id,
                        symbol,
                        amount: remaingAmount || amount,
                        price,
                        side,
                        type: wallet=='exchange' ? ORDER_TYPES.exchange_limit : ORDER_TYPES.limit ,
                        is_postonly:true,
                        // use_all_available:1,
                        retries:1,
                        log
                    })
                } catch(abc){
                    console.log('error on trying order:', abc.message)
                    console.log(abc.message.indexOf('404'))
                    if(abc.message.indexOf('404')==0) {
                        console.log('cannot cancel order is fullfilled. great. break')
                        break;
                    } else if(abc.message.indexOf('Order could not')>=0) {
                        console.log('cannot cancel order is ${abc.message}. GREAT. break')
                        break;
                    }
                    throw abc
                }
                var oldPrice=price
                var oldOrder_id=''
                remaingAmount=0
                is_cancelled=false
                log('posted order:', JSON.stringify( order))
                var orders,thisOrder
                // Minimum wait
                // await bluebird.delay(500)
                while(true) {                   
                    orders=await realtime.getOrders(symbol)
                    thisOrder=orders && orders[order.id]
                    if(thisOrder) break
                    await bluebird.delay(100)
                }
                console.log('order from websocket:',JSON.stringify(thisOrder))
                if(thisOrder.amount==0) { // no more amount. order fullfilled
                    log('order fullfilled!')
                    break;
                } else if(thisOrder.status=='POSTONLY CANCELED') {   // 'ACTIVE',                        
                    log('It is cancleded because it is post only. we need to break and try again')
                    is_cancelled=true
                } else { 
                    // order exist. 
                    remaingAmount=Math.abs(thisOrder.amount) // The remaining amount is the new amount (amount is negative in selling)
                    // next time replace this order
                    oldOrder_id=thisOrder.id
                }                
                
                // var orders=await realtime.getOrders()
                // log(orders)
                // log(order.id)
                // if(!orders[order.id]) {
                    // continue
                // }
                // if(orders[order.id].status=='POSTONLY CANCELED') {   // 'ACTIVE',                        
                    // oldOrder_id=order.id
                    // break;
                // } else if (amount>0){
                    //should replace order
                    // oldOrder_id=order.id
                    // await cancel_order(order.id)
                    // break;
                // }
                // await bluebird.delay(1000)
                    // log('transaction')
                    // var transactions=await realtime.getTransactions()
                    // log(transactions)
                    // await bluebird.delay(1000)
                // }
                // log(orders)
                firstTime=false
            }
            log('order completed succesfully')
        }
        var realtime=new Realtime({
            apiKey,
            apiSecret,
            record_filename:RECORD_FILENAME,
            replay_filename:REPLAY_FILENAME,
            replay_speed_factor:REPLAY_SPEED_FACTOR
        })

        // EXPORTS

        // CONST information for aour arguments
        this.WALLETS=WALLETS,
        this.CURRENCIES=CURRENCIES,
        this.SYMBOLS=SYMBOLS,
        this.NO_MORE=NO_MORE,
        this.DO_AGAIN=DO_AGAIN,
        this.ORDER_TYPES=ORDER_TYPES,
        this.ORDER_SIDES=ORDER_SIDES,
        
        // Log information
        this.logStep=logStep,
        this.logAction=logAction,
        this.logError=logError,
        this.logErrorExit=logErrorExit,

        // Algorithm processing
        this.start=start,

        // get inforamtion
        this.get_price=get_price,
        this.get_positions=get_positions,
        this.get_balances=get_balances,
        this.get_balance=get_balance,
        this.get_order=get_order,

        // actions
        this.close_all_orders=close_all_orders
        this.close_all_positions=close_all_positions
        this.transfer_all_balances_to_exchange=transfer_all_balances_to_exchange
        this.new_order=new_order
        this.transfer=transfer
        this.buy_limit=buy_limit
        this.cancel_order=cancel_order
        this.force_maker_order=force_maker_order

        // realtime info
        this.realtime=realtime
    }
}

module.exports=Bot