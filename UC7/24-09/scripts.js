function cadastrarLivro(e) {
            e.preventDefault();

            const titulo = document.getElementById("campo-titulo").value;
            const autor = document.getElementById("campo-autor").value;
            const ano = parseInt(document.getElementById("campo-ano").value);
            const genero = document.getElementById("campo-genero").value;
            const isbn = document.getElementById("campo-isbn").value;

            const livro = { titulo, autor, ano, genero, isbn };

            const livros = JSON.parse(localStorage.getItem("livros")) || [];

            livros.push(livro);
            localStorage.setItem("livros", JSON.stringify(livros));

            e.target.reset();
            exibirLivros();
        }

        function exibirLivros() {
            const livros = JSON.parse(localStorage.getItem("livros")) || [];
            const tbody = document.getElementById("tabela-livros-body");

            tbody.innerHTML = "";

            livros.forEach((livro, index) => {
                const tr = document.createElement("tr");

                tr.innerHTML = `
                    <td>${livro.titulo}</td>
                    <td>${livro.autor}</td>
                    <td>${livro.ano}</td>
                    <td>${livro.genero}</td>
                    <td>${livro.isbn}</td>
                    <td>
                        <button onclick="verDetalhes(${index})">Ver Detalhes</button>
                        <button onclick="removerLivro(${index})" style="margin-left: 5px; color: red;">Remover</button>
                    </td>
                `;

                tbody.appendChild(tr);
            });
        }

        function verDetalhes(index) {
            const livros = JSON.parse(localStorage.getItem("livros")) || [];
            const livro = livros[index];

            alert(
                `Título: ${livro.titulo}\nAutor: ${livro.autor}\nAno: ${livro.ano}\nGênero: ${livro.genero}\nISBN: ${livro.isbn}`
            );
        }

        function removerLivro(index) {
            const livros = JSON.parse(localStorage.getItem("livros")) || [];

            if (index >= 0 && index < livros.length) {
                livros.splice(index, 1);
                localStorage.setItem("livros", JSON.stringify(livros));
                exibirLivros();
            }
        }

        window.onload = exibirLivros;