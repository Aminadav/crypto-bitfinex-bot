// @ts-check

// Base
var b=6538 
//Amount
var a=7 
// Interest
var i=0.008 
// Days
var d=0.2 
// Maker Fee
var m=0.0006
// Expected Revenue
var r=100

/*
    r=               = (n-b)*a - d*i*a - b*a*m - n*a*m
    -(n-b)*a + n*a*m = -r -d*i*a - b*a*m
    a*(b-n) + n*a*m  =
    ab-an + nam      =
    nam-an           =  -r -d*i*a - b*a*m - ab
    n(am-a)
    n                = (-r -d*i*a - b*a*m - a*b) / (a*m-a)
    
*/


var n=(-r -d*i*a - b*a*m - a*b) / (a*m-a)

console.log('Base:',b)
console.log('Amount:',a)
console.log('Intereset:',i)
console.log('Days:',d)
console.log('Maker Fee:',m)
console.log('Expected Revenue:',r)
console.log('Time to is:',n)