// js/custosFixos.js

document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('#custos-fixos-page')) {
        loadCustosFixos();
        document.getElementById('custoFixoForm').addEventListener('submit', handleCustoFixoSubmit);
        document.getElementById('custoFixoModal').addEventListener('click', (e) => {
            if (e.target.classList.contains('close-button') || e.target.classList.contains('modal')) {
                closeModal('custoFixoModal', clearCustoFixoForm);
            }
        });
        document.getElementById('openAddCustoFixoModal').addEventListener('click', () => {
            clearCustoFixoForm();
            document.getElementById('modalTitle').textContent = 'Adicionar Novo Custo Fixo';
            openModal('custoFixoModal');
        });
    }
});

function loadCustosFixos() {
    const custosFixos = Storage.load('custosFixos');
    const custosFixosList = document.getElementById('custosFixosList');
    custosFixosList.innerHTML = '';

    if (custosFixos.length === 0) {
        custosFixosList.innerHTML = '<tr><td colspan="3" class="text-center">Nenhum custo fixo cadastrado.</td></tr>';
        return;
    }

    let totalMensal = 0;

    custosFixos.forEach(custo => {
        totalMensal += parseFloat(custo.valorMensal);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td data-label="Nome do Custo">${custo.nome}</td>
            <td data-label="Valor Mensal (R$)">${parseFloat(custo.valorMensal).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
            <td data-label="Ações" class="actions">
                <button class="btn btn-info edit-btn" data-id="${custo.id}">Editar</button>
                <button class="btn btn-danger delete-btn" data-id="${custo.id}">Excluir</button>
            </td>
        `;
        custosFixosList.appendChild(row);
    });

    document.getElementById('totalCustosFixosMensais').textContent = totalMensal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', (e) => editCustoFixo(e.target.dataset.id));
    });

    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', (e) => deleteCustoFixo(e.target.dataset.id));
    });
}

function handleCustoFixoSubmit(event) {
    event.preventDefault();

    const custoFixoId = document.getElementById('custoFixoId').value;
    const nome = document.getElementById('custoFixoNome').value;
    const valorMensal = document.getElementById('valorMensal').value;

    if (!nome || !valorMensal) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }

    const newCustoFixo = {
        id: custoFixoId || Storage.generateId(),
        nome: nome,
        valorMensal: parseFloat(valorMensal)
    };

    let success;
    if (custoFixoId) {
        success = Storage.update('custosFixos', custoFixoId, newCustoFixo);
    } else {
        success = Storage.add('custosFixos', newCustoFixo);
    }

    if (success) {
        alert(`Custo Fixo ${custoFixoId ? 'atualizado' : 'cadastrado'} com sucesso!`);
        closeModal('custoFixoModal', clearCustoFixoForm);
        loadCustosFixos();
    } else {
        alert('Falha ao salvar o custo fixo.');
    }
}

function editCustoFixo(id) {
    const custoFixo = Storage.getById('custosFixos', id);
    if (custoFixo) {
        document.getElementById('custoFixoId').value = custoFixo.id;
        document.getElementById('custoFixoNome').value = custoFixo.nome;
        document.getElementById('valorMensal').value = custoFixo.valorMensal;
        document.getElementById('modalTitle').textContent = 'Editar Custo Fixo';
        openModal('custoFixoModal');
    }
}

function deleteCustoFixo(id) {
    if (confirm('Tem certeza que deseja excluir este custo fixo?')) {
        if (Storage.remove('custosFixos', id)) {
            alert('Custo Fixo excluído com sucesso!');
            loadCustosFixos();
        } else {
            alert('Falha ao excluir o custo fixo.');
        }
    }
}

function clearCustoFixoForm() {
    document.getElementById('custoFixoForm').reset();
    document.getElementById('custoFixoId').value = '';
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'flex';
    setTimeout(() => {
        modal.classList.add('open');
    }, 10);
}

function closeModal(modalId, callback = null) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('open');
    modal.addEventListener('transitionend', function handler() {
        modal.style.display = 'none';
        if (callback) {
            callback();
        }
        modal.removeEventListener('transitionend', handler);
    }, { once: true });
}
