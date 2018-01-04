var sqlite=require('sqlite');

const dbPromise = sqlite.open('./db.sql');
module.exports={
    getBotIdByName:async function(name){
        var db=await dbPromise
        var bot=await db.get('select id from bots where name=?',[name]);
        return bot.id
    },
    getBot:async function(id){
        var db=await dbPromise
        var bot=await db.get('select * from bots where id=?',[id]);
        bot.variables=JSON.parse(bot.variables)
        return bot
    },
    getAllBots:async function(){
        var db=await dbPromise
        var bots=await db.all('select * from bots');
        var result={}
        for(var i=0;i<bots.length;i++){
            result[bots[i].name]=bots[i]
            result[bots[i].name].variables=JSON.parse(result[bots[i].name].variables)
        }
        return result
    },
    getRunningBot:async function(id){
        var db=await dbPromise
        return await db.get('select * from runningbots where id=?',id)
    },
    updateBot:async function({loop,name,source,variables,id}){
        var db=await dbPromise
        if(typeof variables=='object') {
            variables=JSON.stringify(variables)
        }
        if(name===undefined) name='unnamed'
        if(source===undefined) source=''
        if(variables===undefined) variables='{}'
        if(loop===undefined) loop=false
        await db.run('update bots set loop=?, name=?, source=?,variables=? where id=?',[loop,name,source,variables,id])
    },
    setDefaultValue:function({loop,name,source,variables}){

    },
    createBot:async function({loop,name,source,variables}){
        var db=await dbPromise
        if(typeof variables!='object') {
            variables=JSON.stringify(variables)
        }
        if(name===undefined) name='unnamed'
        if(source===undefined) source=''
        if(variables===undefined) variables='{}'
        if(loop===undefined) loop=false

        await db.run('insert into bots (loop,name,source,variables) values(?,?,?,?)',[loop,name,source,variables])
    },
}

async function test(){
    await module.exports.updateBot({name:'hi',id:1,source:'new-code'})
    console.log(await module.exports.getAllBots())
}
if(!module.parent){
    test()
}
