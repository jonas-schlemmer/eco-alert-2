import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

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

onAuthStateChanged(auth, (user) => {
    if (user) {
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

const imagemInput = document.getElementById('imagem-input');
const filePlaceholder = document.getElementById('file-name-placeholder');

imagemInput.addEventListener('change', (e) => {
    if(e.target.files.length > 0) {
        filePlaceholder.value = e.target.files[0].name;
    }
});

const denunciaForm = document.getElementById('denuncia-form');
const btnDenunciar = document.getElementById('btn-denunciar');

denunciaForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const file = imagemInput.files[0];
    if(!file) return alert("Por favor, selecione uma imagem.");

    try {
        btnDenunciar.disabled = true;
        btnDenunciar.textContent = "Enviando...";

        const fileExtension = file.name.split('.').pop();
        const caminhoStorage = `denuncias/${Date.now()}_denuncia.${fileExtension}`;
        const storageRef = ref(storage, caminhoStorage);

        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);

        const dadosDenuncia = {
            titulo: document.getElementById('titulo').value,
            localizacao: document.getElementById('localizacao').value,
            descricao: document.getElementById('descricao').value,
            imageUrl: downloadURL,
            dataEnvio: new Date().toLocaleDateString('pt-BR'),
            status: "Pendente"
        };

        console.log("Denúncia criada:", dadosDenuncia);
        alert("Denúncia registrada com sucesso!");
        window.location.href = "dashboard.html";
    } catch (error) {
        console.error("Erro:", error);
        alert("Falha ao registrar denúncia.");
    } finally {
        btnDenunciar.disabled = false;
        btnDenunciar.textContent = "Denunciar";
    }
});