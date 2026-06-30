import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyA6Hhv9Lc6kG8FuEiVBG98KUS77zqpXkdM",
  authDomain: "eco-alert-da009.firebaseapp.com",
  projectId: "eco-alert-da009",
  messagingSenderId: "892507065780",
  appId: "1:892507065780:web:e572b98be15733a21036e1"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let usuarioLogado = null;

onAuthStateChanged(auth, (user) => {
    if (user) {
        usuarioLogado = user;
        const nomeCompleto = user.displayName || user.email.split('@')[0];
        const primeiroNome = nomeCompleto.split(' ')[0];
        document.getElementById('user-name').textContent = primeiroNome;
    } else {
        window.location.href = "index.html";
    }
});

document.getElementById('btn-sair').addEventListener('click', () => {
    if (confirm("Deseja realmente sair da sua conta?")) {
        signOut(auth).catch((error) => console.error("Erro ao deslogar:", error));
    }
});

const denunciaForm = document.getElementById('denuncia-form');
const btnDenunciar = document.getElementById('btn-denunciar');

denunciaForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!usuarioLogado) {
        alert("Você precisa estar logado para enviar uma denúncia.");
        return;
    }

    try {
        btnDenunciar.disabled = true;
        btnDenunciar.textContent = "Enviando...";

        const dadosDenuncia = {
            titulo: document.getElementById('titulo').value,
            localizacao: document.getElementById('localizacao').value,
            descricao: document.getElementById('descricao').value,
            dataEnvio: new Date().toLocaleDateString('pt-BR'),
            timestamp: Date.now(),
            status: "Pendente",
            userId: usuarioLogado.uid,
            autorEmail: usuarioLogado.email || "Anônimo"
        };

        // Salva na coleção "complaints" do Firestore
        await addDoc(collection(db, "complaints"), dadosDenuncia);

        alert("Denúncia registrada com sucesso!");
        denunciaForm.reset();
        window.location.href = "dashboard.html"; // Redireciona para onde lista as denúncias do usuário
        
    } catch (error) {
        console.error("Erro ao salvar denúncia:", error);
        alert("Falha ao registrar denúncia.");
    } finally {
        btnDenunciar.disabled = false;
        btnDenunciar.textContent = "Denunciar";
    }
});