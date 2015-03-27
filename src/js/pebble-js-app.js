var VERSION = "1.0";

var isReady = false;
var callbacks = []; //stack for callbacks
var options ;  

function readyCallback(event) {
  isReady = true;
  var callback;
  options = getOptions();
  while (callbacks.length > 0) { //if callbacks on stack, process them
    callback = callbacks.shift();
    callback(event);
  }
}

function showConfiguration(event) {
  onReady(function() {
    console.log("showConfiguration");
    var opts = getOptions(); //load from localStorage
    var url  = "http://zb42.de/pebble/enigmavu/configure.html";
    //var url = "http://192.168.2.54/roemke/pebble/enigmavu/configure.html";
    Pebble.openURL(url + "#v=" + encodeURIComponent(VERSION) + "&options=" + encodeURIComponent(opts));
  });
}

//response from configure.html
function webviewclosed(event) {
  var resp = event.response;
  //console.log('configuration response: '+ resp + ' ('+ typeof resp +')');
  options = JSON.parse(resp); //store it in global object 
  if (typeof options.ip === 'undefined')
  {
    return;
  }

  onReady(function() {
    setOptions(resp); //store in local Storage 
  });
}

// Retrieves stored configuration from localStorage.
function getOptions() {
  return localStorage.getItem("options") || ("{}");
}

// Stores options in localStorage.
function setOptions(options) {
  localStorage.setItem("options", options);
}



// build an on stack for callback. 
//work is started if onReady event from watch set isReady to true
function onReady(callback) {
  if (isReady) {
    callback();
  }
  else {
    callbacks.push(callback);
  }
}

//we need three Listeners
Pebble.addEventListener("ready", readyCallback); //called when app is loaded on watch
Pebble.addEventListener("showConfiguration", showConfiguration);
Pebble.addEventListener("webviewclosed", webviewclosed);
//and one for message send from pebble
//ack is send by pebble js, we don't have to care for it 
Pebble.addEventListener('appmessage',
  function(e) { //handle keys send from pebble, hard coded in c-file and appinfo.json
      var payload = e.payload;
      if (payload)
      {
         //console.log(JSON.stringify(payload));
         if (payload.KEY_CONTROL)   
         { 
         	if (options.ip)
         	{
	            var commandKey = payload.KEY_CONTROL;
	            var req = new XMLHttpRequest();
	            req.open('GET', 'http://' + options.ip + '/web/remotecontrol?command='+commandKey, true); //true async
	            req.onload = function(e) {//onload should always have state 4 ?
	               if (req.readyState == 4 && req.status == 200) {
	                 clearTimeout(xmlHttpTimeout); 
	                  if(req.status == 200) {
	                     var response = req.responseText;
	                     //console.log("It seems we have success with " + response);
	                     } //else { console.log('Error'); }
	                  } //status 200 
	                  else
	                  {
	                    console.log("complete, but not ok - strange");
	                  }
	            };//onload
	            req.send(null);
	            // Timeout to abort in 5 seconds, property of XMLHttpRequest seems not to be supported
	            var xmlHttpTimeout=setTimeout( 
	               function (){
	                 req.abort();
	                 //console.log("Request for vu+ timed out");
	               },5000);
	        }//eo options.ip found
	        else
	          Pebble.showSimpleNotificationOnPebble("Error", "Configuration of ip needed");
         } //payload has key_control         
      }//eof if payload
  } //eof event listener
);
        

onReady(function(event) {
  //var message = prepareConfiguration(getOptions());
  //transmitConfiguration(message); don't commit setting after loading js app
});

