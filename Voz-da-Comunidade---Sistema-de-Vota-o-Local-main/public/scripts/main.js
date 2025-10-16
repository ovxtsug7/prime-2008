// main.js

// Dados de Filtro (Tags e seus nomes visíveis)
const FILTER_TAGS = {
    'educacao': 'Educação',
    'infraestrutura': 'Infraestrutura',
    'seguranca': 'Segurança',
    'cultura': 'Eventos/Cultura',
    'meio_ambiente': 'Meio Ambiente',
    'saude': 'Saúde',
    'transporte': 'Transporte'
};

// Elementos DOM
const openModalBtn = document.getElementById('open-filters-modal');
const modalOverlay = document.getElementById('filters-modal');
const closeModalBtns = modalOverlay.querySelectorAll('.close-modal-btn');
const resetBtn = document.getElementById('reset-filters-btn');
const saveBtn = document.getElementById('save-filters-btn');
const optionsList = document.getElementById('filter-options-list');
const activeChipsContainer = document.querySelector('.filter-chips-container');
const searchInput = document.getElementById('search-input'); // Usando ID agora

// Variáveis de Estado
// activeFilters: Filtros APLICADOS e VISÍVEIS no cabeçalho.
let activeFilters = {}; 
// tempFilters: Filtros ATUAIS no modal (usados para resetar/salvar).
let tempFilters = {}; 


// ------------------------------------
// LÓGICA DO MODAL (FUNÇÕES EXISTENTES E MELHORADAS)
// ------------------------------------

/** Abre o modal e carrega os filtros ativos para edição. */
function openModal() {
    // 1. Clonar os filtros ativos para edição temporária
    tempFilters = JSON.parse(JSON.stringify(activeFilters)); 
    
    // 2. Renderizar os chips de filtro no modal com o estado correto
    renderModalFilters();
    
    // 3. Mostrar o modal
    modalOverlay.classList.add('active');
}

/** Fecha o modal e limpa a área de edição temporária. */
function closeModal() {
    modalOverlay.classList.remove('active');
    tempFilters = {};
}

/** * Alterna o estado de um chip de filtro: 
 * Nulo -> Included -> Excluded -> Nulo
 */
function toggleModalFilterState(key) {
    const currentState = tempFilters[key];

    if (!currentState) {
        tempFilters[key] = 'included';
    } else if (currentState === 'included') {
        tempFilters[key] = 'excluded';
    } else { // currentState === 'excluded'
        delete tempFilters[key];
    }
    renderModalFilters();
}

/** Renderiza a lista de chips de filtro dentro do modal. */
function renderModalFilters() {
    optionsList.innerHTML = ''; // Limpa os chips atuais
    
    Object.keys(FILTER_TAGS).forEach(key => {
        const state = tempFilters[key] || 'none';
        const name = FILTER_TAGS[key];

        const chip = document.createElement('div');
        chip.classList.add('modal-filter-chip', state);
        chip.textContent = name;
        chip.dataset.filterKey = key;
        
        // Listener para mudar o estado do chip
        chip.addEventListener('click', () => toggleModalFilterState(key));
        
        optionsList.appendChild(chip);
    });
}

/** Salva os filtros temporários como filtros ativos e fecha o modal. */
function saveFilters() {
    activeFilters = JSON.parse(JSON.stringify(tempFilters));
    renderActiveChips();
    applyFilters(); // NOVO: Aplica a filtragem real
    closeModal();
}

/** Limpa os filtros temporários no modal. */
function resetModalFilters() {
    tempFilters = {};
    renderModalFilters();
}

/** Renderiza os chips de filtro ativos no cabeçalho da página principal. */
function renderActiveChips() {
    activeChipsContainer.innerHTML = '';

    const activeKeys = Object.keys(activeFilters).filter(key => activeFilters[key] !== 'none');

    activeKeys.forEach(key => {
        const value = FILTER_TAGS[key];
        const state = activeFilters[key]; // 'included' ou 'excluded'

        const chip = document.createElement('div');
        chip.classList.add('active-filter-chip', state);
        chip.textContent = `${value} (${state === 'excluded' ? 'Excluído' : 'Incluído'})`;

        // Botão para remover o filtro
        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'x';
        removeBtn.addEventListener('click', () => {
             // Remove diretamente do filtro ativo
            delete activeFilters[key]; 
            renderActiveChips(); 
            applyFilters();
        });
        chip.appendChild(removeBtn);
        
        activeChipsContainer.appendChild(chip);
    });
    
    if (activeKeys.length === 0) {
        activeChipsContainer.innerHTML = '<span style="color: #999;">Nenhum filtro ativo.</span>';
    }
}


// ------------------------------------
// LÓGICA DA BUSCA E VOTAÇÃO (FUNCIONAL)
// ------------------------------------

/**
 * Renderiza o gráfico de resultados para enquetes (Múltipla Escolha).
 */
