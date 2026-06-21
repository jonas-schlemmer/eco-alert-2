import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

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

const loginForm = document.getElementById('login-form');

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    // ... dentro do loginForm.addEventListener('submit') ...
    signInWithEmailAndPassword(auth, email, senha)
    .then(async (userCredential) => {
        const user = userCredential.user;
        
        // Busca o documento do usuário no Firestore para ver o tipo
        const { getFirestore, doc, getDoc } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
        const db = getFirestore();
        const userDoc = await getDoc(doc(db, "users", user.uid));
        
        if (userDoc.exists() && userDoc.data().tipo === 'Administrador') {
            alert('Login administrativo realizado!');
            window.location.href = 'admin.html';
        } else {
            alert('Login realizado com sucesso!');
            window.location.href = 'dashboard.html';
        }
    })
    .catch((error) => {
        console.error(error);
        alert('Credenciais incorretas ou usuário não encontrado.');
    });
});