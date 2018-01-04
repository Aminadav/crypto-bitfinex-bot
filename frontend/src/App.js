import React, { Component } from 'react';
import logo from './logo.svg';
import $ from 'jquery'
import _ from 'lodash'
import socketio from 'socket.io-client'

// Load modules
import "./App.css"

var server='http://localhost:80/api'
var io_server='http://localhost'

var symbolsPromise=$.ajax({
  url:server +'/symbols'
})
class CurrencyChooser extends Component {
  constructor(props){
    super(props)
    this.state={}
    this.state.value=props.value
    this.state.currencies=[
      "BTC",
      "USD",
      "LTC",
      "ETH",
      "ETC",
      "BCH",
    ]
  }
  changeValue=(event)=>{
    var index=event.target.value
    this.setState({value:index})
    var value=this.state.currencies[parseInt(index)]
    if(this.props.onChange){
      this.props.onChange({target:{value}})
    }
  }
  render=()=>{
    var optionsJSX=[]
    optionsJSX=_.map(this.state.currencies,(Currency,key)=>{
      return <option value={key} key={key}>{Currency}</option>
    })
    return (
      <select value={this.state.value} onChange={this.changeValue}>
        <option>Choose a Currency</option>
        {optionsJSX}
      </select>
    )
  }
}
class SideChooser extends Component {
  constructor(props){
    super(props)
    this.state={}
    this.state.value=props.value
    this.state.sides=[
      "buy",
      "sell",
    ]
  }
  changeValue=(event)=>{
    var index=event.target.value
    this.setState({value:index})
    var value=this.state.sides[parseInt(index)]
    if(this.props.onChange){
      this.props.onChange({target:{value}})
    }
  }
  render=()=>{
    if(!this.state.sides) return null
    
    var optionsJSX=[]
    optionsJSX=_.map(this.state.sides,(side,key)=>{
      return <option value={key} key={key}>{side}</option>
    })
    return (
      <select value={this.state.value} onChange={this.changeValue}>
        <option>Choose a side</option>
        {optionsJSX}
      </select>
    )
  }
}
class WalletChooser extends Component {
  constructor(props){
    super(props)
    this.state={}
    this.state.value=props.value
    this.state.wallets=[
      "exchange",
      "margin",
    ]
  }
  changeValue=(event)=>{
    var index=event.target.value
    this.setState({value:index})
    var value=this.state.wallets[parseInt(index)]
    if(this.props.onChange){
      this.props.onChange({target:{value}})
    }
  }
  render=()=>{
    if(!this.state.wallets) return null
    
    var optionsJSX=[]
    optionsJSX=_.map(this.state.wallets,(wallet,key)=>{
      return <option value={key} key={key}>{wallet}</option>
    })
    return (
      <select value={this.state.value} onChange={this.changeValue}>
        <option>Choose a Wallet</option>
        {optionsJSX}
      </select>
    )
  }
}
class SymbolChooser extends Component {
  constructor(props){
    super(props)
    this.state={}
    setTimeout(()=>{
      this.state.value=props.value
      symbolsPromise.then(symbols=>{
        this.setState({symbols})
      })
    })
  }
  changeValue=(event)=>{
    var index=event.target.value
    this.setState({value:index})
    var value=this.state.symbols[parseInt(index)]
    if(this.props.onChange){
      this.props.onChange({target:{value}})
    }
  }
  render=()=>{
    if(!this.state.symbols) return null
    
    var optionsJSX=[]
    optionsJSX=_.map(this.state.symbols,(symbol,key)=>{
      return <option value={key} key={key}>{symbol.pair}</option>
    })
    return (
      <select value={this.state.value} onChange={this.changeValue}>
        <option>Choose a Symbol</option>
        {optionsJSX}
      </select>
    )
  }
}

