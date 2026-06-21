import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getStorage, ref, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

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
const storage = getStorage(app);

// Monitora o estado de login e aplica o filtro do primeiro nome
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Separa e exibe apenas o primeiro nome
        const nomeCompleto = user.displayName || user.email.split('@')[0];
        const primeiroNome = nomeCompleto.split(' ')[0];
        document.getElementById('user-name').textContent = primeiroNome;
        
        carregarFotoPerfil(user.uid);
        calcularContadores();
    } else {
        window.location.href = "index.html"; // Retorna para a tela de login
    }
});

// Botão de Sair da Conta
document.getElementById('btn-sair').addEventListener('click', () => {
    signOut(auth).catch((error) => console.error("Erro ao deslogar:", error));
});

async function carregarFotoPerfil(uid) {
    try {
        const avatarRef = ref(storage, `avatars/avatar_${uid}.png`);
        const url = await getDownloadURL(avatarRef);
        document.getElementById('user-avatar-container').innerHTML = `<img src="${url}" alt="Foto">`;
    } catch (error) {
        console.log("Usando o placeholder padrão para o avatar.");
    }
}

function calcularContadores() {
    const rows = document.querySelectorAll("#table-body tr");
    let pendentes = 0; let resolvidas = 0; let analise = 0;

    rows.forEach(row => {
        const statusText = row.cells[1].textContent.trim().toLowerCase();
        if (statusText === "pendente") pendentes++;
        else if (statusText === "resolvida") resolvidas++;
        else if (statusText === "em análise" || statusText === "em analise") analise++;
    });

    document.getElementById("qtd-pendentes").textContent = pendentes;
    document.getElementById("qtd-resolvidas").textContent = resolvidas;
    document.getElementById("qtd-analise").textContent = analise;
}