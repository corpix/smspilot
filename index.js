var https = require('http')
  , qs = require('querystring')
  , urlParser = require('url')

  , rest = require('restler')

  , fructose = require('fructose');

var smsPilot = function (opts){
  if(!opts)
    opts = {};

  var url = 'https://smspilot.ru/api.php'
    , responseParser = function(data, callback){
        if(data.match(/^(ERROR=.+)/)){
          this.statusCode = 500;
          data = new Error(data);
        } else if(data.match(/^SUCCESS/)) {
          if(data.match(/SMS\sSENT (\d+)\/(\d+)\n/)){
            var price = parseInt(RegExp.$1)
              , credits = parseInt(RegExp.$2)
              , messages = [];

            data = data.split('\n');
            data.shift();
            for(var i in data){
              if(data[i].match(/^(\d+)\,(\d+)\,(\d+)\,(\d+)$/)){
                messages.push({
                  id: parseInt(RegExp.$1),
                  phone: RegExp.$2,
                  zone: parseInt(RegExp.$3),
                  status: parseInt(RegExp.$4)
                });
              }
            }

            data = {
              price: price,
              credits: credits,
              messages: messages
            };
          }
        }

        callback(data);
      };

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

  this.sms = function(data, callback){
    if(Array.isArray(data.to)){
      data.to = data.to.join(',');
    }

    return send(data);
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

pilot.sms({
  to: '79165193353,79165555555',
  send: 'test test'
}).on('success', function(data){
  console.log('>>', data)
}).on('error', function(){
  console.log('error', arguments)
});

//module.exports = sms;
