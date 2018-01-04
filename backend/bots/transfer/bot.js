await console.log('before')
console.log(wallets[variables.walletfrom][variables.currency])
var result=await transfer({
amount: variables.amount,
currency: variables.currency,
walletfrom: variables.walletfrom,
walletto: variables.walletto
})
console.log(result)
console.log('after')