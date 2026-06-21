import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

// Trava de Segurança dinâmica baseada no tipo salvo na coleção "users"
onAuthStateChanged(auth, async (user) => {
    if (user) {
        try {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            
            if (userDoc.exists() && userDoc.data().tipo === 'Administrador') {
                const nomeCompleto = userDoc.data().nome || user.displayName || "Admin";
                document.getElementById('user-name').textContent = nomeCompleto.split(' ')[0];
                
                // EXIBE A LABEL/BLOCO DE ADMINISTRADOR
                const adminBadge = document.getElementById('admin-badge-container');
                if (adminBadge) adminBadge.style.display = "block"; // ou "flex", dependendo do seu CSS
                
                // Carrega as denúncias
                carregarDenunciasDoBanco();
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

// 1. LISTAR: Busca todas as denúncias da coleção "complaints" e preenche a tabela e os contadores
async function carregarDenunciasDoBanco() {
    const tbody = document.getElementById('table-body');
    if (!tbody) return;
    
    tbody.innerHTML = ""; // Limpa os dados estáticos

    let pendentes = 0;
    let resolvidas = 0;
    let analise = 0;

    try {
        const querySnapshot = await getDocs(collection(db, "complaints"));
        
        if (querySnapshot.empty) {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;">Nenhuma denúncia registrada ainda.</td></tr>`;
            document.getElementById("qtd-pendentes").textContent = 0;
            document.getElementById("qtd-resolvidas").textContent = 0;
            document.getElementById("qtd-analise").textContent = 0;
            return;
        }

        querySnapshot.forEach((docSnap) => {
            const dados = docSnap.data();
            const idDenuncia = docSnap.id;

            // Tratamento seguro dos dados caso algum campo esteja nulo ou indefinido
            const titulo = dados.titulo || "Sem título";
            const status = dados.status || "Pendente";
            const localizacao = dados.localizacao || "Não informada";
            const data = dados.dataEnvio || "---";

            // Calcula a soma dos contadores para os círculos do topo
            const statusNormalizado = status.trim().toLowerCase();
            if (statusNormalizado === "pendente") pendentes++;
            else if (statusNormalizado === "resolvida") resolvidas++;
            else if (statusNormalizado === "em análise" || statusNormalizado === "em analise") analise++;

            // Cria a linha na tabela adicionando o id de controle e cursor pointer
            const tr = document.createElement('tr');
            tr.setAttribute('data-id', idDenuncia);
            tr.style.cursor = "pointer";

            // Renderiza APENAS as 4 colunas tradicionais (Exatamente igual ao Dashboard da direita)
            tr.innerHTML = `
                <td>${titulo}</td>
                <td class="complaint-status">${status}</td>
                <td>${localizacao}</td>
                <td>${data}</td>
            `;
            tbody.appendChild(tr);
        });

        // Atualiza os círculos de contadores da interface com os dados reais
        document.getElementById("qtd-pendentes").textContent = pendentes;
        document.getElementById("qtd-resolvidas").textContent = resolvidas;
        document.getElementById("qtd-analise").textContent = analise;

    } catch (error) {
        console.error("Erro ao carregar denúncias no Admin:", error);
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:red;">Erro ao carregar dados.</td></tr>`;
    }
}

// 2. REDIRECIONAMENTO: Clicar em qualquer linha te leva para a tela de Detalhes
document.getElementById('table-body').addEventListener('click', (e) => {
    const linhaClicada = e.target.closest('tr');
    
    if (linhaClicada && linhaClicada.hasAttribute('data-id')) {
        const idDenuncia = linhaClicada.getAttribute('data-id');
        window.location.href = `detalhes-denuncia.html?id=${idDenuncia}`;
    }
});