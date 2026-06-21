import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA6Hhv9Lc6kG8FuEiVBG98KUS77zqpXkdM",
  authDomain: "eco-alert-da009.firebaseapp.com",
  projectId: "eco-alert-da009",
  storageBucket: "eco-alert-da009.firebasestorage.app",
  messagingSenderId: "892507065780",
  appId: "1:892507065780:web:e572b98be15733a21036e1"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

onAuthStateChanged(auth, (user) => {
    if (user) {
        const nomeCompleto = user.displayName || user.email.split('@')[0];
        const primeiroNome = nomeCompleto.split(' ')[0];
        document.getElementById('user-name').textContent = primeiroNome;
    } else {
        window.location.href = "index.html";
    }
});

document.getElementById('btn-sair').addEventListener('click', () => {
    signOut(auth).catch((error) => console.error("Erro ao deslogar:", error));
});