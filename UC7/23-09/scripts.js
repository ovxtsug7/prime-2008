function cadastrarLivro(event) {
  event.preventDefault();

  const titulo = document.getElementById('titulo').value;
  const autor = document.getElementById('autor').value;
  const ano = document.getElementById('ano').value;
  const genero = document.getElementById('genero').value;
  const isbn = document.getElementById('isbn').value;

  const livro = { titulo, autor, ano, genero, isbn };

  // Pega os livros existentes
  const livros = JSON.parse(localStorage.getItem('livros') || '[]');
  livros.push(livro);

  localStorage.setItem('livros', JSON.stringify(livros));

  // Limpa o formulário
  event.target.reset();

  // Atualiza a tabela
  exibirLivros();
}

function exibirLivros() {
  const livros = JSON.parse(localStorage.getItem('livros') || '[]');
  const tbody = document.querySelector('#tabela-livros tbody');
  tbody.innerHTML = '';

  livros.forEach((livro, index) => {
    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td>${livro.titulo}</td>
      <td>${livro.autor}</td>
      <td>${livro.ano}</td>
      <td>${livro.genero}</td>
      <td>${livro.isbn}</td>
      <td><button onclick="verDetalhes(${index})">Ver detalhes</button></td>
    `;

    tbody.appendChild(tr);
  });
}

function verDetalhes(index) {
  const livros = JSON.parse(localStorage.getItem('livros') || '[]');
  const livro = livros[index];

  alert(
    `Título: ${livro.titulo}\nAutor: ${livro.autor}\nAno: ${livro.ano}\nGênero: ${livro.genero}\nISBN: ${livro.isbn}`
  );
}

// Carrega ao abrir a página
window.onload = exibirLivros;
