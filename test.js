var smsPilot = require('./index.js');

var pilot = new smsPilot();
pilot
  .set('apikey', 'XXXXXXXXXXXXYYYYYYYYYYYYZZZZZZZZXXXXXXXXXXXXYYYYYYYYYYYYZZZZZZZZ')
  .set('from', 'test');



setTimeout(function(){

  pilot.balance().on('success', function(data){
    console.log('Баланс:', data);
  });

}, 1000);



setTimeout(function(){

  pilot.status([ 10000, 10001 ]).on('success', function(data){
    console.log('Статусы:', data);
  });

}, 3000);


setTimeout(function(){
  pilot.sms({
    to: '79161111111,79165555555',
    send: 'test'
  }).on('success', function(data){

    setTimeout(function(){
      var messages = data.messages;
      messages[0].getStatus().on('success', function(data){
        console.log('Статус для сообщения', messages[0], ' ->> ', data);
      });
    }, 2000);

    console.log('Отправлено:', data);
  }).on('error', function(err){
    console.log('Ошибка:', err)
  });
}, 5000);

