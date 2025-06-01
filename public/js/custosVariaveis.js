// VEEX - Sistema de Gestão de Custos e Produção
// Arquivo: custos-variaveis.js
// Descrição: Funções específicas para a página de Custos Variáveis

// Carregar custos variáveis
function loadCustosVariaveis() {
    console.log("Carregando custos variáveis...");
    const custosVariaveis = getCustosVariaveis();
    const tableBody = document.querySelector('#tabelaCustosVariaveis tbody') || document.querySelector('table tbody');
    
    if (!tableBody) {
        console.error('Elemento tbody não encontrado');
        return;
    }
    
    // Limpar tabela
    tableBody.innerHTML = '';
    
    if (custosVariaveis.length === 0) {
        // Mostrar mensagem de nenhum custo variável
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="4" class="text-center">Nenhum custo variável cadastrado.</td>`;
        tableBody.appendChild(row);
        return;
    }
    
    // Preencher tabela com dados
    custosVariaveis.forEach(custoVariavel => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${custoVariavel.nome}</td>
            <td>${formatCurrency(custoVariavel.valor)}</td>
            <td>${custoVariavel.porPar ? 'Sim' : 'Não'}</td>
            <td>
                <button class="btn-icon btn-edit" onclick="editCustoVariavel(${custoVariavel.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon btn-delete" onclick="deleteCustoVariavel(${custoVariavel.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

// Adicionar custo variável
function addCustoVariavel(custoVariavel) {
    const custosVariaveis = getCustosVariaveis();
    custoVariavel.id = generateId('custosVariaveis');
    custosVariaveis.push(custoVariavel);
    saveCustosVariaveis(custosVariaveis);
    return custoVariavel;
}

// Atualizar custo variável
function updateCustoVariavel(custoVariavel) {
    const custosVariaveis = getCustosVariaveis();
    const index = custosVariaveis.findIndex(c => c.id === custoVariavel.id);
    
    if (index !== -1) {
        custosVariaveis[index] = custoVariavel;
        saveCustosVariaveis(custosVariaveis);
        return true;
    }
    
    return false;
}

// Excluir custo variável
function deleteCustoVariavel(id) {
    if (confirm('Tem certeza que deseja excluir este custo variável?')) {
        if (deleteItem('custosVariaveis', id)) {
            showNotification('Custo variável excluído com sucesso');
            loadCustosVariaveis();
        } else {
            showNotification('Erro ao excluir custo variável', 'error');
        }
    }
}

// Editar custo variável
function editCustoVariavel(id) {
    const custoVariavel = getCustoVariavelById(id);
    
    if (!custoVariavel) {
        showNotification('Custo variável não encontrado', 'error');
        return;
    }
    
    // Preencher formulário
    const form = document.getElementById('formCustoVariavel') || document.querySelector('form');
    if (!form) return;
    
    form.setAttribute('data-id', custoVariavel.id);
    
    const inputNome = document.getElementById('nomeCustoVariavel') || document.querySelector('input[name="nome"]');
    const inputValor = document.getElementById('valorCustoVariavel') || document.querySelector('input[name="valor"]');
    const checkboxPorPar = document.getElementById('porParCustoVariavel') || document.querySelector('input[type="checkbox"]');
    
    if (inputNome) inputNome.value = custoVariavel.nome;
    if (inputValor) inputValor.value = custoVariavel.valor;
    if (checkboxPorPar) checkboxPorPar.checked = custoVariavel.porPar;
    
    // Abrir modal
    openModal('custoVariavelModal');
}

// Manipular envio do formulário de custo variável
function handleCustoVariavelSubmit(e) {
    if (e) e.preventDefault();
    
    const form = document.getElementById('formCustoVariavel') || document.querySelector('form');
    
    if (!form) {
        console.error('Formulário não encontrado');
        return;
    }
    
    // Obter valores do formulário
    const id = form.getAttribute('data-id');
    const inputNome = document.getElementById('nomeCustoVariavel') || document.querySelector('input[name="nome"]');
    const inputValor = document.getElementById('valorCustoVariavel') || document.querySelector('input[name="valor"]');
    const checkboxPorPar = document.getElementById('porParCustoVariavel') || document.querySelector('input[type="checkbox"]');
    
    if (!inputNome || !inputValor) {
        console.error('Campos do formulário não encontrados');
        return;
    }
    
    const nome = inputNome.value;
    const valor = parseFloat(inputValor.value);
    const porPar = checkboxPorPar ? checkboxPorPar.checked : false;
    
    // Validar campos
    if (!nome || isNaN(valor)) {
        showNotification('Preencha todos os campos corretamente', 'error');
        return;
    }
    
    // Criar objeto de custo variável
    const custoVariavel = {
        nome,
        valor,
        porPar
    };
    
    // Adicionar ou atualizar custo variável
    if (id) {
        custoVariavel.id = parseInt(id);
        updateCustoVariavel(custoVariavel);
        showNotification('Custo variável atualizado com sucesso');
    } else {
        addCustoVariavel(custoVariavel);
        showNotification('Custo variável adicionado com sucesso');
    }
    
    // Fechar modal e recarregar dados
    closeModal('custoVariavelModal');
    loadCustosVariaveis();
    
    // Limpar formulário
    clearCustoVariavelForm();
}

// Limpar formulário de custo variável
function clearCustoVariavelForm() {
    const form = document.getElementById('formCustoVariavel') || document.querySelector('form');
    
    if (!form) {
        return;
    }
    
    form.removeAttribute('data-id');
    form.reset();
}

// Obter custos variáveis do localStorage
function getCustosVariaveis() {
    return JSON.parse(localStorage.getItem('veex_custosVariaveis')) || [];
}

// Salvar custos variáveis no localStorage
function saveCustosVariaveis(custosVariaveis) {
    localStorage.setItem('veex_custosVariaveis', JSON.stringify(custosVariaveis));
}

// Obter custo variável por ID
function getCustoVariavelById(id) {
    const custosVariaveis = getCustosVariaveis();
    return custosVariaveis.find(custoVariavel => custoVariavel.id === id);
}

// Inicializar página de custos variáveis
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se estamos na página de custos variáveis
    if (!window.location.pathname.includes('custos-variaveis.html')) {
        return;
    }
    
    console.log('Inicializando página de custos variáveis...');
    
    // Carregar custos variáveis
    loadCustosVariaveis();
    
    // Adicionar evento ao botão de adicionar custo variável
    const addButton = document.getElementById('addCustoVariavelBtn') || document.querySelector('button:nth-child(1)');
    
    if (addButton) {
        console.log('Botão de adicionar custo variável encontrado:', addButton);
        
        // Adicionar atributo data-modal se não existir
        if (!addButton.hasAttribute('data-modal')) {
            addButton.setAttribute('data-modal', 'custoVariavelModal');
        }
        
        // Remover listeners existentes para evitar duplicação
        addButton.removeEventListener('click', function() { openModal('custoVariavelModal'); });
        
        // Adicionar novo listener
        addButton.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Botão de adicionar custo variável clicado');
            clearCustoVariavelForm();
            openModal('custoVariavelModal');
        });
    }
    
    // Adicionar evento ao formulário
    const formCustoVariavel = document.getElementById('formCustoVariavel') || document.querySelector('form');
    
    if (formCustoVariavel) {
        console.log('Formulário de custo variável encontrado');
        
        // Remover listeners existentes para evitar duplicação
        formCustoVariavel.removeEventListener('submit', handleCustoVariavelSubmit);
        
        // Adicionar novo listener
        formCustoVariavel.addEventListener('submit', handleCustoVariavelSubmit);
    }
    
    // Adicionar evento ao botão de salvar no formulário
    const saveButton = document.querySelector('button[type="submit"]') || document.querySelector('.btn-primary');
    
    if (saveButton) {
        console.log('Botão de salvar encontrado');
        
        // Remover listeners existentes para evitar duplicação
        saveButton.removeEventListener('click', handleCustoVariavelSubmit);
        
        // Adicionar novo listener
        saveButton.addEventListener('click', handleCustoVariavelSubmit);
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
