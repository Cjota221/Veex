// VEEX - Sistema de Gestão de Custos e Produção
// Arquivo: estoque.js
// Descrição: Funções específicas para a página de Estoque

// Carregar estoque
function loadEstoque() {
    console.log("Carregando estoque...");
    const estoque = getEstoque();
    const tableBody = document.querySelector('#tabelaEstoque tbody') || document.querySelector('table tbody');
    
    if (!tableBody) {
        console.error('Elemento tbody não encontrado');
        return;
    }
    
    // Limpar tabela
    tableBody.innerHTML = '';
    
    if (estoque.length === 0) {
        // Mostrar mensagem de nenhum item em estoque
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="5" class="text-center">Nenhum item em estoque.</td>`;
        tableBody.appendChild(row);
        return;
    }
    
    // Preencher tabela com dados
    estoque.forEach(item => {
        const modelo = getModeloById(parseInt(item.modelo));
        const nomeModelo = modelo ? modelo.nome : 'Modelo não encontrado';
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${nomeModelo}</td>
            <td>${item.quantidade}</td>
            <td>${formatDate(item.data)}</td>
            <td>${formatCurrency(item.valorTotal)}</td>
            <td>
                <button class="btn-icon btn-edit" onclick="editEstoque(${item.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon btn-delete" onclick="deleteEstoque(${item.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Calcular totais
    const totalQuantidade = estoque.reduce((total, item) => total + item.quantidade, 0);
    const totalValor = estoque.reduce((total, item) => total + item.valorTotal, 0);
    
    // Atualizar totais
    const totalQuantidadeElement = document.getElementById('totalQuantidadeEstoque');
    const totalValorElement = document.getElementById('totalValorEstoque');
    
    if (totalQuantidadeElement) totalQuantidadeElement.textContent = totalQuantidade;
    if (totalValorElement) totalValorElement.textContent = formatCurrency(totalValor);
}

// Adicionar item ao estoque
function addEstoque(item) {
    const estoque = getEstoque();
    item.id = generateId('estoque');
    estoque.push(item);
    saveEstoque(estoque);
    return item;
}

// Atualizar item do estoque
function updateEstoque(item) {
    const estoque = getEstoque();
    const index = estoque.findIndex(i => i.id === item.id);
    
    if (index !== -1) {
        estoque[index] = item;
        saveEstoque(estoque);
        return true;
    }
    
    return false;
}

// Excluir item do estoque
function deleteEstoque(id) {
    if (confirm('Tem certeza que deseja excluir este item do estoque?')) {
        if (deleteItem('estoque', id)) {
            showNotification('Item excluído com sucesso');
            loadEstoque();
        } else {
            showNotification('Erro ao excluir item', 'error');
        }
    }
}

// Editar item do estoque
function editEstoque(id) {
    const item = getEstoqueById(id);
    
    if (!item) {
        showNotification('Item não encontrado', 'error');
        return;
    }
    
    // Preencher formulário
    const form = document.getElementById('formEstoque') || document.querySelector('form');
    if (!form) return;
    
    form.setAttribute('data-id', item.id);
    
    const selectModelo = document.getElementById('modeloEstoque') || document.querySelector('select');
    const inputQuantidade = document.getElementById('quantidadeEstoque') || document.querySelector('input[type="number"]');
    const inputData = document.getElementById('dataEstoque') || document.querySelector('input[type="date"]');
    const inputValor = document.getElementById('valorEstoque') || document.querySelector('input[name="valor"]');
    
    if (selectModelo) selectModelo.value = item.modelo;
    if (inputQuantidade) inputQuantidade.value = item.quantidade;
    if (inputData) inputData.value = item.data;
    if (inputValor) inputValor.value = item.valorTotal;
    
    // Carregar modelos para o select
    loadModelosForEstoque();
    
    // Abrir modal
    openModal('estoqueModal');
}

// Carregar modelos para o formulário de estoque
function loadModelosForEstoque() {
    const modelos = getModelos();
    const selectModelo = document.getElementById('modeloEstoque') || document.querySelector('select');
    
    if (!selectModelo) {
        console.error('Elemento select não encontrado');
        return;
    }
    
    // Limpar select
    selectModelo.innerHTML = '<option value="">Selecione um modelo</option>';
    
    // Preencher select com modelos
    modelos.forEach(modelo => {
        const option = document.createElement('option');
        option.value = modelo.id;
        option.textContent = modelo.nome;
        selectModelo.appendChild(option);
    });
}

// Manipular envio do formulário de estoque
function handleEstoqueSubmit(e) {
    if (e) e.preventDefault();
    
    const form = document.getElementById('formEstoque') || document.querySelector('form');
    
    if (!form) {
        console.error('Formulário não encontrado');
        return;
    }
    
    // Obter valores do formulário
    const id = form.getAttribute('data-id');
    const selectModelo = document.getElementById('modeloEstoque') || document.querySelector('select');
    const inputQuantidade = document.getElementById('quantidadeEstoque') || document.querySelector('input[type="number"]');
    const inputData = document.getElementById('dataEstoque') || document.querySelector('input[type="date"]');
    const inputValor = document.getElementById('valorEstoque') || document.querySelector('input[name="valor"]');
    
    if (!selectModelo || !inputQuantidade || !inputData || !inputValor) {
        console.error('Campos do formulário não encontrados');
        return;
    }
    
    const modelo = selectModelo.value;
    const quantidade = parseInt(inputQuantidade.value);
    const data = inputData.value;
    const valorTotal = parseFloat(inputValor.value);
    
    // Validar campos
    if (!modelo || isNaN(quantidade) || !data || isNaN(valorTotal)) {
        showNotification('Preencha todos os campos corretamente', 'error');
        return;
    }
    
    // Criar objeto de estoque
    const item = {
        modelo,
        quantidade,
        data,
        valorTotal
    };
    
    // Adicionar ou atualizar item
    if (id) {
        item.id = parseInt(id);
        updateEstoque(item);
        showNotification('Item atualizado com sucesso');
    } else {
        addEstoque(item);
        showNotification('Item adicionado com sucesso');
    }
    
    // Fechar modal e recarregar dados
    closeModal('estoqueModal');
    loadEstoque();
    
    // Limpar formulário
    clearEstoqueForm();
}

// Limpar formulário de estoque
function clearEstoqueForm() {
    const form = document.getElementById('formEstoque') || document.querySelector('form');
    
    if (!form) {
        return;
    }
    
    form.removeAttribute('data-id');
    form.reset();
}

// Formatar data
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

// Obter estoque do localStorage
function getEstoque() {
    return JSON.parse(localStorage.getItem('veex_estoque')) || [];
}

// Salvar estoque no localStorage
function saveEstoque(estoque) {
    localStorage.setItem('veex_estoque', JSON.stringify(estoque));
}

// Obter item do estoque por ID
function getEstoqueById(id) {
    const estoque = getEstoque();
    return estoque.find(item => item.id === id);
}

// Obter modelos do localStorage
function getModelos() {
    return JSON.parse(localStorage.getItem('veex_modelos')) || [];
}

// Obter modelo por ID
function getModeloById(id) {
    const modelos = getModelos();
    return modelos.find(modelo => modelo.id === id);
}

// Inicializar página de estoque
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se estamos na página de estoque
    if (!window.location.pathname.includes('estoque.html')) {
        return;
    }
    
    console.log('Inicializando página de estoque...');
    
    // Carregar estoque
    loadEstoque();
    
    // Adicionar evento ao botão de adicionar estoque
    const addButton = document.getElementById('addEstoqueBtn') || document.querySelector('button:nth-child(1)');
    
    if (addButton) {
        console.log('Botão de adicionar estoque encontrado:', addButton);
        
        // Adicionar atributo data-modal se não existir
        if (!addButton.hasAttribute('data-modal')) {
            addButton.setAttribute('data-modal', 'estoqueModal');
        }
        
        // Remover listeners existentes para evitar duplicação
        addButton.removeEventListener('click', function() { openModal('estoqueModal'); });
        
        // Adicionar novo listener
        addButton.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Botão de adicionar estoque clicado');
            clearEstoqueForm();
            loadModelosForEstoque();
            openModal('estoqueModal');
        });
    }
    
    // Adicionar evento ao formulário
    const formEstoque = document.getElementById('formEstoque') || document.querySelector('form');
    
    if (formEstoque) {
        console.log('Formulário de estoque encontrado');
        
        // Remover listeners existentes para evitar duplicação
        formEstoque.removeEventListener('submit', handleEstoqueSubmit);
        
        // Adicionar novo listener
        formEstoque.addEventListener('submit', handleEstoqueSubmit);
    }
    
    // Adicionar evento ao botão de salvar no formulário
    const saveButton = document.querySelector('button[type="submit"]') || document.querySelector('.btn-primary');
    
    if (saveButton) {
        console.log('Botão de salvar encontrado');
        
        // Remover listeners existentes para evitar duplicação
        saveButton.removeEventListener('click', handleEstoqueSubmit);
        
        // Adicionar novo listener
        saveButton.addEventListener('click', handleEstoqueSubmit);
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
