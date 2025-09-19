const reservas = [];

function calcularDias(entrada, saida) {
  const diffTime = new Date(saida) - new Date(entrada);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function calcularPreco(tipo, dias, cafe) {
  const precos = { simples: 100, duplo: 150, suite: 200 };
  let total = precos[tipo] * dias;
  if (cafe === 'Sim') total += 20 * dias;
  return total;
}

function atualizarLista() {
  const ul = document.getElementById('listaReservas');
  ul.innerHTML = reservas
    .map(
      (r) =>
        `<li>${r.nome} - ${r.tipoQuarto} - ${r.entrada} a ${r.saida} - ${r.dias} dias - Café: ${r.cafe} - Total: R$${r.total}</li>`
    )
    .join('');
}

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
