// public/firebase-messaging-sw.js
importScripts("https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js");

// We must re-declare the config for the background worker
const firebaseConfig = {
  apiKey: "AIzaSyCaorVVYwtNiiO1jOKFi8Muf9NWcGU8xR4",
  authDomain: "swaangclub.firebaseapp.com",
  projectId: "swaangclub",
  storageBucket: "swaangclub.firebasestorage.app",
  messagingSenderId: "174466690956",
  appId: "1:174466690956:web:f26e3dc122af17cf6570a9"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// This runs when the app is in the background and a push arrives
messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] Received background message ", payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/favicon.ico", // It will use your site's favicon
    badge: "/favicon.ico",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});