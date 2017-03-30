document.addEventListener("DOMContentLoaded", function(event) {
    console.log("DOM fully loaded and parsed");
    var uuid = prompt("enter a chat user name","user-1");

    var all_users =new Array(), subscribed_channels =new Array();
    var box = $('box'), input = $('input'), channel = 'chat-1', name = $('userName'), user_count = $('occupancy');
    var users = $('users_button'), channels = $('channels_button'), users_arr = $(display_users);

    var pubnub = new PubNub({ publishKey : 'pub-c-ed85f391-63f8-48ff-9150-ff4c0cb0ab57', 
      subscribeKey : 'sub-c-f2f067ec-1051-11e7-ab7b-02ee2ddab7fe',
      //secretekey: "sec-c-MDA5NTY4ZjYtMjhiZC00MGY5LThiOWMtNmU3Y2QwZjBmNzFi",
      uuid : uuid,
      logVerbosity: true,
    //  heartbeatInterval: 40, // the frequency of ping from client to server
    });
      //var uuid = pubnub.getUUID();
      document.getElementById('userName').innerHTML = "@ uuid: "+uuid;

      function $(id) { return document.getElementById(id); }

      pubnub.setState(
        {
          state: {
            isTyping: true,
        },
        channels: [channel]
      },
      function (status, response) {
        // handle status, response
        console.log("state status: "+status);
        }
      );
      users.addEventListener('click',updateUsers);
      channels.addEventListener('click',function(){
      //To get a list of "which channel(s) is this UUID on right now"
      pubnub.whereNow(
        {
          uuid: uuid
        },
        function (status, response) {
          subscribed_channels.length = 0; //resetting array
          // handle status, response
          for(var i in response.channels){
                subscribed_channels.push(response.channels[i]);
          }

          displayallChannels();
          console.log("whereNow handler Logs...");
        }
      );
    });

      pubnub.addListener({
          message: function(obj) {
              box.innerHTML = '<B>'+obj.message['user']+ '</B> : ' + (''+obj.message['msg']).replace( /[<>]/g, '' ) + '<br>' + box.innerHTML

          },
          presence: function(presenceEvent) {
          console.log(presenceEvent.action) // online status events
          console.log(presenceEvent.timestamp) // timestamp on the event is occurred
          console.log(presenceEvent.uuid) // uuid of the user
          console.log(presenceEvent.occupancy) // current number of users online
          if(presenceEvent.action === 'state-change') {
           if(presenceEvent.state.isTyping === true) {
              console.log(' is typing......');
               box.innerHTML = '<B>'+presenceEvent.uuid + '</B> : typing...';
           }
          }
          updateUsers();
          user_count.innerHTML = presenceEvent.occupancy;
          },
        });

      pubnub.subscribe({
        channels:[channel,'chat-2',channel+'-pnpres'], //array to channels to subscribe
        withPresence: true,
        presence: function(m) {
          console.log("wrting from presence");
          console.log(m);
        },
        callback: function(m) {
          console.log(m);
        },
      });

      document.getElementById("input").addEventListener('keyup', function(e) {
          if ((e.keyCode || e.charCode) === 13) {
            pubnub.publish({
              channel : channel,
              message : { msg:input.value, user:uuid },
              x : (input.value='')});
        }
      });

      function updateUsers(){
        //To get a list of "who is here now" for a given channel,
        pubnub.hereNow(
          {
            includeUUIDs: true,
            includeState: true,
            channels: [channel],
          },
          function (status, response) {
            // handle status, response
            //response.channels['chat-1'].occupants[0].uuid
            all_users.length = 0; //resetting array
            for(var ch in response.channels){
                for(var i in response.channels[ch].occupants){
                    all_users.push(response.channels[ch].occupants[i].uuid);
                }
              displayallUsers();
            }
            console.log("hereNow handler Logs...");
          }
        );
      }

      function displayallUsers(){
        var users_div= document.getElementById("display_users");
        users_div.style.visibility='visible';
        users_div.innerHTML = '';
        /*
        while(users_div.firstChild){
          users_div.removeChild(users_div.firstChild);
        }
        */
        for(i in all_users){
        var item = document.createElement("li");
        item.innerHTML = all_users[i];
        users_div.appendChild(item);
        }
        user_count.innerHTML = all_users.length;
      }
      function displayallChannels(){
        var channels_div = document.getElementById("display_channels");
        channels_div.style.visibility = 'visible';
        channels_div.innerHTML = '';
        for(i in subscribed_channels){
        var item = document.createElement("li");
        item.innerHTML = subscribed_channels[i];
        channels_div.appendChild(item);
        }
      }

});
