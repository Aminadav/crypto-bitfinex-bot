SQLite format 3   @    �                                                              � .X\  
�                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              �QWW�tablesqlitebrowser_rename_column_new_tablesqlitebrowser_rename_column_new_tableCREATE TABLE `sqlitebrowser_rename_column_new_table` (
	`id`	INTEGER PRIMARY KEY AUTOINCREMENT,
	`name`	TEXT NOT NULL DEFAULT 'unnamed',
	`variables`	TEXT NOT NULL DEFAULT '{}',
	`loop`	boolean NOT NULL DEFAULT 0,
	`source`	TEXT NOT NULL D�n�?tablebotsbotsCREATE TABLE "bots" (
	`id`	INTEGER PRIMARY KEY AUTOINCREMENT,
	`name`	TEXT NOT NULL DEFAULT 'unnamed',
	`variables`	TEXT NOT NULL DEFAULT '{}',
	`loop`	boolean NOT NULL DEFAULT 0,
	`source`	TEXT NOT NULL DEFAULT ''
)P++Ytablesqlite_sequencesqlite_sequenceCREATE TABLE sqlite_sequence(name,seq)   ��%tablebotsbotsCREATE TABLE `bots` (
	`id`	INTEGER PRIMARY KEY AUTOINCREMENT,
	`name`	TEXT NOT NULL,
	`variables`	TEXT NOT NULL,
	`loop`	boolean NO        : :��q� M        - 31hi{"symbol":"symbol"}console.log('hi2')�$ !��'maker_oder{"symbol":"symbol","amount":"number","wallet":"wallet","side":"side"}var price
var oldPrice
var remaingAmount=0
var orders
var thisOrder
var oldOrder_id=''
var is_cancelled=false
var firstTime=true

price_precious=1
if (variables.symbol.pair=='btcusd') price_precious=0.1
var allBalance=variables.amount==-1

var price
while(true) {



  if(variables.side=='buy') {
    if(oldPrice!=maxBid) {
       price=parseFloat(Big(maxBid).plus(price_precious).toFixed())
    }
    if(price>=minAsk) price=parseFloat(Big(minAsk).minus(price_precious).toFixed())
  } else {
    if(oldPrice!=minAsk) {
      price=parseFloat(Big(minAsk).minus(price_precious).toFixed())
    }
    if(price<=maxBid) price=parseFloat(Big(maxBid).plus(price_precious).toFixed())
  } 

  if(variables.side=='buy'){
    currency=variables.symbol.pair.slice(3).toUpperCase()
  } else {
    currency=variables.symbol.pair.slice(0,3).toUpperCase()
  }
  if(allBalance){
     if(variables.side=='buy')
        remaingAmount=Big(wallets[variables.wallet][currency]/price-0.00005).toFixed(4)
     else
        remaingAmount=wallets[variables.wallet][currency]
  }
  console.log('remaingAmount=',remaingAmount)
  console.log('price=',price)
  if(0){ 
    await bluebird.delay(3000); continue
  }

  if(
      (firstTime || is_cancelled) ||   //  If it is the firstTime or it is cancel bease post type
      (remaingAmount && (oldPrice !=price)) // OR the last order did not completed succesfully, and the price moves.
  ) {
        firstTime=false
        oldPrice=price

        try {
            var order=await new_order({
                oldOrder_id,
                symbol:variables.symbol.pair,
                amount: remaingAmount || variables.amount,
                price,
                side:variables.side,
                type: variables.wallet=='exchange' ? 'exchange limit' : 'limit' ,
                is_postonly:true,
                retries:1
            })
        } catch(abc){
//            console.log('error on trying order:', abc.message)
            if(abc.message.indexOf('404')==0 || abc.message.indexOf('Order could not')>=0) {
                console.log('cannot cancel. order is fullfilled. great. break')
                break;
            } else {
               console.log('error on trying order:', abc.message)
                throw abc
            }
        }
    }
//    console.log('posted order:', JSON.stringify( order))

    while(true) {                   
        thisOrder=orders && orders[order.id]
        if(thisOrder) {
            break
        }
        await bluebird.delay(100)
    }
    if(thisOrder.amount==0) { // no more amount. order fullfilled
        console.log('order fullfilled!')
        break;
    } else if(thisOrder.status=='POSTONLY CANCELED') {   // 'ACTIVE',                        
        console.log('It is cancleded because it is post only. we need to break and try again')
        is_cancelled=true
    } else { 
        // order exist. 
        remaingAmount=Math.abs (thisOrder.amount) // The rema�7 3�Chi{"symbol":"symbol"}console.log('hi2')
fs.appendFileSync('output.txt','hi2 launched\n')
//setInterval(function(){
//console.log('after second')
//},1000)
result('hi 2 worked')� W�Cbuy-limit{"wallet":"wallet","symbol":"symbol"}console.log(wallets[variables.wallet])  
  var result=await transfer({
  amount: 0.1,
  currency: "USD",
  walletfrom: "exchange",
  walletto: "margin"
})
await bluebird.delay(100)
console.log(wallets[variables.wallet])�g �3�transfer{"amount":"number","currency":"currency","walletfrom":"wallet","walletto":"wallet"}await console.log('before')
console.log(wallets[variables.walletfrom][variables.currency])
var result=await transfer({
amount: variables.amount,
currency: variables.currency,
walletfrom: variables.walletfrom,
walletto: variables.walletto
})
console.log(result)N IWff3-5{"nbv":"bv","symbol":"symbol"}console.log(0)
console.log(positions) -new-bot{}this-should-work %unnamed2{}Hello World!   � ��                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 (	Wsqlitebrowser_rename_column_new_tabl	bots	   �    �q� M         , 3/hi{"symbol":"symbol"}console.log('hi')�$ !��'maker_oder{"symbol":"symbol","amount":"number","wallet":"wallet","side":"side"}var price
var oldPrice
var remaingAmount=0
var orders
var thisOrder
var oldOrder_id=''
var is_cancelled=false
var firstTime=true

price_precious=1
if (variables.symbol.pair=='btcusd') price_precious=0.1
var allBalance=variables.amount==-1

var price
while(true) {



  if(variables.side=='buy') {
    if(oldPrice!=maxBid) {
       price=parseFloat(Big(maxBid).plus(price_precious).toFixed())
    }
    if(price>=minAsk) price=parseFloat(Big(minAsk).minus(price_precious).toFixed())
  } else {
    if(oldPrice!=minAsk) {
      price=parseFloat(Big(minAsk).minus(price_precious).toFixed())
    }
    if(price<=maxBid) price=parseFloat(Big(maxBid).plus(price_precious).toFixed())
  } 

  if(variables.side=='buy'){
    currency=variables.symbol.pair.slice(3).toUpperCase()
  } else {
    currency=variables.symbol.pair.slice(0,3).toUpperCase()
  }
  if(allBalance){
     if(variables.side=='buy')
        remaingAmount=Big(wallets[variables.wallet][currency]/price-0.00005).toFixed(4)
     else
        remaingAmount=wallets[variables.wallet][currency]
  }
  console.log('remaingAmount=',remaingAmount)
  console.log('price=',price)
  if(0){ 
    await bluebird.delay(3000); continue
  }

  if(
      (firstTime || is_cancelled) ||   //  If it is the firstTime or it is cancel bease post type
      (remaingAmount && (oldPrice !=price)) // OR the last order did not completed succesfully, and the price moves.
  ) {
        firstTime=false
        oldPrice=price

        try {
            var order=await new_order({
                oldOrder_id,
                symbol:variables.symbol.pair,
                amount: remaingAmount || variables.amount,
                price,
                side:variables.side,
                type: variables.wallet=='exchange' ? 'exchange limit' : 'limit' ,
                is_postonly:true,
                retries:1
            })
        } catch(abc){
//            console.log('error on trying order:', abc.message)
            if(abc.message.indexOf('404')==0 || abc.message.indexOf('Order could not')>=0) {
                console.log('cannot cancel. order is fullfilled. great. break')
                break;
            } else {
               console.log('error on trying order:', abc.message)
                throw abc
            }
        }
    }
//    console.log('posted order:', JSON.stringify( order))

    while(true) {                   
        thisOrder=orders && orders[order.id]
        if(thisOrder) {
            break
        }
        await bluebird.delay(100)
    }
    if(thisOrder.amount==0) { // no more amount. order fullfilled
        console.log('order fullfilled!')
        break;
    } else if(thisOrder.status=='POSTONLY CANCELED') {   // 'ACTIVE',                        
        console.log('It is cancleded because it is post only. we need to break and try again')
        is_cancelled=true
    } else { 
        // order exist. 
        remaingAmount=Math.abs (thisOrder.amount) // The remaining amount is the new amount (amount is negative in selling)
        // next time replace this order
        oldOrder_id=thisOrder.id
    }                
await bluebird.delay(1000)
}� W�Cbuy-limit{"wallet":"wallet","symbol":"symbol"}console.log(wallets[variables.wallet])  
  var result=await transfer({
  amount: 0.1,
  currency: "USD",
  walletfrom: "exchange",
  walletto: "margin"
})
await bluebird.delay(100)
console.log(wallets[variables.wallet])�g �3�transfer{"amount":"number","currency":"currency","walletfrom":"wallet","walletto":"wallet"}await console.log('before')
console.log(wallets[variables.walletfrom][variables.currency])
var result=await transfer({
amount: variables.amount,
currency: variables.currency,
walletfrom: variables.walletfrom,
walletto: variables.walletto
})
console.log(result)N IWff3-5{"nbv":"bv","symbol":"symbol"}console.log(0)
console.log(positions) -new-bot{}this-should-work %unnamed2{}Hello W   
 v Tv�                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        � 3�ilaunch-hi{"symbol":"symbol"}console.log('hi1')
//var x=await startBot('hi',{symbol:'btcusd'})
console.log('startBot type')
console.log(x)
   J !��maker_oder{"symbol":"symbol","amount":"number","wallet":"wallet� !��maker_oder{"symbol":"symbol","amount":"number","wallet":"wallet","side":"side"}var price
var oldPrice
var remaingAmount=0
var orders
var thisOrder
var oldOrder_id=''
var is_cancelled=false
var firstTime=true

price_precious=1
if (variables.symbol.pair=='btcusd') price_precious=0.1
var allBalance=variables.amount==-1

var price
while(true) {



  if(variables.side=='buy') {
    if(oldPrice!=maxBid) {
       price=parseFloat(Big(maxBid).plus(price_precious).toFixed())
    }
    if(price>=minAsk) price=parseFloat(Big(minAsk).minus(price_precious).toFixed())
  } else {
    if(oldPrice!=minAsk) {
      price=parseFloat(Big(minAsk).minus(price_precious).toFixed())
    }
    if(price<=maxBid) price=parseFloat(Big(maxBid).plus(price_precious).toFixed())
  } 

  if(variables.side=='buy'){
    currency=variables.symbol.pair.slice(3).toUpperCase()
  } else {
    currency=variables.symbol.pair.slice(0,3).toUpperCase()
  }
  if(allBalance){
     if(variables.side=='buy')
        remaingAmount=Big(wallets[variables.wallet][currency]/price).toFixed(4)
     else
        remaingAmount=wallets[variables.wallet][currency]
  }
  console.log('remaingAmount=',remaingAmount)
  console.log('price=',price)
  if(0){ 
    await bluebird.delay(3000); continue
  }

  if(
      (firstTime || is_cancelled) ||   //  If it is the firstTime or it is cancel bease post type
      (remaingAmount && (oldPrice !=price)) // OR the last order did not completed succesfully, and the price moves.
  ) {
        firstTime=false
        oldPrice=price

        try {
            var order=await new_order({
                oldOrder_id,
                symbol:variables.symbol.pair,
                amount: remaingAmount || variables.amount,
                price,
                side:variables.side,
                type: variables.wallet=='exchange' ? 'exchange limit' : 'limit' ,
                is_postonly:true,
                retries:1
            })
        } catch(abc){
//            console.log('error on trying order:', abc.message)
            if(abc.message.indexOf('404')==0 || abc.message.indexOf('Order could not')>=0) {
                console.log('cannot cancel. order is fullfilled. great. break')
                break;
            } else {
               console.log('error on trying order:', abc.message)
                throw abc
            }
        }
    }
//    console.log('posted order:', JSON.stringify( order))

    while(true) {                   
        thisOrder=orders && orders[order.id]
        if(thisOrder) {
            break
        }
        await bluebird.delay(100)
    }
    if(thisOrder.amount==0) { // no more amount. order fullfilled
        console.log('order fullfilled!')
        break;
    } else if(thisOrder.status=='POSTONLY CANCELED') {   // 'ACTIVE',                        
        console.log('It is cancleded because it is post only. we need to break and try again')
        is_cancelled=true
    } else { 
        // order exist. 
        remaingAmount=Math.abs (thisOrder.amount) // The remaining amount is the new amount (amount is negative in selling)
        // next time replace this order
        oldOrder_id=thisOrder.id
    }                
await bluebird.delay(2000)
}	 efs{}