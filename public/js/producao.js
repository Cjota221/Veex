// VEEX - Sistema de Gestão de Custos e Produção
// Arquivo: producao.js
// Descrição: Funções específicas para a página de Produção

// Carregar produções
function loadProducoes() {
    const producoes = getProducoes();
    const tableBody = document.querySelector('#tabelaProducoes tbody');
    
    if (!tableBody) {
        console.error('Elemento tbody não encontrado');
        return;
    }
    
    // Limpar tabela
    tableBody.innerHTML = '';
    
    if (producoes.length === 0) {
        // Mostrar mensagem de nenhuma produção
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="5" class="text-center">Nenhuma produção registrada.</td>`;
        tableBody.appendChild(row);
        return;
    }
    
    // Preencher tabela com dados
    producoes.forEach(producao => {
        const modelo = getModeloById(parseInt(producao.modelo));
        const nomeModelo = modelo ? modelo.nome : 'Modelo não encontrado';
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formatDate(producao.data)}</td>
            <td>${producao.nome}</td>
            <td>${producao.quantidade}</td>
            <td>${formatCurrency(producao.custo)}</td>
            <td>${formatCurrency(producao.lucro)}</td>
            <td>
                <button class="btn-icon btn-edit" onclick="editProducao(${producao.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon btn-delete" onclick="deleteProducao(${producao.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Atualizar contador
    const totalProducoes = document.getElementById('totalProducoes');
    if (totalProducoes) {
        totalProducoes.textContent = producoes.length;
    }
}

// Carregar modelos para o formulário de produção
function loadModelosForProducao() {
    const modelos = getModelos();
    const selectModelo = document.getElementById('modeloProducao');
    
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
    
    // Inicializar composição de produção
    initProducaoComposition();
}

// Inicializar composição de produção
function initProducaoComposition() {
    const composicaoContainer = document.getElementById('composicaoProducao');
    const selectModelo = document.getElementById('modeloProducao');
    const inputQuantidade = document.getElementById('quantidadeProducao');
    
    if (!composicaoContainer || !selectModelo || !inputQuantidade) {
        return;
    }
    
    // Limpar composição
    composicaoContainer.innerHTML = '';
    
    // Adicionar evento de mudança ao select de modelo
    selectModelo.addEventListener('change', function() {
        updateProducaoSummary();
    });
    
    // Adicionar evento de mudança ao input de quantidade
    inputQuantidade.addEventListener('input', function() {
        updateProducaoSummary();
    });
}

// Atualizar resumo de produção
function updateProducaoSummary() {
    const modeloId = document.getElementById('modeloProducao').value;
    const quantidade = document.getElementById('quantidadeProducao').value || 0;
    
    const custoTotalElement = document.getElementById('custoTotalProducao');
    const lucroEstimadoElement = document.getElementById('lucroEstimadoProducao');
    
    if (!custoTotalElement || !lucroEstimadoElement) {
        return;
    }
    
    if (!modeloId || !quantidade) {
        custoTotalElement.textContent = formatCurrency(0);
        lucroEstimadoElement.textContent = formatCurrency(0);
        return;
    }
    
    const custoTotal = calcularCustoProducao(modeloId, quantidade);
    const lucroEstimado = calcularLucroProducao(modeloId, quantidade);
    
    custoTotalElement.textContent = formatCurrency(custoTotal);
    lucroEstimadoElement.textContent = formatCurrency(lucroEstimado);
}

// Manipular envio do formulário de produção
function handleProducaoSubmit() {
    const form = document.getElementById('formProducao');
    
    if (!form) {
        console.error('Formulário não encontrado');
        return;
    }
    
    // Obter valores do formulário
    const id = form.getAttribute('data-id');
    const nome = document.getElementById('nomeProducao').value;
    const modeloId = document.getElementById('modeloProducao').value;
    const quantidade = document.getElementById('quantidadeProducao').value;
    const data = document.getElementById('dataProducao').value;
    
    // Validar campos
    if (!nome || !modeloId || !quantidade || !data) {
        showNotification('Preencha todos os campos obrigatórios', 'error');
        return;
    }
    
    // Calcular custo e lucro
    const custoTotal = calcularCustoProducao(modeloId, quantidade);
    const lucroEstimado = calcularLucroProducao(modeloId, quantidade);
    
    // Criar objeto de produção
    const producao = {
        nome,
        modelo: parseInt(modeloId),
        quantidade: parseInt(quantidade),
        data,
        custo: custoTotal,
        lucro: lucroEstimado
    };
    
    // Adicionar ou atualizar produção
    if (id) {
        producao.id = parseInt(id);
        updateProducao(producao);
        showNotification('Produção atualizada com sucesso');
    } else {
        addProducao(producao);
        showNotification('Produção registrada com sucesso');
    }
    
    // Fechar modal e recarregar dados
    closeModal('producaoModal');
    loadProducoes();
    
    // Limpar formulário
    clearProducaoForm();
}

// Editar produção
function editProducao(id) {
    const producao = getProducaoById(id);
    
    if (!producao) {
        showNotification('Produção não encontrada', 'error');
        return;
    }
    
    // Preencher formulário
    const form = document.getElementById('formProducao');
    form.setAttribute('data-id', producao.id);
    
    document.getElementById('nomeProducao').value = producao.nome;
    document.getElementById('modeloProducao').value = producao.modelo;
    document.getElementById('quantidadeProducao').value = producao.quantidade;
    document.getElementById('dataProducao').value = producao.data;
    
    // Atualizar resumo
    updateProducaoSummary();
    
    // Abrir modal
    openModal('producaoModal');
}

// Excluir produção
function deleteProducao(id) {
    if (confirm('Tem certeza que deseja excluir esta produção?')) {
        if (deleteItem('producoes', id)) {
            showNotification('Produção excluída com sucesso');
            loadProducoes();
        } else {
            showNotification('Erro ao excluir produção', 'error');
        }
    }
}

// Limpar formulário de produção
function clearProducaoForm() {
    const form = document.getElementById('formProducao');
    
    if (!form) {
        return;
    }
    
    form.removeAttribute('data-id');
    form.reset();
    
    // Resetar resumo
    const custoTotalElement = document.getElementById('custoTotalProducao');
    const lucroEstimadoElement = document.getElementById('lucroEstimadoProducao');
    
    if (custoTotalElement) custoTotalElement.textContent = formatCurrency(0);
    if (lucroEstimadoElement) lucroEstimadoElement.textContent = formatCurrency(0);
}

// Formatar data
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

// Inicializar página de produção
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se estamos na página de produção
    if (!window.location.pathname.includes('producao.html')) {
        return;
    }
    
    // Carregar produções
    loadProducoes();
    
    // Adicionar evento ao botão de nova produção
    const btnNovaProducao = document.getElementById('btnNovaProducao');
    
    if (btnNovaProducao) {
        btnNovaProducao.addEventListener('click', function() {
            clearProducaoForm();
            loadModelosForProducao();
            openModal('producaoModal');
        });
    }
    
    // Adicionar evento ao formulário
    const formProducao = document.getElementById('formProducao');
    
    if (formProducao) {
        formProducao.addEventListener('submit', function(e) {
            e.preventDefault();
            handleProducaoSubmit();
        });
    }
});