function renderPollResults(poll) {
    // Calcula o total de votos em todas as opções
    const totalVotes = Object.values(poll.votes).reduce((sum, count) => sum + count, 0);

    let html = '<div class="poll-results-chart">';
    
    // Lista de pares [opção, votos] para ordenar
    const optionsWithVotes = poll.options.map(option => ({
        name: option,
        votes: poll.votes[option] || 0
    }));

    // Ordena pela quantidade de votos (do maior para o menor)
    optionsWithVotes.sort((a, b) => b.votes - a.votes);
    
    optionsWithVotes.forEach(item => {
        const votes = item.votes;
        const percentage = totalVotes === 0 ? 0 : (votes / totalVotes) * 100;
        const widthStyle = `width: ${percentage}%`;

        html += `
            <div class="result-row">
                <div class="result-bar" style="${widthStyle}"></div>
                <span class="option-label">${item.name}</span>
                <span class="vote-count">${votes} votos (${percentage.toFixed(0)}%)</span>
            </div>
        `;
    });
    
    html += `</div><div class="poll-total-votes">Total de votos: ${totalVotes}</div>`;
    return html;
}

/**
 * Cria o HTML para um único cartão de proposta/votação (renderização dinâmica).
 */
function createPollCardHTML(poll) {
    const hasVoted = hasUserVoted(poll.id);
    const userVote = getUserVotes()[poll.id];

    let contentHTML = '';
    let votesHTML = '';
    
    // Configuração do Rodapé
    let pollFooterContent = `<span class="poll-meta">Categoria: ${FILTER_TAGS[poll.category] || 'Geral'}</span>`;

    if (poll.type === 'voting') {
        // Votação (Upvote/Downvote)
        const upvotes = poll.votes.up || 0;
        const downvotes = poll.votes.down || 0;
        const totalScore = upvotes - downvotes;

        votesHTML = `
            <div class="poll-votes" data-poll-id="${poll.id}" data-poll-type="voting">
                <button class="vote-button ${hasVoted && userVote === 'up' ? 'voted-up' : ''}" data-vote-key="up" ${hasVoted ? 'disabled' : ''}>
                    ⇧
                </button>
                <span class="total-score-badge">${totalScore}</span>
                <button class="vote-button downvote-button ${hasVoted && userVote === 'down' ? 'voted-down' : ''}" data-vote-key="down" ${hasVoted ? 'disabled' : ''}>
                    ⇩
                </button>
            </div>
        `;
        contentHTML = `<p class="poll-description">${poll.description}</p>`;
        pollFooterContent += `<span class="poll-meta"> | Tipo: Votação Simples</span>`;

    } else {
        // Enquete (Múltipla Escolha)
        // Se o usuário votou, mostra os resultados do gráfico. Caso contrário, mostra os botões de opção.
        if (hasVoted) {
            contentHTML = `<p class="poll-description">${poll.description}</p>`;
            contentHTML += renderPollResults(poll);
        } else {
            // Renderiza as opções para votação
            contentHTML = `<p class="poll-description">${poll.description}</p>`;
            contentHTML += '<div class="poll-options-list" data-poll-id="${poll.id}" data-poll-type="poll">';
            poll.options.forEach(option => {
                contentHTML += `<button class="poll-option-btn primary-btn" data-vote-key="${option}">${option}</button>`;
            });
            contentHTML += '</div>';
        }
        
        pollFooterContent += `<span class="poll-meta"> | Tipo: Enquete ${poll.isMultipleChoice ? '(Múltipla)' : '(Única)'}</span>`;
    }

    // Botões de Ação (Comentários, Editar, Deletar)
    // A simulação de autor é "Usuário Padrão"
    const actionButtons = `
        <div class="poll-actions">
            <button class="action-btn comment-btn">Comentar</button>
            ${poll.author === 'Usuário Padrão' ? `<button class="action-btn edit-btn" data-poll-id="${poll.id}">Editar</button>
            <button class="action-btn delete-btn" data-poll-id="${poll.id}">Excluir</button>` : ''}
        </div>
    `;

    return `
        <article class="poll-card" data-poll-id="${poll.id}" data-category="${poll.category}" data-type="${poll.type}">
            <div class="poll-header-info">
                <h2 class="poll-title">${poll.title}</h2>
                ${votesHTML}
            </div>
            ${contentHTML}
            <div class="poll-footer">
                ${pollFooterContent}
                ${actionButtons}
            </div>
        </article>
    `;
}

/**
 * Adiciona listeners de evento para os botões de votação e ações.
 */
