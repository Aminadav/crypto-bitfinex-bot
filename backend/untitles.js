var cp=require('child_process');

bot_running_id='SkJnniuef'
var theBot=cp.fork('./bots-tmp/' + bot_running_id + '.js'
// ,{    stdio:'pipe'}
)
var theBot1=cp.fork('./bots-tmp/' + bot_running_id + '.js'
// ,{    stdio:'pipe'}
)