let loggedInUsername = "";
var selectedChat = "general";
let keys = "";

class Event {
  constructor(type, payload) {
    this.type = type;
    this.payload = payload;
  }
}

class SendMessageEvent {
  constructor(message, from) {
    this.message = message;
    this.from = from;
  }
}

class ReceiveMessageEvent {
  constructor(message, from, sent) {
    this.message = message;
    this.from = from;
    this.sent = sent;
  }
}

class ChangeChatRoomEvent {
  constructor(name, from) {
    this.name = name;
    this.from = from;
  }
}

function showCustomAlert() {
  const modal = document.getElementById("customAlert");
  modal.style.display = "block";
}

function closeCustomAlert() {
  const modal = document.getElementById("customAlert");
  modal.style.display = "none";
}

function closeWindow() {
  const modal = document.getElementById("window");
  modal.style.display = "none";
}
function openWindow() {
  const modal = document.getElementById("window");
  modal.style.display = "block";
}

function routeEvent(event) {
  if (event.type === undefined) {
    alert("no type field in the event");
  }
  switch (event.type) {
    case "receive_message":
      const messageEvent = Object.assign(
        new ReceiveMessageEvent(),
        event.payload
      );
      appendChatMessage(messageEvent);
      break;
    default:
      alert("unsupported event type");
      break;
  }
}

async function appendChatMessage(messageEvent) {
  const objectKey = window.location.hash.slice("#key=".length);
  const key = await window.crypto.subtle.importKey(
    "jwk",
    {
      k: objectKey,
      alg: "A128GCM",
      ext: true,
      key_ops: ["encrypt", "decrypt"],
      kty: "oct",
    },
    { name: "AES-GCM", length: 128 },
    false, // extractable
    ["decrypt"]
  );
  const originalBuffer = base64ToArrayBuffer(messageEvent.message);
  const decrypted = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv: new Uint8Array(12) },
    key,
    originalBuffer
  );
  const decoded = new window.TextDecoder().decode(new Uint8Array(decrypted));
  const content = JSON.parse(decoded);

  var date = new Date(messageEvent.sent);
  const formattedMsg = `${date.toLocaleTimeString()} - ${
    messageEvent.from
  }: ${content}`;
  textarea = document.getElementById("chatmessages");
  textarea.innerHTML = textarea.innerHTML + "\n" + formattedMsg;
  textarea.scrollTop = textarea.scrollHeight;
}

function appendChatJoin(messageEvent) {
  const formattedMsg = `${messageEvent.from}: ${
    messageEvent.message
  }`;
  textarea = document.getElementById("chatmessages");
  textarea.innerHTML = textarea.innerHTML + "\n" + formattedMsg;
  textarea.scrollTop = textarea.scrollHeight;
}

async function changeChatRoom(event) {
  event.preventDefault();
  if (loggedInUsername == "") {
    alert("Must select a username");
    return false;
  }
  const username = document.getElementById("username").value;
  const uuid = generateUUID();
  let changeEvent = new ChangeChatRoomEvent(uuid, username);
  sendEvent("change_room", changeEvent);

  header = document.getElementById("chat-header").innerHTML =
    "Currently in chatroom: " + uuid;
  textarea = document.getElementById("chatmessages");
  textarea.innerHTML = `You changed room into: ${uuid}`;

  const key = await createKey();
  keys = key.key;
  history.pushState(null, null, `/?room=${uuid}#key=${key.objectKey}`);

  selectedChat = uuid;
  return false;
}

async function joinChatRoom() {
  event.preventDefault();
  const newchat = document.getElementById("join").value;
  if (loggedInUsername == "") {
    alert("Must select a username");
    return false;
  }
  if (newchat == "") {
    alert("Must add a chat ID");
    return false;
  }
  if (newchat != null) {
    selectedChat = newchat;
    header = document.getElementById("chat-header").innerHTML =
      "Currently in chatroom: " + selectedChat;

    let changeEvent = new ChangeChatRoomEvent(selectedChat, loggedInUsername);
    sendEvent("change_room", changeEvent);

    textarea = document.getElementById("chatmessages");
    textarea.innerHTML = `You changed room into: ${selectedChat}`;

    try {
      const message = "has just joined the chat";
      const string = await encryptData(message);

      let joinEvent = new SendMessageEvent(string, loggedInUsername);
      sendEvent("send_message", joinEvent);
    } catch (error) {
      if (
        error.message.includes(
          'The JWK "k" member did not include the right length'
        )
      ) {
        alert(
          "The provided key is of incorrect length. Please provide a valid key to receive messages from others."
        );
      } else {
        alert("An error occurred: " + error.message);
      }
    }
  }
  return false;
}

