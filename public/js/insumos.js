// VEEX - Sistema de Gestão de Custos e Produção
// Arquivo: insumos.js
// Descrição: Funções específicas para a página de Insumos

// Carregar insumos
function loadInsumos() {
    console.log("Carregando insumos...");
    const insumos = getInsumos();
    const tableBody = document.querySelector('#tabelaInsumos tbody') || document.querySelector('table tbody');
    
    if (!tableBody) {
        console.error('Elemento tbody não encontrado');
        return;
    }
    
    // Limpar tabela
    tableBody.innerHTML = '';
    
    if (insumos.length === 0) {
        // Mostrar mensagem de nenhum insumo
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="4" class="text-center">Nenhum insumo cadastrado.</td>`;
        tableBody.appendChild(row);
        return;
    }
    
    // Preencher tabela com dados
    insumos.forEach(insumo => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${insumo.nome}</td>
            <td>${insumo.unidade}</td>
            <td>${formatCurrency(insumo.custo)}</td>
            <td>
                <button class="btn-icon btn-edit" onclick="editInsumo(${insumo.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon btn-delete" onclick="deleteInsumo(${insumo.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Atualizar contador
    const totalInsumos = document.getElementById('totalInsumos');
    if (totalInsumos) {
        totalInsumos.textContent = insumos.length;
    }
}

// Adicionar insumo
function addInsumo(insumo) {
    const insumos = getInsumos();
    insumo.id = generateId('insumos');
    insumos.push(insumo);
    saveInsumos(insumos);
    return insumo;
}

// Atualizar insumo
function updateInsumo(insumo) {
    const insumos = getInsumos();
    const index = insumos.findIndex(i => i.id === insumo.id);
    
    if (index !== -1) {
        insumos[index] = insumo;
        saveInsumos(insumos);
        return true;
    }
    
    return false;
}

// Excluir insumo
function deleteInsumo(id) {
    if (confirm('Tem certeza que deseja excluir este insumo?')) {
        if (deleteItem('insumos', id)) {
            showNotification('Insumo excluído com sucesso');
            loadInsumos();
        } else {
            showNotification('Erro ao excluir insumo', 'error');
        }
    }
}

// Editar insumo
function editInsumo(id) {
    const insumo = getInsumoById(id);
    
    if (!insumo) {
        showNotification('Insumo não encontrado', 'error');
        return;
    }
    
    // Preencher formulário
    const form = document.getElementById('formInsumo') || document.querySelector('form');
    if (!form) return;
    
    form.setAttribute('data-id', insumo.id);
    
    const inputNome = document.getElementById('nomeInsumo') || document.querySelector('input[name="nome"]');
    const inputUnidade = document.getElementById('unidadeInsumo') || document.querySelector('input[name="unidade"]');
    const inputCusto = document.getElementById('custoInsumo') || document.querySelector('input[name="custo"]');
    
    if (inputNome) inputNome.value = insumo.nome;
    if (inputUnidade) inputUnidade.value = insumo.unidade;
    if (inputCusto) inputCusto.value = insumo.custo;
    
    // Abrir modal
    openModal('insumoModal');
}

// Manipular envio do formulário de insumo
function handleInsumoSubmit(e) {
    if (e) e.preventDefault();
    
    const form = document.getElementById('formInsumo') || document.querySelector('form');
    
    if (!form) {
        console.error('Formulário não encontrado');
        return;
    }
    
    // Obter valores do formulário
    const id = form.getAttribute('data-id');
    const inputNome = document.getElementById('nomeInsumo') || document.querySelector('input[name="nome"]');
    const inputUnidade = document.getElementById('unidadeInsumo') || document.querySelector('input[name="unidade"]');
    const inputCusto = document.getElementById('custoInsumo') || document.querySelector('input[name="custo"]');
    
    if (!inputNome || !inputUnidade || !inputCusto) {
        console.error('Campos do formulário não encontrados');
        return;
    }
    
    const nome = inputNome.value;
    const unidade = inputUnidade.value;
    const custo = parseFloat(inputCusto.value);
    
    // Validar campos
    if (!nome || !unidade || isNaN(custo)) {
        showNotification('Preencha todos os campos corretamente', 'error');
        return;
    }
    
    // Criar objeto de insumo
    const insumo = {
        nome,
        unidade,
        custo
    };
    
    // Adicionar ou atualizar insumo
    if (id) {
        insumo.id = parseInt(id);
        updateInsumo(insumo);
        showNotification('Insumo atualizado com sucesso');
    } else {
        addInsumo(insumo);
        showNotification('Insumo adicionado com sucesso');
    }
    
    // Fechar modal e recarregar dados
    closeModal('insumoModal');
    loadInsumos();
    
    // Limpar formulário
    clearInsumoForm();
}

// Limpar formulário de insumo
function clearInsumoForm() {
    const form = document.getElementById('formInsumo') || document.querySelector('form');
    
    if (!form) {
        return;
    }
    
    form.removeAttribute('data-id');
    form.reset();
}

// Obter insumos do localStorage
function getInsumos() {
    return JSON.parse(localStorage.getItem('veex_insumos')) || [];
}

// Salvar insumos no localStorage
function saveInsumos(insumos) {
    localStorage.setItem('veex_insumos', JSON.stringify(insumos));
}

// Obter insumo por ID
function getInsumoById(id) {
    const insumos = getInsumos();
    return insumos.find(insumo => insumo.id === id);
}

// Inicializar página de insumos
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se estamos na página de insumos
    if (!window.location.pathname.includes('insumos.html')) {
        return;
    }
    
    console.log('Inicializando página de insumos...');
    
    // Carregar insumos
    loadInsumos();
    
    // Adicionar evento ao botão de adicionar insumo
    const addButton = document.getElementById('addInsumoBtn') || document.querySelector('button:nth-child(1)');
    
    if (addButton) {
        console.log('Botão de adicionar insumo encontrado:', addButton);
        
        // Adicionar atributo data-modal se não existir
        if (!addButton.hasAttribute('data-modal')) {
            addButton.setAttribute('data-modal', 'insumoModal');
        }
        
        // Remover listeners existentes para evitar duplicação
        addButton.removeEventListener('click', function() { openModal('insumoModal'); });
        
        // Adicionar novo listener
        addButton.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Botão de adicionar insumo clicado');
            clearInsumoForm();
            openModal('insumoModal');
        });
    }
    
    // Adicionar evento ao formulário
    const formInsumo = document.getElementById('formInsumo') || document.querySelector('form');
    
    if (formInsumo) {
        console.log('Formulário de insumo encontrado');
        
        // Remover listeners existentes para evitar duplicação
        formInsumo.removeEventListener('submit', handleInsumoSubmit);
        
        // Adicionar novo listener
        formInsumo.addEventListener('submit', handleInsumoSubmit);
    }
    
    // Adicionar evento ao botão de salvar no formulário
    const saveButton = document.querySelector('button[type="submit"]') || document.querySelector('.btn-primary');
    
    if (saveButton) {
        console.log('Botão de salvar encontrado');
        
        // Remover listeners existentes para evitar duplicação
        saveButton.removeEventListener('click', handleInsumoSubmit);
        
        // Adicionar novo listener
        saveButton.addEventListener('click', handleInsumoSubmit);
    }
});

// Função auxiliar para excluir item de qualquer coleção
function deleteItem(collection, id) {
    const items = JSON.parse(localStorage.getItem(`veex_${collection}`)) || [];
    const index = items.findIndex(item => item.id === id);
    
    if (index !== -1) {
        items.splice(index, 1);
        localStorage.setItem(`veex_${collection}`, JSON.stringify(items));
        return true;
    }
    
    return false;
}
