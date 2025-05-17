import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { getDatabase, ref, set, push, onChildAdded, get, child } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCPaUeP9Xuc1UyjnQ5Kg3tGu6Gkm_peJ1U",
  authDomain: "chat-375e0.firebaseapp.com",
  databaseURL: "https://chat-375e0-default-rtdb.firebaseio.com",
  projectId: "chat-375e0",
  storageBucket: "chat-375e0.appspot.com",
  messagingSenderId: "452320470709",
  appId: "1:452320470709:web:0082d62b989421b14300fc",
  measurementId: "G-6TTPDYJ8QP"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// عناصر HTML
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("login");
const registerBtn = document.getElementById("register");
const chatBox = document.getElementById("chat-box");
const messageInput = document.getElementById("message-input");
const sendBtn = document.getElementById("send-btn");
const userList = document.getElementById("user-list");
const currentUserSpan = document.getElementById("current-user");
const logoutBtn = document.getElementById("logout");

let currentUser = null;
let selectedUser = null;

registerBtn.onclick = () => {
  createUserWithEmailAndPassword(auth, emailInput.value, passwordInput.value)
    .then((userCredential) => {
      set(ref(db, "users/" + userCredential.user.uid), {
        email: userCredential.user.email
      });
    });
};

loginBtn.onclick = () => {
  signInWithEmailAndPassword(auth, emailInput.value, passwordInput.value)
    .catch(alert);
};

logoutBtn.onclick = () => {
  signOut(auth);
};

onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
    document.querySelector(".auth").classList.add("hidden");
    document.querySelector(".chat-container").classList.remove("hidden");
    currentUserSpan.textContent = user.email;
    loadUsers();
  } else {
    document.querySelector(".auth").classList.remove("hidden");
    document.querySelector(".chat-container").classList.add("hidden");
    currentUser = null;
  }
});

function loadUsers() {
  const usersRef = ref(db, "users");
  get(usersRef).then(snapshot => {
    userList.innerHTML = "";
    snapshot.forEach(child => {
      const uid = child.key;
      const email = child.val().email;
      if (uid !== currentUser.uid) {
        const option = document.createElement("option");
        option.value = uid;
        option.textContent = email;
        userList.appendChild(option);
      }
    });
    selectedUser = userList.value;
    loadMessages();
  });
}

userList.onchange = () => {
  selectedUser = userList.value;
  chatBox.innerHTML = "";
  loadMessages();
};

sendBtn.onclick = () => {
  if (messageInput.value.trim() === "" || !selectedUser) return;
  const chatId = getChatId(currentUser.uid, selectedUser);
  const msgRef = ref(db, "chats/" + chatId);
  const now = new Date();
  const msg = {
    sender: currentUser.uid,
    text: messageInput.value,
    timestamp: now.toISOString()
  };
  push(msgRef, msg);
  messageInput.value = "";
};

function getChatId(uid1, uid2) {
  return uid1 < uid2 ? uid1 + "_" + uid2 : uid2 + "_" + uid1;
}

function loadMessages() {
  const chatId = getChatId(currentUser.uid, selectedUser);
  const chatRef = ref(db, "chats/" + chatId);
  onChildAdded(chatRef, (snapshot) => {
    const msg = snapshot.val();
    const div = document.createElement("div");
    const time = new Date(msg.timestamp).toLocaleString();
    div.innerHTML = `<strong>${msg.sender === currentUser.uid ? "أنت" : "الطرف الآخر"}:</strong> ${msg.text} <small>${time}</small>`;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
  });
}
