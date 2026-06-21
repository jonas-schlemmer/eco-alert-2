import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

// Cole aqui a chave de API que você pegou no site do Imgbb
const IMGBB_API_KEY = "6bf36b302bed6f475b5c7162d3c548d0";

onAuthStateChanged(auth, (user) => {
    if (user) {
        const nomeCompleto = user.displayName || user.email.split('@')[0];
        document.getElementById('user-name').textContent = nomeCompleto.split(' ')[0];
    } else {
        setTimeout(() => {
            if (!auth.currentUser) {
                alert("Sessão expirada ou usuário não conectado.");
                window.location.href = "index.html";
            }
        }, 1500);
    }
});

document.getElementById('btn-sair').addEventListener('click', () => {
    if (confirm("Deseja realmente sair da sua conta?")) {
        signOut(auth).catch((error) => console.error("Erro ao deslogar:", error));
    }
});

const imagemInput = document.getElementById('imagem-input');
const filePlaceholder = document.getElementById('file-name-placeholder');
const denunciaForm = document.getElementById('denuncia-form');
const btnDenunciar = document.getElementById('btn-denunciar');

imagemInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        filePlaceholder.value = e.target.files[0].name;
    }
});

denunciaForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const file = imagemInput.files[0];
    
    if (!file) {
        alert("Por favor, selecione ou tire uma foto da ocorrência.");
        return; 
    }

    try {
        btnDenunciar.disabled = true;
        btnDenunciar.textContent = "Enviando...";

        // 1. Prepara o arquivo para o envio externo via FormData
        const formData = new FormData();
        formData.append("image", file);

        // 2. Faz o upload para a API gratuita do Imgbb
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
            method: "POST",
            body: formData
        });

        const result = await response.json();

        if (!result.success) {
            throw new Error("Falha ao subir imagem no servidor externo.");
        }

        // URL permanente gerada pelo Imgbb
        const downloadURL = result.data.url;

        // 3. Monta o objeto estruturado salvando o link do Imgbb no Firestore
        const dadosDenuncia = {
            titulo: document.getElementById('titulo').value,
            localizacao: document.getElementById('localizacao').value,
            descricao: document.getElementById('descricao').value,
            imageUrl: downloadURL, 
            dataEnvio: new Date().toLocaleDateString('pt-BR'),
            status: "Pendente",
            userId: auth.currentUser ? auth.currentUser.uid : "anonimo"
        };

        // 4. Salva os dados no banco de dados gratuito do Firebase
        await addDoc(collection(db, "complaints"), dadosDenuncia);

        alert("Denúncia registrada com sucesso!");
        window.location.href = "dashboard.html";
        
    } catch (error) {
        console.error("Erro detectado durante o envio:", error);
        alert("Falha ao registrar denúncia. Verifique o console.");
    } finally {
        btnDenunciar.disabled = false;
        btnDenunciar.textContent = "Denunciar";
    }
});