// ------------------------------------------------
// SELETORES DOM
// ------------------------------------------------
const form = document.getElementById('create-poll-form');
const pollTypeRadios = form.querySelectorAll('input[name="poll-type"]');
const optionsContainer = document.getElementById('poll-options-container');
const optionsList = document.getElementById('options-list');
const addOptionBtn = document.getElementById('add-option-btn');
const multipleChoiceContainer = document.getElementById('multiple-choice-container');


/**
 * Alterna a visibilidade dos campos de opções e múltipla escolha
 * dependendo se o tipo de proposta é 'poll' (enquete) ou 'voting' (votação).
 */
function toggleOptionsVisibility() {
    // Pega o valor do radio button selecionado
    const selectedType = document.querySelector('input[name="poll-type"]:checked').value;
    const optionInputs = optionsList.querySelectorAll('.poll-option-input');

    if (selectedType === 'poll') {
        // MOSTRAR campos de Opções e Múltipla Escolha
        optionsContainer.classList.remove('hidden');
        multipleChoiceContainer.classList.remove('hidden');
        
        // Garante que os campos de opção sejam 'required'
        optionInputs.forEach(input => {
            input.setAttribute('required', 'required');
        });
    } else {
        // ESCONDER campos de Opções e Múltipla Escolha
        optionsContainer.classList.add('hidden');
        multipleChoiceContainer.classList.add('hidden');

        // Remove o atributo 'required' para que o formulário possa ser enviado
        optionInputs.forEach(input => {
            input.removeAttribute('required');
        });
    }
}

// Adiciona listener para a mudança do tipo de proposta
pollTypeRadios.forEach(radio => {
    radio.addEventListener('change', toggleOptionsVisibility);
});


/** * Garante que a numeração dos placeholders e a visibilidade dos 
 * botões de remoção estejam corretas.
 */
function renumberOptions() {
    const optionRows = optionsList.querySelectorAll('.option-row');
    const minOptions = 2; // Mínimo de 2 opções é obrigatório

    optionRows.forEach((row, index) => {
        const input = row.querySelector('.poll-option-input');
        const removeBtn = row.querySelector('.remove-option-btn');
        
        // Atualiza o placeholder (Opção 1, Opção 2, etc.)
        input.placeholder = `Opção ${index + 1}`;
        
        // Controla a visibilidade do botão de remover: só aparece se houver mais que o mínimo
        if (optionRows.length > minOptions) {
            removeBtn.classList.remove('hidden');
        } else {
            removeBtn.classList.add('hidden');
        }
    });
}


/** Adiciona uma nova linha de opção ao formulário. */
function addOptionField() {
    const nextId = optionsList.querySelectorAll('.option-row').length + 1;
    
    const newRow = document.createElement('div');
    newRow.classList.add('option-row');
    newRow.dataset.optionId = nextId;

    newRow.innerHTML = `
        <input type="text" class="poll-option-input" placeholder="Opção ${nextId}" required>
        <button type="button" class="remove-option-btn">Remover</button>
    `;

    optionsList.appendChild(newRow);
    
    // Adiciona o listener para o novo botão de remover
    newRow.querySelector('.remove-option-btn').addEventListener('click', function() {
        newRow.remove();
        renumberOptions();
    });

    renumberOptions(); // Reajusta a numeração após adicionar
}

// Listener para o botão de adicionar opção
addOptionBtn.addEventListener('click', addOptionField);

// Listener para a remoção de opções existentes
optionsList.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-option-btn')) {
        const row = e.target.closest('.option-row');
        row.remove();
        renumberOptions(); // Reajusta a numeração após remover
    }
});


// 3. Lógica de Envio (AGORA SALVANDO EM LOCALSTORAGE)
form.addEventListener('submit', (e) => {
    e.preventDefault();

    // 1. Coleta dados gerais
    const formData = {
        type: document.querySelector('input[name="poll-type"]:checked').value,
        title: document.getElementById('poll-title').value,
        description: document.getElementById('poll-description').value,
        expiration: document.getElementById('expiration-date').value,
        category: document.getElementById('tags-category').value,
    };

    // 2. Coleta dados específicos da Enquete
    if (formData.type === 'poll') {
        formData.isMultipleChoice = document.getElementById('multiple-choice').value === 'true';

        // Coleta as opções e garante que não há valores vazios
        formData.options = Array.from(optionsList.querySelectorAll('.poll-option-input'))
                                .map(input => input.value.trim())
                                .filter(value => value !== '');

        // Validação mínima de opções para 'poll'
        if (formData.options.length < 2) {
             alert('Por favor, adicione pelo menos duas opções para a Enquete.');
             return;
        }
    }

    // --- SALVA NO LOCAL STORAGE (USA utils.js) ---
    const savedPoll = savePoll(formData); 

    // 4. Feedback e Redirecionamento
    alert(`Proposta "${savedPoll.title}" publicada com sucesso! Você será redirecionado para a página inicial.`);
    window.location.href = 'index.html';
});


// 4. Inicialização: Garante que a visibilidade correta seja aplicada ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    // Inicializa a exibição de campos
    toggleOptionsVisibility();
    // Inicializa a numeração e visibilidade dos botões de remoção
    renumberOptions(); 
});