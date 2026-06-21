import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Configuração do Firebase corrigida (Sem a linha do storageBucket para evitar erros de CORS)
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

// Monitora o estado de login e carrega os dados
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Separa e exibe apenas o primeiro nome
        const nomeCompleto = user.displayName || user.email.split('@')[0];
        const primeiroNome = nomeCompleto.split(' ')[0];
        document.getElementById('user-name').textContent = primeiroNome;
        
        carregarMinhasDenuncias(user.uid); // Filtra as denúncias criadas por este usuário específico
    } else {
        window.location.href = "index.html"; // Retorna para a tela de login
    }
});

// Botão de Sair da Conta
document.getElementById('btn-sair').addEventListener('click', () => {
    if (confirm("Deseja realmente sair da sua conta?")) {
        signOut(auth).catch((error) => console.error("Erro ao deslogar:", error));
    }
});

// 1. LISTAR: Filtra e exibe apenas as denúncias que pertencem ao usuário logado
async function carregarMinhasDenuncias(userId) {
    const tbody = document.getElementById('table-body');
    if (!tbody) return;
    
    tbody.innerHTML = ""; // Limpa os dados estáticos do HTML

    try {
        // ATENÇÃO: Essa consulta assume que você salva o "userId" ou "userUid" dentro do documento da denúncia ao criá-la
        const q = query(collection(db, "complaints"), where("userId", "==", userId));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">Você ainda não enviou nenhuma denúncia.</td></tr>`;
            return;
        }

        querySnapshot.forEach((docSnap) => {
            const dados = docSnap.data();
            const idDenuncia = docSnap.id;

            const titulo = dados.titulo || "Sem título";
            const status = dados.status || "Pendente";
            const localizacao = dados.localizacao || "Não informada";
            const data = dados.dataEnvio || "---";

            // Cria a linha contendo o id de controle e com cursor indicando clique
            const tr = document.createElement('tr');
            tr.setAttribute('data-id', idDenuncia);
            tr.style.cursor = "pointer";

            tr.innerHTML = `
                <td>${titulo}</td>
                <td class="complaint-status">${status}</td>
                <td>${localizacao}</td>
                <td>${data}</td>
            `;
            tbody.appendChild(tr);
        });

    } catch (error) {
        console.error("Erro ao carregar minhas denúncias:", error);
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:red;">Erro ao carregar dados.</td></tr>`;
    }
}

// 2. REDIRECIONAMENTO PARA ATUALIZAÇÃO: Clicar na linha leva o usuário para a tela de edição
document.getElementById('table-body').addEventListener('click', (e) => {
    const linhaClicada = e.target.closest('tr');
    
    if (linhaClicada && linhaClicada.hasAttribute('data-id')) {
        const idDenuncia = linhaClicada.getAttribute('data-id');
        // Envia para a tela de detalhes onde ele pode clicar em "EDITAR" e atualizar no banco
        window.location.href = `detalhes-denuncia.html?id=${idDenuncia}`;
    }
});