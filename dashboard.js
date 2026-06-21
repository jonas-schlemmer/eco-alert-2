import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, query, limit, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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
onAuthStateChanged(auth, async (user) => {
    if (user) {
        try {
            // Consulta o documento do usuário na coleção "users" para checar o tipo
            const userDoc = await getDoc(doc(db, "users", user.uid));
            
            if (userDoc.exists() && userDoc.data().tipo === 'Administrador') {
                // Se for administrador, joga direto para o painel administrativo
                window.location.href = "admin.html";
                return; // Interrompe a execução para não carregar o restante da dashboard
            }
        } catch (error) {
            console.error("Erro ao verificar permissão de redirecionamento:", error);
        }

        // Separa e exibe apenas o primeiro nome se for usuário comum
        const nomeCompleto = user.displayName || user.email.split('@')[0];
        const primeiroNome = nomeCompleto.split(' ')[0];
        document.getElementById('user-name').textContent = primeiroNome;
        
        carregarFotoPerfil(user.uid);
        carregarDenunciasDoBanco();
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

async function carregarFotoPerfil(uid) {
    const avatarPlaceholder = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
    document.getElementById('user-avatar-container').innerHTML = `<img src="${avatarPlaceholder}" alt="Foto de Perfil">`;
}

// 1. LISTAR AS 5 ÚLTIMAS: Limpa o conteúdo estático e puxa os dados do banco
async function carregarUltimasDenuncias() {
    const tbody = document.getElementById('table-body');
    if (!tbody) return;
    
    tbody.innerHTML = ""; // Apaga as linhas estáticas que estavam no HTML

    try {
        const q = query(collection(db, "complaints"), limit(5));
        const querySnapshot = await getDocs(q);

        // Se não houver nenhuma denúncia ainda
        if (querySnapshot.empty) {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">Nenhuma denúncia registrada ainda.</td></tr>`;
            calcularContadores();
            return;
        }

        querySnapshot.forEach((docSnap) => {
            const dados = docSnap.data();
            const idDenuncia = docSnap.id; // Pega o ID único gerado pelo Firebase

            const titulo = dados.titulo || "Sem título";
            const status = dados.status || "Pendente";
            const localizacao = dados.localizacao || "Não informada";
            const data = dados.dataEnvio || "---";

            // Cria a nova linha dinamicamente com o data-id e estilo de clique
            const tr = document.createElement('tr');
            tr.setAttribute('data-id', idDenuncia);
            tr.style.cursor = "pointer"; // Deixa a setinha do mouse como "mãozinha" indicando que é clicável
            
            tr.innerHTML = `
                <td>${titulo}</td>
                <td class="complaint-status">${status}</td>
                <td>${localizacao}</td>
                <td>${data}</td>
            `;
            tbody.appendChild(tr);
        });

        // Contadores atualizados baseado no que veio do banco
        calcularContadores();

    } catch (error) {
        console.error("Erro ao carregar últimas denúncias:", error);
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:red;">Erro ao carregar dados.</td></tr>`;
    }
}

// 2. REDIRECIONAMENTO: Detecta o clique na linha e envia o ID para a tela de detalhes
document.getElementById('table-body').addEventListener('click', (e) => {
    const linhaClicada = e.target.closest('tr');
    
    // Se clicou na linha e ela possui um ID de denúncia válido
    if (linhaClicada && linhaClicada.hasAttribute('data-id')) {
        const idDenuncia = linhaClicada.getAttribute('data-id');
        
        // Redireciona para detalhes-denuncia.html passando o id na URL (?id=...)
        window.location.href = `detalhes-denuncia.html?id=${idDenuncia}`;
    }
});

function calcularContadores() {
    const rows = document.querySelectorAll("#table-body tr");
    let pendentes = 0; let resolvidas = 0; let analise = 0;

    rows.forEach(row => {
        if (row.cells.length < 2) return;
        
        const statusText = row.cells[1].textContent.trim().toLowerCase();
        if (statusText === "pendente") pendentes++;
        else if (statusText === "resolvida") resolvidas++;
        else if (statusText === "em análise" || statusText === "em analise") analise++;
    });

    document.getElementById("qtd-pendentes").textContent = pendentes;
    document.getElementById("qtd-resolvidas").textContent = resolvidas;
    document.getElementById("qtd-analise").textContent = analise;
}