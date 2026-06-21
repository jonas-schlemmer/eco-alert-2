import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

onAuthStateChanged(auth, async (user) => {
    if (user) {
        try {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            
            if (userDoc.exists() && userDoc.data().tipo === 'Administrador') {
                const nomeCompleto = userDoc.data().nome || user.displayName || "Admin";
                document.getElementById('user-name').textContent = nomeCompleto.split(' ')[0];
                
                // Exibe a caixa/rótulo de Administrador no topo
                const adminBadge = document.getElementById('admin-badge-container');
                if (adminBadge) adminBadge.style.display = "block";
                
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

document.getElementById('btn-sair').addEventListener('click', () => {
    if (confirm("Deseja realmente sair do painel administrativo?")) {
        signOut(auth).catch((error) => console.error(error));
    }
});

async function carregarDenunciasDoBanco() {
    const tbody = document.getElementById('table-body');
    if (!tbody) return;
    
    tbody.innerHTML = "";

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

            const titulo = dados.titulo || "Sem título";
            const status = dados.status || "Pendente";
            const localizacao = dados.localizacao || "Não informada";
            const data = dados.dataEnvio || "---";

            const statusNormalizado = status.trim().toLowerCase();
            if (statusNormalizado === "pendente") pendentes++;
            else if (statusNormalizado === "resolvida") resolvidas++;
            else if (statusNormalizado === "em análise" || statusNormalizado === "em analise") analise++;

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

        document.getElementById("qtd-pendentes").textContent = pendentes;
        document.getElementById("qtd-resolvidas").textContent = resolvidas;
        document.getElementById("qtd-analise").textContent = analise;

    } catch (error) {
        console.error("Erro ao carregar denúncias no Admin:", error);
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:red;">Erro ao carregar dados.</td></tr>`;
    }
}

document.getElementById('table-body').addEventListener('click', (e) => {
    const linhaClicada = e.target.closest('tr');
    
    if (linhaClicada && linhaClicada.hasAttribute('data-id')) {
        const idDenuncia = linhaClicada.getAttribute('data-id');
        window.location.href = `detalhes-denuncia.html?id=${idDenuncia}`;
    }
});