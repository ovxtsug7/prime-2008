/**
 * Arquivo: user.js
 * Descrição: Lógica para as páginas de Configurações e Notificações, 
 * além de gerenciar a sidebar em todas as páginas.
 * Depende de: utils.js
 */

// ------------------------------------
// FUNÇÕES GERAIS (Sidebar e Header)
// ------------------------------------

/** Renderiza a imagem de avatar ou o inicial na sidebar e main avatar. */
function renderAvatar(profile) {
    // 1. Sidebar Avatar
    const sidebarAvatar = document.getElementById('sidebar-user-avatar');
    if (sidebarAvatar) {
        if (profile.avatar) {
            sidebarAvatar.style.backgroundImage = `url(${profile.avatar})`;
            sidebarAvatar.innerHTML = ''; // Limpa o fallback
            sidebarAvatar.classList.remove('user-icon'); 
        } else {
            sidebarAvatar.style.backgroundImage = 'none';
            sidebarAvatar.innerHTML = `<span>${profile.name ? profile.name[0].toUpperCase() : '👤'}</span>`;
            sidebarAvatar.classList.add('user-icon');
        }
    }
    
    // 2. Main Profile Avatar (apenas na settings.html)
    const mainAvatar = document.getElementById('main-profile-avatar');
    if (mainAvatar) {
        if (profile.avatar) {
            mainAvatar.style.backgroundImage = `url(${profile.avatar})`;
            mainAvatar.innerHTML = ''; // Limpa o fallback
        } else {
            mainAvatar.style.backgroundImage = 'none';
            mainAvatar.innerHTML = `<span>${profile.name ? profile.name[0].toUpperCase() : '👤'}</span>`;
        }
    }
}


/** Atualiza o nome do usuário e o contador de notificações na sidebar. */
function updateSidebar() {
    if (typeof getUserProfile !== 'function' || typeof getUnreadCount !== 'function') return; 

    const profile = getUserProfile();
    const unreadCount = getUnreadCount(); 
    
    const nameElement = document.getElementById('sidebar-user-name');
    const badgeElement = document.getElementById('unread-count-badge');
    
    if (nameElement) {
        // Exibe o primeiro nome do usuário
        nameElement.textContent = profile.name.split(' ')[0]; 
    }
    
    if (badgeElement) {
        if (unreadCount > 0) {
            badgeElement.textContent = unreadCount;
            badgeElement.style.display = 'inline-block';
        } else {
            badgeElement.textContent = '';
            badgeElement.style.display = 'none';
        }
    }
    
    renderAvatar(profile); // Atualiza o avatar na sidebar
}

// ------------------------------------
// LÓGICA DA PÁGINA DE CONFIGURAÇÕES (settings.html)
// ------------------------------------

