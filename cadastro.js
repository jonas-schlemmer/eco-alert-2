import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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
const db = getFirestore(app);

const cadastroForm = document.getElementById('cadastro-form');

cadastroForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
        const user = userCredential.user;
        
        await updateProfile(user, { displayName: nome });

        const tipoUsuario = (email === 'admin@ecoalert.com.br') ? 'Administrador' : 'Usuário';

        // Alterado de "usuarios" para "users"
        await setDoc(doc(db, "users", user.uid), {
            nome: nome,
            email: email,
            tipo: tipoUsuario
        });
        
        if (tipoUsuario === 'Administrador') {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'dashboard.html';
        }

    } catch (error) {
        console.error("Erro capturado no cadastro:", error.code);
        
        if (error.code === 'auth/email-already-in-use') {
            alert('Este e-mail já está cadastrado no sistema. Tente fazer login ou use outro e-mail.');
        } else if (error.code === 'auth/weak-password') {
            alert('A senha deve ter pelo menos 6 caracteres.');
        } else if (error.code === 'auth/invalid-email') {
            alert('O formato do e-mail informado é inválido.');
        } else {
            alert('Erro ao realizar o cadastro: ' + error.message);
        }
    }
});