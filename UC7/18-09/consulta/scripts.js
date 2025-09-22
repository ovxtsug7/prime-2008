document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('formAgendamento');
    const listaConsultas = document.getElementById('listaConsultas');

    form.addEventListener('submit', (event) => {
        event.preventDefault(); // Prevents the form from submitting in the traditional way

        const nomePaciente = document.getElementById('nomePaciente').value;
        const especialidade = document.getElementById('especialidade').value;
        const motivo = document.getElementById('motivo').value;
        const data = document.getElementById('data').value;
        const horario = document.getElementById('horario').value;

        // Create a new list item for the appointment
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <strong>Paciente:</strong> ${nomePaciente} <br>
            <strong>Especialidade:</strong> ${especialidade} <br>
            <strong>Motivo:</strong> ${motivo} <br>
            <strong>Data:</strong> ${formatDate(data)} <br>
            <strong>Horário:</strong> ${horario}
        `;

        // Add the new item to the list
        listaConsultas.appendChild(listItem);

        // Reset the form after submission
        form.reset();
    });

    // Helper function to format the date
    function formatDate(dateString) {
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    }
});