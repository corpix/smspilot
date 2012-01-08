var https = require('http')
  , qs = require('querystring')
  , urlParser = require('url')

  , rest = require('restler')

  , fructose = require('fructose');



//
//
//

var smsPilot = function (opts){
  if(!opts)
    opts = {};

  var url = 'https://smspilot.ru/api.php';

  //
  //
  //

  var self = this
    , responseParser = function(data, callback){
    if(data.match(/^(ERROR=.+)/)){
      this.statusCode = 500;
      data = new Error(data);
    } else if(data.match(/^SUCCESS/)) {

      if(data.match(/SMS\sSENT (\d+)\/(\d+)\n/)){ // sms
        var price = parseInt(RegExp.$1)
          , credits = parseInt(RegExp.$2)
          , messages = [];

        data = data.split('\n');
        data.shift();

        var getStatus = function(){ // get status from messages array
          return self.status(this.id);
        }

        for(var i in data){
          if(data[i].match(/^(\d+)\,(\d+)\,(\d+)\,(\d+)$/)){
            messages.push({
              id: parseInt(RegExp.$1),
              phone: RegExp.$2,
              zone: parseInt(RegExp.$3),
              status: parseInt(RegExp.$4),
              getStatus: getStatus
            });
          }
        }

        data = {
          price: price,
          credits: credits,
          messages: messages
        };

      }
    } else {
      if(data.match(/^(\d+)$/)){ // balance

        data = parseInt(RegExp.$1);

      } else { // status

        data = data.split('\n');
        var statuses = [];
        for(var i in data){
          if(data[i].match(/(\d+),(\d+),(\d+),(-?\d+)/)){
            statuses.push({
              id: RegExp.$1,
              phone: RegExp.$2,
              zone: RegExp.$3,
              status: RegExp.$4
            });
          }
        }

        if(statuses.length == 1){
          data = statuses[0];
        } else {
          data = statuses;
        }

      }
    }

    callback(data);
  }

  if(opts.ssl === false)
    url = url.replace(/^https/, 'http');

  var send = function(data){
    data.apikey = settings.apikey;
    if(!data.from)
      data.from = settings.from;

    return rest[opts.method || 'post'](url, { parser: responseParser, data: data });
  }


  settings = {};
  this.set = function(name, value){
    if(typeof name == 'object' && !value){
      settings = name;
      return this;
    }
    if(value){
      settings[name] = value;
      return this;
    } else {
      return settings[name];
    }
  }

  this.sms = function(data){
    if(Array.isArray(data.to))
      data.to = data.to.join(',');

    return send(data);
  }

  this.status = function(id){
    if(Array.isArray(id))
      id = id.join(',');

    return send({ check: id });
  }

  this.balance = function(){
    return send({ balance: 'sms' });
  }

  return this;
}


//
//
//


var pilot = new smsPilot();
pilot
  .set('apikey', 'XXXXXXXXXXXXYYYYYYYYYYYYZZZZZZZZXXXXXXXXXXXXYYYYYYYYYYYYZZZZZZZZ')
  .set('from', 'test');
pilot.balance().on('success', function(data){
  console.log(data)
})

pilot.status([ 10000, 10001 ]).on('success', function(data){
  console.log(data)
})

pilot.sms({
  to: '79165193353,79165555555',
  send: 'test test'
}).on('success', function(data){
  data.messages[0].getStatus().on('success', function(data){
    console.log('from messages array', data)
  })
  console.log('>>', data)
}).on('error', function(){
  console.log('error', arguments)
});

//module.exports = sms;
