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

            document.getElementById('titulo').value = dados.titulo || "Sem título";
            document.getElementById('localizacao').value = dados.localizacao || "";
            document.getElementById('descricao').value = dados.descricao || "";
            
            const statusSpan = document.getElementById('denuncia-status');
            if (statusSpan) {
                statusSpan.textContent = dados.status || "Pendente";
            }
        } else {
            alert("Denúncia não encontrada no sistema.");
            window.location.href = "dashboard.html";
        }
    } catch (error) {
        console.error("Erro ao buscar detalhes da denúncia:", error);
    }
}

async function verificarPermissaoAdmin(uid) {
    try {
        const userDoc = await getDoc(doc(db, "users", uid));
        const actionsGroup = document.querySelector('.actions-group');

        // Os botões de ação ficam visíveis para todos
        if (actionsGroup) actionsGroup.style.display = "flex";

        // Os campos da denúncia podem ser editados pelo usuário
        document.getElementById('titulo').setAttribute('readonly', true);
        document.getElementById('localizacao').setAttribute('readonly', true);
        document.getElementById('descricao').setAttribute('readonly', true);

        const statusSelect = document.getElementById('status-select');

        // Apenas administradores podem alterar o status
        if (userDoc.exists() && userDoc.data().tipo === 'Administrador') {
            if (statusSelect) statusSelect.disabled = false;
        } else {
            if (statusSelect) statusSelect.disabled = true;
        }

    } catch (error) {
        console.error("Erro ao verificar permissões:", error);

        // Em caso de erro, ainda permite editar a denúncia
        const actionsGroup = document.querySelector('.actions-group');
        if (actionsGroup) actionsGroup.style.display = "flex";

        document.getElementById('titulo').setAttribute('readonly', true);
        document.getElementById('localizacao').setAttribute('readonly', true);
        document.getElementById('descricao').setAttribute('readonly', true);

        const statusSelect = document.getElementById('status-select');
        if (statusSelect) statusSelect.disabled = true;
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
const btnEditar = document.getElementById('btn-editar');

if (btnEditar) {
    btnEditar.addEventListener('click', async () => {

        const tituloInput = document.getElementById('titulo');
        const localizacaoInput = document.getElementById('localizacao');
        const descricaoInput = document.getElementById('descricao');
        const statusSpan = document.getElementById('denuncia-status');

        // Descobre se o usuário é administrador
        const usuarioAtual = auth.currentUser;
        const userDoc = await getDoc(doc(db, "users", usuarioAtual.uid));
        const ehAdministrador = userDoc.exists() && userDoc.data().tipo === "Administrador";

        if (btnEditar.textContent === "EDITAR") {

            // Apenas administradores podem editar o status
            if (ehAdministrador) {

                const statusAtual = statusSpan.textContent;

                statusSpan.innerHTML = `
                    <select id="status-select" class="form-control" style="padding:5px;font-size:14px;font-weight:bold;width:100%;">
                        <option value="Pendente" ${statusAtual === 'Pendente' ? 'selected' : ''}>Pendente</option>
                        <option value="Em análise" ${statusAtual === 'Em análise' ? 'selected' : ''}>Em análise</option>
                        <option value="Resolvida" ${statusAtual === 'Resolvida' ? 'selected' : ''}>Resolvida</option>
                    </select>
                `;
            }

            tituloInput.removeAttribute('readonly');
            localizacaoInput.removeAttribute('readonly');
            descricaoInput.removeAttribute('readonly');

            btnEditar.textContent = "SALVAR ALTERAÇÕES";
            tituloInput.focus();

        } else {

            try {

                btnEditar.disabled = true;
                btnEditar.textContent = "Salvando...";

                const dadosAtualizados = {
                    titulo: tituloInput.value,
                    localizacao: localizacaoInput.value,
                    descricao: descricaoInput.value
                };

                // Apenas administrador salva alteração de status
                if (ehAdministrador) {
                    dadosAtualizados.status = document.getElementById('status-select').value;
                }

                await updateDoc(doc(db, "complaints", idDenuncia), dadosAtualizados);

                tituloInput.setAttribute('readonly', true);
                localizacaoInput.setAttribute('readonly', true);
                descricaoInput.setAttribute('readonly', true);

                if (ehAdministrador) {
                    statusSpan.textContent = dadosAtualizados.status;
                }

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