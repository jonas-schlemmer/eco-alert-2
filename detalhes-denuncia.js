import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

const urlParams = new URLSearchParams(window.location.search);
const idDenuncia = urlParams.get('id');

onAuthStateChanged(auth, async (user) => {
    if (user) {
        const nomeCompleto = user.displayName || user.email.split('@')[0];
        document.getElementById('user-name').textContent = nomeCompleto.split(' ')[0];

        if (idDenuncia) {
            await carregarDetalhesDenuncia();
            await verificarPermissaoAdmin(user.uid);
        } else {
            alert("Nenhuma denúncia selecionada.");
            window.location.href = "dashboard.html";
        }
    } else {
        window.location.href = "index.html";
    }
});

document.getElementById('btn-sair').addEventListener('click', () => {
    if (confirm("Deseja realmente sair da sua conta?")) {
        signOut(auth).catch((error) => console.error("Erro ao deslogar:", error));
    }
});

async function carregarDetalhesDenuncia() {
    try {
        const docRef = doc(db, "complaints", idDenuncia);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const dados = docSnap.data();

            // Preenche o input do Título corretamente
            document.getElementById('titulo').value = dados.titulo || "Sem título";
            document.getElementById('localizacao').value = dados.localizacao || "";
            document.getElementById('descricao').value = dados.descricao || "";
            
            const statusSpan = document.getElementById('denuncia-status');
            if (statusSpan) {
                statusSpan.textContent = dados.status || "Pendente";
            }
            
            const imgContainer = document.getElementById('denuncia-img-container');
            if (imgContainer) {
                const linkImagem = dados.imageUrl || dados.imagem || "https://cdn-icons-png.flaticon.com/512/2652/2652218.png";
                imgContainer.innerHTML = `<img src="${linkImagem}" alt="Foto da Ocorrência" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">`;
            }
        } else {
            alert("Denúncia não encontrada no sistema.");
            window.location.href = "dashboard.html";
        }
    } catch (error) {
        console.error("Erro ao buscar detalhes da denúncia:", error);
    }
}

// SEGURANÇA: Libera edição apenas para Administradores
async function verificarPermissaoAdmin(uid) {
    try {
        const userDoc = await getDoc(doc(db, "users", uid));
        const actionsGroup = document.querySelector('.actions-group');
        
        if (userDoc.exists() && userDoc.data().tipo === 'Administrador') {
            if (actionsGroup) actionsGroup.style.display = "flex";
        } else {
            if (actionsGroup) actionsGroup.style.display = "none";
            
            // Trava todos os campos para usuários normais
            document.getElementById('titulo').setAttribute('readonly', true);
            document.getElementById('localizacao').setAttribute('readonly', true);
            document.getElementById('descricao').setAttribute('readonly', true);
            
            const statusSelect = document.getElementById('status-select');
            if (statusSelect) statusSelect.disabled = true;
        }
    } catch (error) {
        console.error("Erro ao verificar permissões:", error);
        const actionsGroup = document.querySelector('.actions-group');
        if (actionsGroup) actionsGroup.style.display = "none";
    }
}

document.getElementById('btn-excluir').addEventListener('click', async () => {
    if (confirm("Tem certeza que deseja remover esta denúncia permanentemente?")) {
        try {
            await deleteDoc(doc(db, "complaints", idDenuncia));
            alert("Denúncia removida com sucesso!");
            window.location.href = "dashboard.html"; 
        } catch (error) {
            console.error("Erro ao excluir documento:", error);
            alert("Não foi possível excluir a denúncia.");
        }
    }
});

// AÇÃO DE EDITAR: Agora destrava o Título, Localização, Descrição e Status simultaneamente
const btnEditar = document.getElementById('btn-editar');
if (btnEditar) {
    btnEditar.addEventListener('click', async () => {
        const tituloInput = document.getElementById('titulo');
        const localizacaoInput = document.getElementById('localizacao');
        const descricaoInput = document.getElementById('descricao');
        const statusSpan = document.getElementById('denuncia-status');
        
        if (btnEditar.textContent === "EDITAR") {
            const statusAtual = statusSpan.textContent;
            statusSpan.innerHTML = `
                <select id="status-select" class="form-control" style="padding: 5px; font-size: 14px; font-weight: bold;">
                    <option value="Pendente" ${statusAtual === 'Pendente' ? 'selected' : ''}>Pendente</option>
                    <option value="Em análise" ${statusAtual === 'Em análise' ? 'selected' : ''}>Em análise</option>
                    <option value="Resolvida" ${statusAtual === 'Resolvida' ? 'selected' : ''}>Resolvida</option>
                </select>
            `;

            tituloInput.removeAttribute('readonly');
            localizacaoInput.removeAttribute('readonly');
            descricaoInput.removeAttribute('readonly');
            
            btnEditar.textContent = "SALVAR ALTERAÇÕES";
            tituloInput.focus();
        } else {
            try {
                btnEditar.disabled = true;
                btnEditar.textContent = "Salvando...";

                const novoStatus = document.getElementById('status-select').value;

                // Atualiza o título, localização, descrição e status no banco
                await updateDoc(doc(db, "complaints", idDenuncia), {
                    titulo: tituloInput.value,
                    localizacao: localizacaoInput.value,
                    descricao: descricaoInput.value,
                    status: novoStatus
                });

                tituloInput.setAttribute('readonly', true);
                localizacaoInput.setAttribute('readonly', true);
                descricaoInput.setAttribute('readonly', true);
                
                statusSpan.textContent = novoStatus;

                btnEditar.textContent = "EDITAR";
                alert("Alterações salvas com sucesso!");
            } catch (error) {
                console.error("Erro ao atualizar denúncia:", error);
                alert("Falha ao salvar as modificações.");
                btnEditar.textContent = "SALVAR ALTERAÇÕES";
            } finally {
                btnEditar.disabled = false;
            }
        }
    });
}