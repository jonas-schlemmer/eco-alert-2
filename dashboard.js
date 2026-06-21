import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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
        const nomeCompleto = user.displayName || user.email.split('@')[0];
        document.getElementById('user-name').textContent = nomeCompleto.split(' ')[0];
        
        // Carrega os dados do banco assim que o usuário logar
        await carregarDadosDashboard();
    } else {
        window.location.href = "index.html";
    }
});

document.getElementById('btn-sair').addEventListener('click', () => {
    if (confirm("Deseja realmente sair da sua conta?")) {
        signOut(auth).catch((error) => console.error("Erro ao deslogar:", error));
    }
});

async function carregarDadosDashboard() {
    const tableBody = document.getElementById('table-body');
    
    // Contadores na tela
    let contPendente = 0;
    let contResolvida = 0;
    let contAnalise = 0;

    try {
        const querySnapshot = await getDocs(collection(db, "complaints"));
        
        tableBody.innerHTML = ''; // Limpa o texto de carregamento

        if (querySnapshot.empty) {
            tableBody.innerHTML = `<tr><td colspan="4" style="text-align: center;">Nenhuma denúncia registrada no sistema.</td></tr>`;
        } else {
            querySnapshot.forEach((doc) => {
                const denuncia = doc.data();
                const idDoc = doc.id;
                const status = denuncia.status ? denuncia.status.trim() : "Pendente";

                // Contagem simples considerando letras minúsculas/maiúsculas
                if (status.toLowerCase().includes("pendente")) {
                    contPendente++;
                } else if (status.toLowerCase().includes("resolvida")) {
                    contResolvida++;
                } else if (status.toLowerCase().includes("análise") || status.toLowerCase().includes("analise")) {
                    contAnalise++;
                }

                // Cria a linha da tabela dinamicamente
                const linha = document.createElement('tr');
                linha.innerHTML = `
                    <td><a href="detalhes-denuncia.html?id=${idDoc}" style="color: inherit; text-decoration: none;">${denuncia.titulo || 'Sem Título'}</a></td>
                    <td>${denuncia.status || 'Pendente'}</td>
                    <td>${denuncia.localizacao || 'Não especificado'}</td>
                    <td>${denuncia.dataEnvio || 'N/A'}</td>
                `;
                
                tableBody.appendChild(linha);
            });
        }

        // Atualiza os contadores no topo da página
        document.getElementById('qtd-pendentes').textContent = contPendente;
        document.getElementById('qtd-resolvidas').textContent = contResolvida;
        document.getElementById('qtd-analise').textContent = contAnalise;

    } catch (error) {
        console.error("Erro ao carregar dados do painel:", error);
        tableBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: red;">Erro ao carregar dados.</td></tr>`;
    }
}