class App extends Component {
  ioConnect=()=>{
    this.io=socketio(io_server)
    this.io.on('connect',()=>{
      this.log('websocket connected')
    })
    this.io.on('disconnect',()=>{
      this.log('websocket disconnected')
    })
    this.io.on('running-bots',data=>{
      console.log('running-bots',data)
      this.setState({
        runningBots:data
      })
    })
    this.io.on('logger',(text)=>{
      this.log(text)
    })
  }
  constructor(props){
    super(props)
    document.body.addEventListener('keyup',event=>{
      if(event.keyCode==13 && event.ctrlKey) {
        this.startCurrentBot()
      }
    })
    this.state={}
    // When complete the constructor, connect
    setTimeout(this.ioConnect())
    this.clickRefreshBots()
    this.clickRefreshAccounts()    
  }
  changeBot=(e)=>{
    this.setState({
      currentBot:this.state.bots[e.target.value],
      currentVariables:this.state.currentVariables || {}
    })
  }
  clickRefreshAccounts=()=>{
    $.ajax({
      url:server + '/accounts'
    }).then(accounts=>{
      this.setState({accounts})
    })
  }
  clickRefreshBots=()=>{
    $.ajax({
      url:server + '/bots'
    }).then(bots=>{
      this.setState({bots})
    })
  }
  changeAccount=(e)=>{
    this.setState({
      currentAccount:e.target.value,
      account:null,
      key:null,
      secret:null
    })
    if(e.target.value){
      this.setState({
       key:this.state.accounts[e.target.value].key,
       secret:this.state.accounts[e.target.value].secret,
       account:e.target.value
      })
    }
  }
  changeVariable=(key,event)=>{
    var currentVariables=JSON.parse(JSON.stringify(this.state.currentVariables))
    currentVariables[key]=event.target.value
    this.setState({
      currentVariables
    })
  } 
  changeSource=(event)=>{
    this.setState({
      currentBot: _.extend({},this.state.currentBot,{sourceDraft:event.target.value})
    })
  }
  changeLoop=(event)=>{
    this.setState({
      currentBot: _.extend({},this.state.currentBot,{loop:event.target.value})
    })
  }
  clickCancelSource=(event)=>{
    this.setState({
      currentBot: _.extend({},this.state.currentBot,{sourceDraft:null})
    })
  }
  clickSaveBot=()=>{
    var self=this
    return $.ajax({
      url:server + '/bots',
      method:'post',
      headers:{'content-type':'application/json'},
      data:JSON.stringify({
        name: self.state.currentBot.name,
        source: self.state.currentBot.sourceDraft || self.state.currentBot.source,
        loop: self.state.currentBot.loop =="true",
        variables: self.state.currentBot.variables,
        id: self.state.currentBot.id
      })
    }).then(()=>{      
      this.clickRefreshBots()
      // self.setState({
      //   currentBot: _.extend(
      //     {},
      //     self.state.currentBot,
      //     {
      //       sourceDraft:null,
      //       source:self.state.currentBot.sourceDraft || self.state.currentBot.source
      //     }
      //   )
      // })
    })
  }
  clickAddVariable=async ()=>{
    var name=prompt('Variable name:')
    var type=prompt('Variable type: (string/side/number/currency/symbol/wallet)')
    var currentBot=JSON.parse(JSON.stringify(this.state.currentBot))
    currentBot.variables[name]=type
    this.setState({currentBot})
    setTimeout(async ()=>{
      this.clickSaveBot()
    },100)
  }
  clickRemoveVariable=async (variableName)=>{
    // if(!confirm('are you sure')) return
    var currentBot=JSON.parse(JSON.stringify(this.state.currentBot))
    delete currentBot.variables[variableName]
    this.setState({currentBot})
    setTimeout(async ()=>{
      this.clickSaveBot();
    },100)
  }
  startCurrentBot=async ()=>{
    // if(this.state.currentBot.sourceDraft) {
      await this.clickSaveBot()
    // }
    var self=this
    $.ajax({
      url:server + '/start_bot',
      method:'post',
      headers:{'content-type':'application/json'},
      data:JSON.stringify({
        key: self.state.key,
        secret:self.state.secret,
        account:self.state.account,
        variables:self.state.currentVariables,
        id:self.state.currentBot.id
      })
    })
  }
  clickBotStop=(bot)=>{
    $.ajax({
      url:server + '/stop_bot',
      method:'post',
      headers:{'content-type':'application/json'},
      data:JSON.stringify({
        bot
      })
    })
  }
  clickRenameBot=async ()=>{
    var currentBot=JSON.parse(JSON.stringify(this.state.currentBot))
    // var oldName=currentBot.name
    // var newName=prompt('Enter new name',this.state.currentBot.name)
    currentBot.name=prompt('Enter new name',this.state.currentBot.name)
    this.setState({currentBot})
    setTimeout(async ()=>{
      await this.clickSaveBot()
      await this.clickRefreshBots()
    },100)
  }
  clickCreateBot=async ()=>{
    await $.ajax({
      url:server + '/create_bot',
      method:'post',
      headers:{'content-type':'application/json'},
      data:JSON.stringify({name:prompt('choose new name')})
    })
    await this.clickRefreshBots()
  }
  log=(text)=> {
    if(!text.match(/[\r\n]$/)) text+='\n'
    this.setState({
      logs: this.state.logs ? this.state.logs + text : text
    })
    setTimeout(()=>{
      this.refs.logger.scrollTop=10000000
    },0)
  }
  render=()=> {
    var accountsJSX=[], botsJSX=[], botVariablesJSX=[]
    var runningBotsJSX=[]
    if(this.state.accounts){
        _.each(this.state.accounts,(i,k)=>{
          accountsJSX.push(<option key={k} value={k}>{k}</option>)
        })
    }
    if(this.state.bots){
        _.each(this.state.bots,(i,k)=>{
          botsJSX.push(<option key={k} value={k}>{k}</option>)
        })
    }
    if(this.state.runningBots){
      _.each(this.state.runningBots,(i,k)=>{
        runningBotsJSX.push(
          <tr key={k} style={{cursor:"pointer"}}>
            <td>
              [{k}
            </td>
            <td>
              {i.created}
            </td>
            <td>
               {i.account}
            </td>
            <td>
              {i.name}
            </td>
            <td>
              <button style={{visibility:i.running ? 'visible':'hidden'}} onClick={this.clickBotStop.bind(this,k)}>Stop</button>
            </td>
          </tr>
        )
      })
      runningBotsJSX.reverse()
    }
    if(this.state.currentBot){
        _.each(this.state.currentBot.variables,(i,k)=>{
          var Chooser;
          if(i=='symbol') {
            Chooser=<SymbolChooser onChange={this.changeVariable.bind(this,k)}/>
          } else if(i=='wallet') {
              Chooser=<WalletChooser onChange={this.changeVariable.bind(this,k)}/>
          } else if(i=='side') {
              Chooser=<SideChooser onChange={this.changeVariable.bind(this,k)}/>
          } else if(i=='currency') {
              Chooser=<CurrencyChooser onChange={this.changeVariable.bind(this,k)}/>
          } else if(i=='number') {
              Chooser=<input type="number" onChange={this.changeVariable.bind(this,k)}/>
          } else {
            Chooser=<input onChange={this.changeVariable.bind(this,k)}/>
          }
          botVariablesJSX.push(
            <div key={k}>
              <b>{k}:</b> 
              {Chooser}
              &nbsp; <button className="secondary" tabindex="-1" onClick={this.clickRemoveVariable.bind(this,k)}>Remove Variable</button>
            </div>
          )
        })
    }
    if(this.state.currentBot){
    }
    return (
      <div>
        <div className="running-bots">
          <table width="100%">
            {runningBotsJSX}
          </table>
        </div>
        <b>Accounts:</b>        
        <select onChange={this.changeAccount}>
          <option value="">Choose Account</option>
          {accountsJSX}
        </select>
        &nbsp;<button className="secondary" tabindex="-1" onClick={this.clickRefreshAccounts}>Refresh</button>
        {this.state.account &&(<div>
            <b>Bots:</b>
            <select value="" onChange={this.changeBot} value={this.currentBot}>
            <option>Choose a bot</option>
            {botsJSX}
            </select>
            &nbsp;<button className="secondary" tabindex="-1" onClick={this.clickRefreshBots}>Refresh</button>
            &nbsp;<button className="secondary" tabindex="-1" onClick={this.clickRenameBot}>Rename Bot</button>
            &nbsp;<button className="secondary" tabindex="-1" onClick={this.clickCreateBot}>Create Bot</button>
            {this.state.currentBot && (
              <div>
                <b>Variables</b>
                {botVariablesJSX}
                <button className="secondary" tabindex="-1" onClick={this.clickAddVariable} tabindex="-1">Add Variable</button>
                <br/>
                <br/>
                <select onChange={this.changeLoop} value={this.state.currentBot.loop}>
                  <option value={false}>Run Once</option>
                  <option value={true}>Run in a Loop</option>
                </select>
                <br/>
                <br/>
                <button onClick={this.startCurrentBot}>
                  {this.state.currentBot.sourceDraft ? "SAVE & START" : "START"}
                </button>
                <br />
                <textarea onChange={this.changeSource}  value={this.state.currentBot.sourceDraft || this.state.currentBot.source}>
                </textarea>
                <br/>
                <br/>
                <button className="secondary" onClick={this.clickSaveBot}>SAVE</button>
                {this.state.currentBot.sourceDraft && <button className="secondary" onClick={this.clickCancelSource}>CANCEL</button>}
              </div>
            )}
        </div>)}
        <div ref="logger" className="logger">
          {this.state.logs}
        </div>        
      </div>
    );
  }
}

export default App;
