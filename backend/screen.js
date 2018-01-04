var blessed = require('blessed');

var Bot=require('./bot')

var moment=require('moment')

// Create a screen object. 
var screen = blessed.screen({
  smartCSR: true,
});

var pairs=['BTCUSD','BCHUSD','BCHBTC']
var currencies=['USD','BTC','BCH']

var screenLog=blessed.log({
  width:'100%-2',
  top:'75%',
  height:'25%-1',
  title:'hi',
  border:{
    type:'line'
  }
})
function log_add(text){
  screenLog.add(text)
  // screenLog.
}



var screenBox=blessed.box({
  width:'100%',
  height:'100%',
  title:'hi',
  border:{
    type:'line'
  }
})

screen.append(screenBox)
screenBox.append(screenLog)
var bot=new Bot({log:log_add})
 
var CurrentSymbol=pairs[0]

screen.title = 'my window title';

/*
  // Currency Chooser
*/
var currencyChooser=blessed.list({
  top:1,
  keys:true,
  left:1,
  border:{
    type:'line'
  },
  width:35,
  height:pairs.length+2,
  tags:true,
  items:JSON.parse(JSON.stringify(pairs)) ,
  style: {
    focus:{
      border:{
        fg:'yellow',
      }
    },
    selected:{fg:'black',bg:'white'},  
    fg: 'white',
    bg: 'black',
    border: {
      fg: 'white'
    },
    hover: {
      bg: 'green'
    }
  }
})
currencyChooser.focus()
screen.append(currencyChooser)
currencyChooser.on('select',function(_,item){  
  CurrentSymbol=pairs[item]
  actionChooser.focus()
})

var actionChooserItems=[
    'EXCHANGE: market-limit-buy',
    'EXCHANGE: market-limit-sell',
    'TRADING: market-limit-buy',
    'TRADING: market-limit-sell',
    'Back']
var actionChooser=blessed.list({
  top: currencyChooser.top + currencyChooser.height,
  keys:true,
  left:1,
  border:{
    type:'line'
  },
  width:35,
  height:actionChooserItems.length+2,
  tags:true,
  items: actionChooserItems,
  style: {
    focus:{
      border:{
        fg:'yellow',
      }
    },
    selected:{fg:'black',bg:'white'},  
    fg: 'white',
    bg: 'black',
    border: {
      fg: 'white'
    },
    hover: {
      bg: 'green'
    }
  }
})
screen.append(actionChooser)
actionChooser.on('select',function(_,item){  
  var action=actionChooserItems[item]
  if(action=='Back') {
    currencyChooser.focus()
  }
})

var publicTradesRatioBox = blessed.box({
    top:10,
    left:actionChooser.width+1,
    width: '100%-' + (35+35+3),
    height: 10,
    // content:'\n{center}Loading Bids and Asks{/center}',
    tags: true,
    border: {
      type: 'line'
    },
    style: {
      fg: 'white',
      bg: 'black',
      border: {
        fg: 'white'
      },
    },
});

var lastPlay
function playSound(){
  if(lastPlay && lastPlay+60*1000*0.5 > new Date().valueOf()) return
  lastPlay=new Date().valueOf();
  require('child_process').exec('"nircmd.exe" mediaplay 1500 c:\\windows\\media\\Ring01.wav',function(){})
}
setInterval(async function(){
  var content=''
  for(var i=0;i<pairs.length;i++) {
    var c=await bot.realtime.getPublicTradesRatio(pairs[i])  
    if(c>=95 || c<=5) {
      playSound()
    }
    content+=pairs[i] + ': %' + c + '\n'
  }
  publicTradesRatioBox.setContent(content)
},100)

screenBox.append(publicTradesRatioBox);

var positionBox = blessed.box({
    top:0,
    left:actionChooser.width+1,
    width: '100%-' + (35+35+3),
    height: 10,
    // content:'\n{center}Loading Bids and Asks{/center}',
    tags: true,
    border: {
      type: 'line'
    },
    style: {
      fg: 'white',
      bg: 'black',
      border: {
        fg: 'white'
      },
    },
});
setInterval(async function(){
  // positionBox.setContent('shalom')
  var positions=await bot.realtime.getPositions(CurrentSymbol)
  positionBox.setContent(JSON.stringify(positions))
},300)
screenBox.append(positionBox);