function initSettingsPage() {
    const settingsForm = document.getElementById('settings-form');
    if (!settingsForm) return; 

    let profile = getUserProfile(); // Use 'let' para reatribuir após o save
    
    // Carregar dados e atualizar UI
    document.getElementById('user-name').value = profile.name;
    document.getElementById('user-email').value = profile.email;
    document.getElementById('user-bio').value = profile.bio;
    document.getElementById('notifications-toggle').checked = profile.notificationsEnabled;
    document.getElementById('profile-name').textContent = profile.name;
    document.getElementById('profile-email').textContent = profile.email;
    renderAvatar(profile);


    // --- Lógica de Upload de Avatar (Foto de Perfil) ---
    const avatarInput = document.getElementById('avatar-upload');
    const removeAvatarBtn = document.getElementById('remove-avatar-btn');

    avatarInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;

        // Simulação de limite de 1MB
        if (file.size > 1024 * 1024) { 
            alert('A imagem deve ter no máximo 1MB.');
            avatarInput.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = function(event) {
            // Salva a imagem em Base64 no perfil
            profile.avatar = event.target.result;
            saveUserProfile(profile);
            updateSidebar(); 
            renderAvatar(profile); 
            alert('Foto de perfil atualizada com sucesso.');
        };
        reader.readAsDataURL(file);
    });

    removeAvatarBtn.addEventListener('click', () => {
        if (confirm('Tem certeza que deseja remover sua foto de perfil?')) {
            profile.avatar = null;
            saveUserProfile(profile);
            updateSidebar();
            renderAvatar(profile);
            avatarInput.value = ''; // Limpa o input file
            alert('Foto de perfil removida.');
        }
    });

    // --- Lógica de Submissão do Formulário (Nome/Bio/Prefs) ---
    settingsForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const newProfileData = {
            name: document.getElementById('user-name').value.trim(),
            bio: document.getElementById('user-bio').value.trim(),
            notificationsEnabled: document.getElementById('notifications-toggle').checked
        };
        
        // Mantém email, password e avatar existentes, mas atualiza o resto
        const updatedProfile = {...profile, ...newProfileData};
        saveUserProfile(updatedProfile);
        
        profile = updatedProfile; // Atualiza a variável local
        
        updateSidebar(); 
        alert('Informações de perfil e preferências atualizadas com sucesso!');
        initSettingsPage(); // Recarrega os dados na página
    });

    // --- Lógica de Mudar Senha ---
    document.getElementById('change-password-btn').addEventListener('click', () => {
        const currentPass = document.getElementById('current-password').value;
        const newPass = document.getElementById('new-password').value;
        const confirmPass = document.getElementById('confirm-password').value;

        if (currentPass.length === 0 || newPass.length === 0 || confirmPass.length === 0) {
            alert('Por favor, preencha todos os campos de senha.');
            return;
        }

        // SIMULAÇÃO: verificação da senha atual
        if (currentPass !== profile.password) {
            alert('Erro: Senha atual incorreta.');
            return;
        }

        if (newPass.length < 6) {
            alert('Erro: A nova senha deve ter no mínimo 6 caracteres.');
            return;
        }

        if (newPass !== confirmPass) {
            alert('Erro: A nova senha e a confirmação não correspondem.');
            return;
        }

        // Salva a nova senha
        profile.password = newPass; 
        saveUserProfile(profile);
        
        // Limpa os campos de senha
        document.getElementById('current-password').value = '';
        document.getElementById('new-password').value = '';
        document.getElementById('confirm-password').value = '';

        alert('Senha alterada com sucesso!');
    });
}


// ------------------------------------
// LÓGICA DA PÁGINA DE NOTIFICAÇÕES (notifications.html)
// ------------------------------------

function initNotificationsPage() {
    const notificationsList = document.getElementById('notification-list');
    const noNotificationsMessage = document.getElementById('no-notifications');
    const markAllReadBtn = document.getElementById('mark-all-read-btn');
    
    if (!notificationsList) return; 

    function renderNotifications() {
        const notifications = getNotifications();
        notificationsList.innerHTML = '';
        
        if (notifications.length === 0) {
            noNotificationsMessage.style.display = 'block';
            if(markAllReadBtn) markAllReadBtn.style.display = 'none';
            return;
        }

        noNotificationsMessage.style.display = 'none';
        if(markAllReadBtn) markAllReadBtn.style.display = 'inline-block';

        notifications.forEach(notif => {
            const item = document.createElement('li');
            item.classList.add('notification-item');
            if (!notif.read) {
                item.classList.add('unread');
            }
            item.dataset.id = notif.id;

            const time = new Date(notif.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            const date = new Date(notif.timestamp).toLocaleDateString('pt-BR');
            
            item.innerHTML = `
                <div class="notification-content">
                    <strong>[${notif.type.toUpperCase()}]</strong> ${notif.message}
                    <div class="notification-meta">Recebida em: ${date} às ${time}</div>
                </div>
            `;
            
            if (!notif.read) {
                const markBtn = document.createElement('button');
                markBtn.classList.add('mark-read-btn');
                markBtn.textContent = 'Marcar como lida';
                markBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    markNotificationAsRead(notif.id);
                    renderNotifications();
                    updateSidebar();
                });
                item.appendChild(markBtn);
            } else {
                // Adiciona um placeholder invisível para manter o alinhamento
                item.style.paddingRight = '20px'; 
            }

            notificationsList.appendChild(item);
        });
    }
    
    if (markAllReadBtn) {
        markAllReadBtn.addEventListener('click', () => {
            if (confirm('Tem certeza que deseja marcar TODAS as notificações como lidas?')) {
                // Marca todas as notificações como lidas de uma vez
                const notifications = getNotifications();
                notifications.forEach(notif => {
                    if (!notif.read) {
                        markNotificationAsRead(notif.id);
                    }
                });
                renderNotifications();
                updateSidebar();
            }
        });
    }

    renderNotifications();
}


// ------------------------------------
// INICIALIZAÇÃO GERAL
// ------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    updateSidebar();
    initSettingsPage();
    // Chama initNotificationsPage apenas se o elemento principal existir (na página de notificações)
    if (document.getElementById('notification-list')) {
        initNotificationsPage();
    }
});