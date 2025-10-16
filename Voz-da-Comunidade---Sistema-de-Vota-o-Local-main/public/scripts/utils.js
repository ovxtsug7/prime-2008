/**
 * Arquivo: utils.js
 * Descrição: Funções de persistência de dados usando localStorage
 */

const STORAGE_KEY = 'community_polls';
const VOTES_KEY = 'community_user_votes';
const USER_PROFILE_KEY = 'community_user_profile';
const NOTIFICATIONS_KEY = 'community_notifications';

/** * Gera um ID de usuário único e persistente no localStorage. */
function getUserId() {
    let userId = localStorage.getItem('user_id');
    if (!userId) {
        userId = 'user-' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
        localStorage.setItem('user_id', userId);
    }
    return userId;
}

function generateUniqueId() {
    return 'poll-' + Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// ---- ENQUETES ----

/** Busca todas as propostas salvas no localStorage. */
function getPolls() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

/** Salva uma nova proposta no localStorage. */
function savePoll(pollData) {
    const polls = getPolls();
    
    const newPoll = {
        id: generateUniqueId(),
        created_at: new Date().toISOString(),
        author: getUserProfile().name, // Usa o nome real do perfil
        votes: {}, 
        ...pollData
    };

    if (newPoll.type === 'voting') {
        newPoll.votes = { up: 0, down: 0 };
    } else {
        newPoll.votes = {};
        newPoll.options.forEach(option => {
            newPoll.votes[option] = 0;
        });
    }

    polls.unshift(newPoll);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(polls));
    addNotification('creation', `Sua proposta "${newPoll.title.substring(0, 20)}..." foi publicada!`, newPoll.id);
    return newPoll;
}

/** Deleta uma proposta pelo ID. */
function deletePoll(pollId) {
    let polls = getPolls();
    polls = polls.filter(poll => poll.id !== pollId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(polls));
}

// ---- VOTOS ----

/** Obtém o registro de votos do usuário. */
function getUserVotes() {
    const data = localStorage.getItem(VOTES_KEY);
    return data ? JSON.parse(data) : {};
}

/** Verifica se o usuário já votou em uma proposta. */
function hasUserVoted(pollId) {
    const userVotes = getUserVotes();
    return userVotes.hasOwnProperty(pollId);
}

/** Registra um voto e atualiza a contagem. */
function registerVote(pollId, voteKey) {
    if (hasUserVoted(pollId)) {
        return false;
    }

    const userVotes = getUserVotes();
    userVotes[pollId] = voteKey;
    localStorage.setItem(VOTES_KEY, JSON.stringify(userVotes));

    let polls = getPolls();
    const pollIndex = polls.findIndex(p => p.id === pollId);

    if (pollIndex !== -1) {
        polls[pollIndex].votes[voteKey] = (polls[pollIndex].votes[voteKey] || 0) + 1;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(polls));
        return true;
    }
    return false;
}

// ---- PERFIL DO USUÁRIO (NOVO) ----

/** Obtém o perfil do usuário ou um perfil default. */
function getUserProfile() {
    const defaultProfile = {
        name: 'Usuário Padrão',
        email: 'usuario.padrao@comunidade.com',
        bio: 'Membro ativo da comunidade!',
        avatar: null, // Campo para Base64 da imagem
        password: 'password123', // Senha inicial simulada
        notificationsEnabled: true
    };
    const profile = localStorage.getItem(USER_PROFILE_KEY);
    // Mescla perfil salvo com defaults para garantir que novos campos existam
    return profile ? {...defaultProfile, ...JSON.parse(profile)} : defaultProfile;
}

/** Salva as alterações do perfil do usuário. */
function saveUserProfile(profileData) {
    // Busca o perfil atual e mescla os novos dados, preservando os campos não passados
    const currentProfile = getUserProfile();
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify({...currentProfile, ...profileData}));
}

// ---- NOTIFICAÇÕES (NOVO) ----

/** Obtém a lista de notificações (mais recentes primeiro). */
function getNotifications() {
    const data = localStorage.getItem(NOTIFICATIONS_KEY);
    return data ? JSON.parse(data) : [];
}

/** Adiciona uma nova notificação ao topo da lista. */
function addNotification(type, message, relatedPollId = null) {
    if (!getUserProfile().notificationsEnabled) return; // Checa as preferências
    
    const notifications = getNotifications();
    const newNotification = {
        id: generateUniqueId(),
        type: type, 
        message: message,
        read: false,
        timestamp: new Date().toISOString(),
        relatedPollId: relatedPollId
    };
    notifications.unshift(newNotification);
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
}

/** Marca uma notificação específica como lida. */
function markNotificationAsRead(id) {
    const notifications = getNotifications();
    const index = notifications.findIndex(n => n.id === id);
    if (index !== -1) {
        notifications[index].read = true;
        localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
    }
}

/** Retorna o número de notificações não lidas. */
function getUnreadCount() {
    const notifications = getNotifications();
    return notifications.filter(n => !n.read).length;
}

// SIMULAÇÃO: Adicionar notificações iniciais (apenas se a lista estiver vazia)
if (getNotifications().length === 0) {
    addNotification('welcome', 'Bem-vindo(a)! Edite seu perfil na seção Configurações.', null);
    addNotification('new_feature', 'Novidade! O sistema de busca e filtros está ativo.', null);
}