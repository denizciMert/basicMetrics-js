//Debounce
function debounce(func, wait) {
  let timeout;
  return function() {
    const context = this, args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
}

//Throttle
function throttle(func, limit) {
  let lastFunc;
  let lastRan;
  return function() {
    const context = this;
    const args = arguments;
    if (!lastRan) {
      func.apply(context, args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(function() {
        if ((Date.now() - lastRan) >= limit) {
          func.apply(context, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  }
}

//Page Logger
function eventLogger(eventMessage) {
  const log = document.getElementById("eventLog");
  const time = new Date().toLocaleTimeString();
  log.innerHTML += `<p>${eventMessage}</p>`;
}

//Device Info
const deviceInfo= `${window.screen.width}, ${window.screen.height}, ${navigator.userAgent}, ${navigator.language}`;

//Custom API
function apiEvent(eventItem, eventMessage) {
  fetch(`http://localhost:3000/api/events`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ eventType: eventMessage ,data: eventItem, deviceInfo: deviceInfo }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Network response was not ok for POST.`);
      }
      return response.json();
    })
    .then((data) => {
      console.log(`${eventMessage}:`, data);
      return fetch(`http://localhost:3000/api/eventLogs`);
    })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Network response was not ok for GET.`);
      }
      return response.text();
    })
    .then((data) => {
      const dataLogs = data.split("\n");
      const lastLog = dataLogs.filter(Boolean).pop();
      eventLogger(`LOG: ${lastLog}`);
    })
    .catch((error) => {
      console.error(`Error recording ${eventMessage}:`, error);
    });
}

//Timers
let focusTime = Date.now();
let blurTime;
let blurTimeAll = 0;

//Focused
window.addEventListener("focus", function () {
  focusTime = Date.now()
  if(blurTime){
    blurTime = Date.now() - blurTime;
    blurTimeAll += blurTime;
  }
  let eventItem = `Window Focused -- Was Deactive: ${blurTime/1000} s`;
  let eventMessage = "Window Action";
  apiEvent(eventItem,eventMessage);
});

//Blurred
window.addEventListener("blur", function () {
  blurTime = Date.now();
  if(focusTime){
    focusTime = Date.now() - focusTime;
  }
  let eventItem = `Window Blurred -- Was Active: ${focusTime/1000} s`;
  let eventMessage = "Window Action";
  apiEvent(eventItem,eventMessage);
});

//Clicked Element and Click Count
let clickCount = 0;
document.addEventListener("click", function (e) {
  clickCount++;
  let EeventItem = `Click Count: ${clickCount}, Target Tag: ${e.target.tagName}, Target Class: ${e.target.className}, Target ID: ${e.target.id}`;
  let EeventMessage = "Click Action";
  apiEvent(EeventItem,EeventMessage);
});

//Spent Time
let pageEntryTime = Date.now();
window.addEventListener("beforeunload", function () {
  let pageExitTime = Date.now();
  let page = window.location.pathname
  let eventItem = `Spent Time: ${(pageExitTime - pageEntryTime) / 1000} s on ${page}-- Active Time: ${((pageExitTime - pageEntryTime)-blurTimeAll)/1000} s -- Deactive Time: ${blurTimeAll/1000} s`;
  let eventMessage = "Page Action";
  apiEvent(eventItem,eventMessage);
});

//Page View
document.addEventListener("DOMContentLoaded", function () {
  let loadTime = performance.getEntriesByType("navigation")[0].duration;
  let eventItem = `Page: ${window.location.pathname} -- Load Time: ${loadTime}`;
  let eventMessage = "Page Action";
  apiEvent(eventItem,eventMessage);
});

//Scroll
const scroll = debounce(function() {
  let scrollPosition = window.scrollY || document.documentElement.scrollTop;
  let totalHeight = document.documentElement.scrollHeight - window.innerHeight;
  let scrollPercentage = (scrollPosition / totalHeight) * 100;
  let eventItem = `%${scrollPercentage.toFixed(2)}`;
  let eventMessage = "Scroll Action";
  apiEvent(eventItem,eventMessage);
},2000);
window.addEventListener("scroll", scroll)

//Mouse Out
const mouseout = debounce(function(e) {
  let eventMessage= "Mouse Action";
  if (!e.toElement && !e.relatedTarget) {
    let eventItem= "Mouse Out";
    apiEvent(eventItem, eventMessage);
  }/*else{
    let eventItem= "Mouse Moved";
    apiEvent(eventItem, eventMessage);
  }*/
},2000);
document.addEventListener("mouseout", mouseout);

//Search Query
const searchForm = document.querySelector('#searchForm');
searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const searchTerm = document.querySelector('#searchInput').value;
  let eventItem =`Input: ${searchTerm}`;
  let eventMessage="Search Query";
  apiEvent(eventItem, eventMessage);
});

//Form
const input = debounce(function(e){
  const formField = e.target.id;
  const formValue = e.target.value;
  let eventItem=`Field: ${formField} -- Input: ${formValue}`;
  let eventMessage="Form Action";
  apiEvent(eventItem, eventMessage);
},2000)
document.addEventListener('input', input);

//Error
window.addEventListener('error', function(event) {
  apiEvent( `Info: ${event.message} at ${event.filename}:${event.lineno}:${event.colno}`, "Error" );
});


//YT API
var tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var player;
function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    height: '200',
    width: '328',
    videoId: 'Q8TXgCzxEnw',
    playerVars: {
      'playsinline': 1
    },
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  });
}

function onPlayerReady(event) {
  
}

//Player
function onPlayerStateChange(event) {
  let eventMessage = "Player Action";
  if (event.data == YT.PlayerState.PLAYING) {
    let eventItem = `Video Played`;
    apiEvent(eventItem, eventMessage);
  } else if (event.data == YT.PlayerState.PAUSED) {
    let eventItem = `Video Paused`;
    apiEvent(eventItem, eventMessage);
  }
}

function stopVideo() {
  player.stopVideo();
}