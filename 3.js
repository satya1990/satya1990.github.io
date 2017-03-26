/*
pubnub.addListener({
    message: function(msg) { console.log("got a message",msg.message); }
});
pubnub.subscribe({channels:['chat']});
*/
document.addEventListener("DOMContentLoaded", function(event) {
    console.log("DOM fully loaded and parsed");

      var pubnub = new PubNub({ publishKey : 'pub-c-ed85f391-63f8-48ff-9150-ff4c0cb0ab57', subscribeKey : 'sub-c-f2f067ec-1051-11e7-ab7b-02ee2ddab7fe' });
      var uname = prompt("enter a chat user name","user-1");
      document.getElementById('userName').innerHTML = uname;

      function $(id) { return document.getElementById(id); }
      var box = $('box'), input = $('input'), channel = 'chat-1', name = $('userName');
      pubnub.addListener({
          message: function(obj) {
              box.innerHTML = '<B>'+obj.message['user']+ '</B> : ' + (''+obj.message['text']).replace( /[<>]/g, '' ) + '<br>' + box.innerHTML
              playSound(obj.message['speech']);
              console.log(obj.message['speech']);
          }});
      pubnub.subscribe({channels:['text-to-speech-chat']}); //array to channels to subscribe
      /*
      document.getElementById("input").addEventListener('keyup', function(e) {
          if ((e.keyCode || e.charCode) === 13) {
            pubnub.publish({
              channel : channel,
              message : { msg:input.value, user:uname },
              x : (input.value='')});
        }
      });
      */
});
function playSound(url) {
    url = "http://www.stephaniequinn.com/Music/Allegro%20from%20Duet%20in%20C%20Major.mp3"
    var a = new Audio(url);
    a.play();
}