async function guestJoinChat(ID) {
  event.preventDefault();
  if (loggedInUsername == "") {
    alert("Must select a username");
    return false;
  }
  header = document.getElementById("chat-header").innerHTML =
    "Currently in chatroom: " + ID;

  let changeEvent = new ChangeChatRoomEvent(ID, loggedInUsername);
  sendEvent("change_room", changeEvent);

  textarea = document.getElementById("chatmessages");
  textarea.innerHTML = `You are in room: ${ID}`;

  const messageEvent = {
    message: "has just joined the chat",
  };
  const string = await encryptData(messageEvent.message);

  let joinEvent = new SendMessageEvent(string, loggedInUsername);
  sendEvent("send_message", joinEvent);
  return false;
}
async function encryptData(message) {
  const objectKey = window.location.hash.slice("#key=".length);
  const key = await window.crypto.subtle.importKey(
    "jwk",
    {
      k: objectKey,
      alg: "A128GCM",
      ext: true,
      key_ops: ["encrypt", "decrypt"],
      kty: "oct",
    },
    { name: "AES-GCM", length: 128 },
    false, // extractable
    ["encrypt", "decrypt"]
  );

  const encrypted = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv: new Uint8Array(12) /* don't reuse key! */ },
    key,
    new TextEncoder().encode(JSON.stringify(message))
  );
  return (string = arrayBufferToBase64(encrypted));
}

async function sendMessage() {
  event.preventDefault();
  var newmessage = document.getElementById("message");
  if (loggedInUsername == "") {
    alert("Must select a username");
    return false;
  }
  if (newmessage != null) {
    try {
      const objectKey = window.location.hash.slice("#key=".length);
      const key = await window.crypto.subtle.importKey(
        "jwk",
        {
          k: objectKey,
          alg: "A128GCM",
          ext: true,
          key_ops: ["encrypt", "decrypt"],
          kty: "oct",
        },
        { name: "AES-GCM", length: 128 },
        false, // extractable
        ["encrypt", "decrypt"]
      );

      const encrypted = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv: new Uint8Array(12) /* don't reuse key! */ },
        key,
        new TextEncoder().encode(JSON.stringify(newmessage.value))
      );
      const string = arrayBufferToBase64(encrypted);
      let outgoingEvent = new ReceiveMessageEvent(string, loggedInUsername);
      sendEvent("send_message", outgoingEvent);
      newmessage.value = "";
    } catch (error) {
      if (
        error.message.includes(
          'The JWK "k" member did not include the right length'
        )
      ) {
        alert(
          "The provided key is of incorrect length. Please provide a valid key to receive messages from others."
        );
      } else {
        alert("An error occurred: " + error.message);
      }
    }
  }
  return false;
}

function arrayBufferToBase64(buffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function base64ToArrayBuffer(base64) {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

function sendEvent(eventName, payload) {
  const event = new Event(eventName, payload);
  conn.send(JSON.stringify(event));
}

function login() {
  let formData = {
    username: document.getElementById("username").value,
  };
  fetch("login", {
    method: "post",
    body: JSON.stringify(formData),
    mode: "cors",
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw "Username taken";
      }
    })
    .then((data) => {
      loggedInUsername = formData.username;
      user = document.getElementById("loggeduser");
      user.innerHTML = `Current User: ${loggedInUsername}`;
      //we are authenticated
      connectWebsocket(data.otp);
    })
    .catch((e) => {
      alert(e);
    });
  return false;
}

function guestLogin(event) {
    event.preventDefault();
  let formData = {
    username: document.getElementById("guest-username").value,
  };
  fetch("login", {
    method: "post",
    body: JSON.stringify(formData),
    mode: "cors",
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw "Username taken";
      }
    })
    .then((data) => {
      loggedInUsername = formData.username;
      user = document.getElementById("loggeduser");
      user.innerHTML = `Current User: ${loggedInUsername}`;

      //we are authenticated
      guestConnectWebsocket(data.otp);
    })
    .catch((e) => {
      alert(e);
    });
  return false;
}

