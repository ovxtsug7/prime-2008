// Array para armazenar reservas
let reservas = [];

// Função para calcular dias
function calcularDias(entrada, saida) {
    const diffTime = Math.abs(new Date(saida) - new Date(entrada));
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Função para calcular preço
function calcularPreco(tipo, dias, cafe) {
    const precos = { simples: 100, duplo: 150, suite: 200 };
    let total = precos[tipo] * dias;
    if (cafe === 'Sim') total += 20 * dias;
    return total;
}

// Atualizar lista
function atualizarLista() {
    const ul = document.getElementById('listaReservas');
    ul.innerHTML = reservas.map(r => `<li>${r.nome} - ${r.tipoQuarto} - ${r.entrada} a ${r.saida} - ${r.dias} dias - Café: ${r.cafe} - Total: R$${r.total}</li>`).join('');
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    document.body.innerHTML += `
        <form id="formReserva">
            <label>Nome do Hóspede:</label>
            <input type="text" id="nome" required><br><br>
            <label>Tipo de Quarto:</label>
            <select id="tipoQuarto" required>
                <option value="">Selecione...</option>
                <option value="simples">Simples - R$100/dia</option>
                <option value="duplo">Duplo - R$150/dia</option>
                <option value="suite">Suíte - R$200/dia</option>
            </select><br><br>
            <label>Café da manhã:</label>
            <input type="radio" name="cafe" value="Sim" required> Sim
            <input type="radio" name="cafe" value="Não" required> Não<br><br>
            <label>Data de Entrada:</label>
            <input type="date" id="entrada" required><br><br>
            <label>Data de Saída:</label>
            <input type="date" id="saida" required><br><br>
            <button type="submit">Reservar</button>
        </form>
        <h2>Lista de Reservas</h2>
        <ul id="listaReservas"></ul>
    `;

    document.getElementById('formReserva').addEventListener('submit', (e) => {
        e.preventDefault();
        const nome = document.getElementById('nome').value;
        const tipoQuarto = document.getElementById('tipoQuarto').value;
        const cafe = document.querySelector('input[name="cafe"]:checked').value;
        const entrada = document.getElementById('entrada').value;
        const saida = document.getElementById('saida').value;
        const dias = calcularDias(entrada, saida);
        const total = calcularPreco(tipoQuarto, dias, cafe);
        reservas.push({ nome, tipoQuarto, entrada, saida, dias, cafe, total });
        atualizarLista();
        e.target.reset();
    });
});
