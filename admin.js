import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

// Trava de Segurança dinâmica baseada no tipo salvo no Firestore
onAuthStateChanged(auth, async (user) => {
    if (user) {
        try {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            
            if (userDoc.exists() && userDoc.data().tipo === 'Administrador') {
                const nomeCompleto = userDoc.data().nome || user.displayName || "Admin";
                document.getElementById('user-name').textContent = nomeCompleto.split(' ')[0];
                
                // Função para inicializar contadores na tela principal do Admin, se necessário
                calcularContadoresAdmin();
            } else {
                alert('Acesso restrito apenas a administradores.');
                window.location.href = 'dashboard.html';
            }
        } catch (error) {
            console.error("Erro na verificação de permissão:", error);
            window.location.href = 'dashboard.html';
        }
    } else {
        window.location.href = 'index.html';
    }
});

// Botão Sair
document.getElementById('btn-sair').addEventListener('click', () => {
    if (confirm("Deseja realmente sair do painel administrativo?")) {
        signOut(auth).catch((error) => console.error(error));
    }
});

// Manipulação das Ações da Tabela de Denúncias
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('delete-btn')) {
        const linha = e.target.closest('tr');
        if (confirm(`ADMIN: Deseja apagar a denúncia "${linha.cells[0].textContent}"?`)) {
            linha.remove();
        }
    }

    if (e.target.classList.contains('edit-btn')) {
        const linha = e.target.closest('tr');
        alert(`ADMIN: Alterar status da denúncia: "${linha.cells[0].textContent}"`);
    }
});

function calcularContadoresAdmin() {
    // Adicione aqui a contagem dinâmica de cards de denúncias se desejar
    console.log("Contadores administrativos carregados.");
}