function connectWebsocket(otp) {
  if (window["WebSocket"]) {
    console.log("supports websocket");
    conn = new WebSocket(
      "ws://" +
        document.location.host +
        "/ws?otp=" +
        otp +
        "&user=" +
        loggedInUsername
    );
    conn.onopen = function (evt) {
      document.getElementById("connection-header").innerHTML =
        "Connected to Websocket: True";
    };
    conn.onclose = function (evt) {
      document.getElementById("connection-header").innerHTML =
        "Connected to Websocket: False";
      //reconnect retry unless manual close connection
    };

    conn.onmessage = function (evt) {
      const eventData = JSON.parse(evt.data);
      const event = Object.assign(new Event(), eventData);
      routeEvent(event);
    };
  } else {
    alert("Browser does not support websockets");
  }
}

function guestConnectWebsocket(otp) {
  if (window["WebSocket"]) {
    console.log("supports websocket");
    conn = new WebSocket(
      "ws://" +
        document.location.host +
        "/ws?otp=" +
        otp +
        "&user=" +
        loggedInUsername
    );
    conn.onopen = function (evt) {
      const queryString = window.location.search;
      const urlParams = new URLSearchParams(queryString);
      const roomId = urlParams.get("room");
      guestJoinChat(roomId);
      selectedChat = roomId;
      document.getElementById("connection-header").innerHTML =
        "Connected to Websocket: True";
      const modal = document.getElementById("customAlert");
      modal.style.display = "none";
    };
    conn.onclose = function (evt) {
      document.getElementById("connection-header").innerHTML =
        "Connected to Websocket: False";
      //reconnect retry unless manual close connection
    };

    conn.onmessage = function (evt) {
      const eventData = JSON.parse(evt.data);
      const event = Object.assign(new Event(), eventData);
      routeEvent(event);
    };
  } else {
    alert("Browser does not support websockets");
  }
}

window.onload = function () {
  if (window.location.search.indexOf("room") !== -1) {
    showCustomAlert();
  }

  // document.getElementById("username").focus();
  // document.getElementById("chatroom-selection").onsubmit = changeChatRoom;
  document.getElementById("chatroom-message").onsubmit = sendMessage;
  document.getElementById("login-form").onsubmit = login;
//   document.getElementById("join-room").onsubmit = joinChatRoom;
  document.getElementById("customAlertForm").onsubmit = guestLogin;
};

function copyToClipboard(button) {
  // const objectKey =  await createKey()
  const hash = window.location.hash;
  const hashKey = hash.replace("#key=", "");
  key = keys;

  const input = document.createElement("input");
  input.value =
    window.location.origin + "/?room=" + selectedChat + "#key=" + hashKey;

  document.body.appendChild(input);
  input.select();
  document.execCommand("copy");
  document.body.removeChild(input);
  button.textContent = "Copied!";
  setTimeout(() => {
    button.textContent = "Copy Chat Link";
  }, 1500);
}
async function createKey() {
  const key = await window.crypto.subtle.generateKey(
    { name: "AES-GCM", length: 128 },
    true, // extractable
    ["encrypt", "decrypt"]
  );
  objectKey = (await window.crypto.subtle.exportKey("jwk", key)).k;
  return {
    key: key,
    objectKey: objectKey,
  };
}

function arrayBufferToBase64(buffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function generateUUID() {
  const array = new Uint8Array(16);
  window.crypto.getRandomValues(array);

  array[6] = (array[6] & 0x0f) | 0x40; // Set the 4 most significant bits of the 7th byte to 0100
  array[8] = (array[8] & 0x3f) | 0x80; // Set the 2 most significant bits of the 9th byte to 10

  return [...array]
    .map((byte, index) => {
      const str = byte.toString(16).padStart(2, "0");
      return index === 4 || index === 6 || index === 8 || index === 10
        ? `-${str}`
        : str;
    })
    .join("");
}

document.querySelectorAll('.alert1').forEach(function(button) {
    button.addEventListener('click', function() {
        alert('Visit www.plumega.com for more!');
    });
});
document.addEventListener("DOMContentLoaded", function() {
    var timeElement = document.querySelector(".taskbar-time");

    function updateTime() {
        var now = new Date();
        var formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        timeElement.textContent = formattedTime;
        timeElement.setAttribute("title", now.toLocaleString([], { weekday: 'long', month: 'long', day: '2-digit', minute: '2-digit', hour: '2-digit' }));
    }

    updateTime(); // Call once to set the initial time
    setInterval(updateTime, 1000); // Update every second
});

document.getElementById("pfgLabsDiv").addEventListener("click", function() {
    document.getElementById("pfgLabsDiv").classList.toggle("blue-background1");
    document.getElementById("pfgLabsText").classList.toggle("blue-background");
});