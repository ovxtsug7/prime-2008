const TASK_KEY = 'tasks';
const taskForm = document.getElementById('task-form');
const taskList = document.getElementById('task-list');
const submitButton = document.getElementById('submit-button');
const cancelButton = document.getElementById('cancel-button');
const taskIdInput = document.getElementById('task-id');

function getTasks() {
    const tasks = localStorage.getItem(TASK_KEY);
    return tasks ? JSON.parse(tasks) : [];
}

function saveTasks(tasks) {
    localStorage.setItem(TASK_KEY, JSON.stringify(tasks));
}

taskForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const tasks = getTasks();
    const isEditing = taskIdInput.value !== '';

    const newTask = {
        id: isEditing ? taskIdInput.value : Date.now().toString(),
        nome: document.getElementById('nome').value,
        descricao: document.getElementById('descricao').value,
        vencimento: document.getElementById('vencimento').value,
        status: document.getElementById('status').value
    };

    if (isEditing) {
        const index = tasks.findIndex(task => task.id === newTask.id);
        if (index > -1) {
            tasks[index] = newTask;
        }
    } else {
        tasks.push(newTask);
    }

    saveTasks(tasks);
    renderTasks();
    resetForm();
});

function renderTasks() {
    const tasks = getTasks();
    taskList.innerHTML = '';

    tasks.forEach(task => {
        const row = taskList.insertRow();
        
        row.insertCell().textContent = task.nome;
        row.insertCell().textContent = task.vencimento;
        
        const statusCell = row.insertCell();
        statusCell.textContent = task.status;
        statusCell.className = `status-${task.status.replace(' ', '.')}`;
        
        const actionsCell = row.insertCell();

        const editButton = document.createElement('button');
        editButton.textContent = 'Editar';
        editButton.onclick = () => loadTaskForEdit(task.id);
        actionsCell.appendChild(editButton);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Deletar';
        deleteButton.style.marginLeft = '5px';
        deleteButton.onclick = () => deleteTask(task.id);
        actionsCell.appendChild(deleteButton);
    });
}

function loadTaskForEdit(id) {
    const tasks = getTasks();
    const task = tasks.find(t => t.id === id);

    if (task) {
        taskIdInput.value = task.id;
        document.getElementById('nome').value = task.nome;
        document.getElementById('descricao').value = task.descricao;
        document.getElementById('vencimento').value = task.vencimento;
        document.getElementById('status').value = task.status;
        
        submitButton.textContent = 'Salvar Alterações';
        cancelButton.style.display = 'inline';
    }
}

function deleteTask(id) {
    if (confirm('Tem certeza que deseja deletar esta tarefa?')) {
        let tasks = getTasks();
        tasks = tasks.filter(task => task.id !== id); 
        saveTasks(tasks);
        renderTasks();
        resetForm();
    }
}

function resetForm() {
    taskForm.reset();
    taskIdInput.value = '';
    submitButton.textContent = 'Cadastrar Tarefa';
    cancelButton.style.display = 'none';
}

cancelButton.addEventListener('click', resetForm);

document.addEventListener('DOMContentLoaded', renderTasks);