function addVoteListeners() {
    // Listener principal para Votações (Upvote/Downvote)
    document.querySelectorAll('.poll-card[data-type="voting"] .vote-button').forEach(button => {
        // Remove listeners antigos para evitar duplicação em re-render
        button.onclick = null; 
        
        button.onclick = function() {
            const pollId = this.closest('.poll-votes').dataset.pollId;
            const voteKey = this.dataset.voteKey; // 'up' ou 'down'

            if (registerVote(pollId, voteKey)) { // Usa a função de utils.js
                // alert('Voto registrado com sucesso!');
                renderPolls(searchInput.value, activeFilters); // Re-renderiza para atualizar placar/estado
            } else {
                alert('Voto duplicado: Você já votou nesta proposta!');
            }
        };
    });

    // Listener principal para Enquetes (Opções)
    document.querySelectorAll('.poll-card[data-type="poll"] .poll-option-btn').forEach(button => {
        // Remove listeners antigos para evitar duplicação em re-render
        button.onclick = null; 
        
        button.onclick = function() {
            const pollId = this.closest('.poll-options-list').dataset.pollId;
            const voteKey = this.dataset.voteKey; // Nome da opção

            if (registerVote(pollId, voteKey)) { // Usa a função de utils.js
                // alert('Voto registrado com sucesso! Exibindo resultados...');
                renderPolls(searchInput.value, activeFilters); // Re-renderiza para mostrar o gráfico
            } else {
                alert('Voto duplicado: Você já votou nesta enquete!');
            }
        };
    });

    // Listener para o botão de EXCLUIR
    document.querySelectorAll('.poll-card .delete-btn').forEach(button => {
        button.onclick = null; 

        button.onclick = function() {
            const pollId = this.dataset.pollId;
            if (confirm('Tem certeza que deseja EXCLUIR esta proposta? Esta ação é irreversível.')) {
                deletePoll(pollId); // Usa a função de utils.js
                alert('Proposta excluída com sucesso.');
                renderPolls(searchInput.value, activeFilters);
            }
        }
    });

    // Listener para o botão de EDITAR (Apenas placeholder)
    document.querySelectorAll('.poll-card .edit-btn').forEach(button => {
        button.onclick = null; 
        button.onclick = () => alert('Funcionalidade de Edição (A Ser Implementada)');
    });
    
     // Listener para o botão de COMENTAR (Apenas placeholder)
    document.querySelectorAll('.poll-card .comment-btn').forEach(button => {
        button.onclick = null; 
        button.onclick = () => alert('Funcionalidade de Comentários (A Ser Implementada)');
    });
}

/**
 * Função principal para buscar, filtrar e renderizar todas as propostas.
 */
function renderPolls(searchQuery = '', filterState = {}) {
    const pollsContainer = document.getElementById('polls-list-container');
    const allPolls = getPolls(); // Busca todas as propostas
    pollsContainer.innerHTML = ''; // Limpa o conteúdo atual
    let filteredPolls = [...allPolls];

    // 1. Filtragem por Categoria e Tipo (Filtros do Modal)
    filteredPolls = filteredPolls.filter(poll => {
        const pollCategory = poll.category;
        const state = filterState[pollCategory];
        
        // Se a categoria for explicitamente excluída, remove
        if (state === 'excluded') {
            return false;
        }

        // Se houver filtros de 'included' ativos, verifica se a categoria está incluída
        const includedFilters = Object.keys(filterState).filter(key => filterState[key] === 'included');
        
        // Se houver filtros de 'included', a proposta só é mostrada se estiver na lista de inclusão
        if (includedFilters.length > 0) {
            return state === 'included';
        }
        
        // Caso contrário (sem filtros ou apenas exclusão), mantém
        return true; 
    });

    // 2. Filtragem por Busca (Search Bar)
    if (searchQuery.trim() !== '') {
        const query = searchQuery.trim().toLowerCase();
        filteredPolls = filteredPolls.filter(poll =>
            poll.title.toLowerCase().includes(query) ||
            poll.description.toLowerCase().includes(query) ||
            poll.category.toLowerCase().includes(query) ||
            poll.author.toLowerCase().includes(query)
        );
    }

    // 3. Renderização
    if (filteredPolls.length === 0) {
        pollsContainer.innerHTML = '<p class="no-results-message" style="padding: 20px; text-align: center; color: #555;">Nenhuma proposta encontrada com os critérios de busca/filtro.</p>';
        return;
    }

    filteredPolls.forEach(poll => {
        pollsContainer.innerHTML += createPollCardHTML(poll);
    });

    // 4. Re-adicionar listeners de voto e ações
    addVoteListeners();
}

/** Função principal para aplicar os filtros salvos no conteúdo. */
function applyFilters() {
    // Usa o valor atual da busca e os filtros ativos para renderizar
    renderPolls(searchInput.value, activeFilters);
}

// --- EVENT LISTENERS (Inicialização) ---

// Abrir o modal
openModalBtn.addEventListener('click', openModal);

// Fechar o modal (botão X e overlay)
closeModalBtns.forEach(btn => btn.addEventListener('click', closeModal));
modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
        closeModal();
    }
});

// Botão Limpar Tudo
resetBtn.addEventListener('click', resetModalFilters);

// Botão Aplicar/Salvar
saveBtn.addEventListener('click', saveFilters);

// NOVO: Listener para a Busca em Tempo Real
searchInput.addEventListener('input', () => {
    renderPolls(searchInput.value, activeFilters);
});

// Renderizar o estado inicial
document.addEventListener('DOMContentLoaded', () => {
    // Inicializa a renderização de chips ativos e chama a renderização das propostas
    renderActiveChips(); 
    renderPolls(); 
    // Garante que o ID de usuário existe
    getUserId();
});