var walletsBox = blessed.box({
    top:actionChooser.top + actionChooser.height,
    left:0,
    width: actionChooser.width,
    height: 10,
    // content:'\n{center}Loading Bids and Asks{/center}',
    tags: true,
    data:[['','','']],
    border: {
      type: 'line'
    },
    style: {
      fg: 'white',
      bg: 'black',
      border: {
        fg: 'white'
      },
    },
});
setInterval(async function(){
  // walletsBox.setContent('shalom')
  var wallets=await bot.realtime.getWallets(CurrentSymbol)
  var table='Exchange:\n'
  for(var i=0;i<currencies.length;i++){
    table+=currencies[i] + ': ' + wallets['exchange'][currencies[i]].toFixed(2) + '\n'
  }
  table+='Margin:\n'
  for(var i=0;i<currencies.length;i++){
    table+=currencies[i] + ': ' + wallets['trading'][currencies[i]].toFixed(2) + '\n'
  }
  walletsBox.setContent(table)
},300)
screenBox.append(walletsBox);


var statusBar = blessed.box({
    bottom:'0',
    left:1,
    width: '100%-3',
    height: 1,
    // content:'\n{center}Loading Bids and Asks{/center}',
    tags: true,
    // border: {
    //   type: none
    // },
    style: {
      fg: 'white',
      bg: 'black',
      border: {
        fg: 'white'
      },
    },
});
screenBox.append(statusBar);


/* 
 * TICKER
 */
var ticker = blessed.box({
  top: 0,
  right: '0',
  width: 35,
  height: 4,
  content:'\n{center}Loading Bids and Asks{/center}',
  tags: true,
  header:'sdf',
  border: {
    type: 'line'
  },
  style: {
    fg: 'white',
    bg: 'black',
    border: {
      fg: 'white'
    },
    hover: {
      bg: 'green'
    }
  },
});
screenBox.append(ticker);

var heightBid,lowestAsk
setInterval(async function(){
  heightBid= await bot.realtime.getHighestBid(CurrentSymbol)
  lowestAsk= await bot.realtime.getLowestAsk(CurrentSymbol)
})
setInterval(async function(){
  var str='{center}{bold}Heightest Bid and Lowest Offer:{/bold}\n' +
  (heightBid) + ' <-> ' + 
  (lowestAsk) + 
  '{/center}\n\n{right}' + '{/right}'
  ticker.setContent(str)
  x=new Date()
  // moment().format('HH:mm:ss')
  var dateFormat=x.getDate() + '/' + x.getMonth() + ' ' + x.getHours() + ":" + x.getMinutes() + ":" + x.getSeconds()
  statusBar.setContent('{right}' + CurrentSymbol.toUpperCase()  + ' ' + (bot.realtime.connected ? "Online" : "Offline") + ' ' +  dateFormat  + '{/right}')
  screen.render()
},100)

 // If our box is clicked, change the content. 
ticker.on('click', function(data) {
  ticker.setContent('{center}Some different {yellow-fg}content{/yellow-fg}.{/center}');
  screen.render();
});
 
// If box is focused, handle `enter`/`return` and give us some more content. 
ticker.key('enter', function(ch, key) {
  ticker.setContent('{right}Even different {black-fg}content{/black-fg}.{/right}\n');
  ticker.setLine(1, 'bar');
  ticker.insertLine(1, 'foo');
  screen.render();
});
 

// Form
var formBox=blessed.form({
  parent:screenBox,
  left:actionChooser.width+1,
  top:publicTradesRatioBox.top + publicTradesRatioBox.height-1,
  // top:0,
  width:50,
  keys:true,
  shrink:true,
  height:10,
  border:'line',
  content:'hi',
  style:{
    focus:{
      bg:'red'
    }
  }
})
var amountBox=blessed.textbox({
  width:40,
  parent:formBox,
  name:'a',
  height:10,
  top:3,
  style:{
    focus:{
      bg:'red'
    }
  },
  height:3,
  name:'abc',
  border:'line',
})
var formButton=blessed.button({
  width:40,
  parent:formBox,
  height:10,
  keys:true,
  top:7,
  style:{
    focus:{
      bg:'red'
    }
  },
  bottom:0,
  height:3,
  name:'def',
  border:'line',
  content:'A Button'
})
// formBox.focus()
formBox.key(['escape'],function(){
  currencyChooser.focus()
  return false
})

formButton.on('press',function(){
  playSound()
})

// Quit on Escape, q, or Control-C. 
screen.key(['q', 'C-c'], function(ch, key) {
  return process.exit(0);
});
 
screen.render();

// formBox.focus()
amountBox.focus()
amountBox.readInput(function(){
  // console.log('final')
})
