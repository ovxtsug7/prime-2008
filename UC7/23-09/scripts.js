document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('cadastroForm');
    const dadosDiv = document.getElementById('dadosUsuario');

    displayStoredData();

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const nome = document.getElementById('nome').value;
        const idade = document.getElementById('idade').value;
        const altura = document.getElementById('altura').value;

        if (nome && idade && altura) {
            const userData = { nome, idade, altura };
            localStorage.setItem('userData', JSON.stringify(userData));
            alert('Dados cadastrados com sucesso!');
            form.reset();
            displayStoredData();
        } else {
            alert('Por favor, preencha todos os campos.');
        }
    });

    function displayStoredData() {
        const storedData = localStorage.getItem('userData');
        if (storedData) {
            const userData = JSON.parse(storedData);
            dadosDiv.innerHTML = `<p>Nome: ${userData.nome}</p><p>Idade: ${userData.idade}</p><p>Altura: ${userData.altura} cm</p>`;
        } else {
            dadosDiv.innerHTML = '<p>Nenhum dado armazenado.</p>';
        }
    }
});