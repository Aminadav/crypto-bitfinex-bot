console.log('a')
setInterval(function(){
    console.log('out')
},1000)
vm.runInNewContext('setInterval(function(){console.log(123)},1000)',{setInterval,console})
console.log('b')