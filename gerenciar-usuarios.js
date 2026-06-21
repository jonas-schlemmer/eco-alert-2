import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, getDocs, doc, updateDoc, deleteDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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
                
                carregarUsuariosDoBanco();
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

// Puxa a listagem completa da coleção "users"
async function carregarUsuariosDoBanco() {
    const tbody = document.getElementById('usuarios-table-body');
    tbody.innerHTML = ""; 

    try {
        const querySnapshot = await getDocs(collection(db, "users"));
        
        querySnapshot.forEach((docSnap) => {
            const dados = docSnap.data();
            const idUsuario = docSnap.id;

            const tr = document.createElement('tr');
            tr.setAttribute('data-id', idUsuario);

            tr.innerHTML = `
                <td>${dados.nome}</td>
                <td>${dados.email}</td>
                <td class="user-type">${dados.tipo}</td>
                <td>
                    <button class="action-btn toggle-btn" title="Alternar Permissão">🔄</button>
                    <button class="action-btn edit-btn" title="Editar Usuário">✏️</button>
                    <button class="action-btn delete-btn" title="Excluir Usuário">🗑️</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error("Erro ao carregar usuários:", error);
    }
}

// Manipulação de Ações com atualização no banco "users"
document.getElementById('usuarios-table-body').addEventListener('click', async (e) => {
    const linha = e.target.closest('tr');
    if (!linha) return;

    const idUsuario = linha.getAttribute('data-id');
    const nomeUsuario = linha.cells[0].textContent;
    const emailUsuario = linha.cells[1].textContent;
    const tdTipo = linha.querySelector('.user-type');

    // Impede o admin master admin@ecoalert.com.br de ser alterado por engano
    if (emailUsuario === 'admin@ecoalert.com.br' && !e.target.classList.contains('edit-btn')) {
        alert('Ações não permitidas no administrador master do sistema.');
        return;
    }

    // 1. Alternar Tipo (Muda o tipo e salva no Firestore)
    if (e.target.classList.contains('toggle-btn')) {
        const novoTipo = tdTipo.textContent === 'Usuário' ? 'Administrador' : 'Usuário';
        try {
            await updateDoc(doc(db, "users", idUsuario), { tipo: novoTipo });
            tdTipo.textContent = novoTipo;
            alert(`Tipo do usuário ${nomeUsuario} alterado para ${novoTipo}!`);
        } catch (error) {
            console.error(error);
            alert("Erro ao alterar tipo do usuário.");
        }
    }

    // 2. Editar Usuário
    if (e.target.classList.contains('edit-btn')) {
        alert(`Editar informações cadastrais do usuário: ${nomeUsuario}`);
    }

    // 3. Deletar do banco de dados "users"
    if (e.target.classList.contains('delete-btn')) {
        if (confirm(`Remover o usuário ${nomeUsuario} do banco de dados permanentemente?`)) {
            try {
                await deleteDoc(doc(db, "users", idUsuario));
                linha.remove();
                alert('Usuário removido com sucesso!');
            } catch (error) {
                console.error(error);
                alert("Erro ao remover usuário.");
            }
        }
    }
});