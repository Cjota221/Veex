// VEEX - Sistema de Gestão de Custos e Produção
// Arquivo: custos-fixos.js
// Descrição: Funções específicas para a página de Custos Fixos

// Carregar custos fixos
function loadCustosFixos() {
    console.log("Carregando custos fixos...");
    const custosFixos = getCustosFixos();
    const tableBody = document.querySelector('#tabelaCustosFixos tbody') || document.querySelector('table tbody');
    
    if (!tableBody) {
        console.error('Elemento tbody não encontrado');
        return;
    }
    
    // Limpar tabela
    tableBody.innerHTML = '';
    
    if (custosFixos.length === 0) {
        // Mostrar mensagem de nenhum custo fixo
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="3" class="text-center">Nenhum custo fixo cadastrado.</td>`;
        tableBody.appendChild(row);
        return;
    }
    
    // Preencher tabela com dados
    custosFixos.forEach(custoFixo => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${custoFixo.nome}</td>
            <td>${formatCurrency(custoFixo.valor)}</td>
            <td>
                <button class="btn-icon btn-edit" onclick="editCustoFixo(${custoFixo.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon btn-delete" onclick="deleteCustoFixo(${custoFixo.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Calcular total
    const totalValor = custosFixos.reduce((total, custoFixo) => total + custoFixo.valor, 0);
    
    // Atualizar total
    const totalElement = document.getElementById('totalCustosFixos');
    if (totalElement) {
        totalElement.textContent = formatCurrency(totalValor);
    }
}

// Adicionar custo fixo
function addCustoFixo(custoFixo) {
    const custosFixos = getCustosFixos();
    custoFixo.id = generateId('custosFixos');
    custosFixos.push(custoFixo);
    saveCustosFixos(custosFixos);
    return custoFixo;
}

// Atualizar custo fixo
function updateCustoFixo(custoFixo) {
    const custosFixos = getCustosFixos();
    const index = custosFixos.findIndex(c => c.id === custoFixo.id);
    
    if (index !== -1) {
        custosFixos[index] = custoFixo;
        saveCustosFixos(custosFixos);
        return true;
    }
    
    return false;
}

// Excluir custo fixo
function deleteCustoFixo(id) {
    if (confirm('Tem certeza que deseja excluir este custo fixo?')) {
        if (deleteItem('custosFixos', id)) {
            showNotification('Custo fixo excluído com sucesso');
            loadCustosFixos();
        } else {
            showNotification('Erro ao excluir custo fixo', 'error');
        }
    }
}

// Editar custo fixo
function editCustoFixo(id) {
    const custoFixo = getCustoFixoById(id);
    
    if (!custoFixo) {
        showNotification('Custo fixo não encontrado', 'error');
        return;
    }
    
    // Preencher formulário
    const form = document.getElementById('formCustoFixo') || document.querySelector('form');
    if (!form) return;
    
    form.setAttribute('data-id', custoFixo.id);
    
    const inputNome = document.getElementById('nomeCustoFixo') || document.querySelector('input[name="nome"]');
    const inputValor = document.getElementById('valorCustoFixo') || document.querySelector('input[name="valor"]');
    
    if (inputNome) inputNome.value = custoFixo.nome;
    if (inputValor) inputValor.value = custoFixo.valor;
    
    // Abrir modal
    openModal('custoFixoModal');
}

// Manipular envio do formulário de custo fixo
function handleCustoFixoSubmit(e) {
    if (e) e.preventDefault();
    
    const form = document.getElementById('formCustoFixo') || document.querySelector('form');
    
    if (!form) {
        console.error('Formulário não encontrado');
        return;
    }
    
    // Obter valores do formulário
    const id = form.getAttribute('data-id');
    const inputNome = document.getElementById('nomeCustoFixo') || document.querySelector('input[name="nome"]');
    const inputValor = document.getElementById('valorCustoFixo') || document.querySelector('input[name="valor"]');
    
    if (!inputNome || !inputValor) {
        console.error('Campos do formulário não encontrados');
        return;
    }
    
    const nome = inputNome.value;
    const valor = parseFloat(inputValor.value);
    
    // Validar campos
    if (!nome || isNaN(valor)) {
        showNotification('Preencha todos os campos corretamente', 'error');
        return;
    }
    
    // Criar objeto de custo fixo
    const custoFixo = {
        nome,
        valor
    };
    
    // Adicionar ou atualizar custo fixo
    if (id) {
        custoFixo.id = parseInt(id);
        updateCustoFixo(custoFixo);
        showNotification('Custo fixo atualizado com sucesso');
    } else {
        addCustoFixo(custoFixo);
        showNotification('Custo fixo adicionado com sucesso');
    }
    
    // Fechar modal e recarregar dados
    closeModal('custoFixoModal');
    loadCustosFixos();
    
    // Limpar formulário
    clearCustoFixoForm();
}

// Limpar formulário de custo fixo
function clearCustoFixoForm() {
    const form = document.getElementById('formCustoFixo') || document.querySelector('form');
    
    if (!form) {
        return;
    }
    
    form.removeAttribute('data-id');
    form.reset();
}

// Obter custos fixos do localStorage
function getCustosFixos() {
    return JSON.parse(localStorage.getItem('veex_custosFixos')) || [];
}

// Salvar custos fixos no localStorage
function saveCustosFixos(custosFixos) {
    localStorage.setItem('veex_custosFixos', JSON.stringify(custosFixos));
}

// Obter custo fixo por ID
function getCustoFixoById(id) {
    const custosFixos = getCustosFixos();
    return custosFixos.find(custoFixo => custoFixo.id === id);
}

// Inicializar página de custos fixos
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se estamos na página de custos fixos
    if (!window.location.pathname.includes('custos-fixos.html')) {
        return;
    }
    
    console.log('Inicializando página de custos fixos...');
    
    // Carregar custos fixos
    loadCustosFixos();
    
    // Adicionar evento ao botão de adicionar custo fixo
    const addButton = document.getElementById('addCustoFixoBtn') || document.querySelector('button:nth-child(1)');
    
    if (addButton) {
        console.log('Botão de adicionar custo fixo encontrado:', addButton);
        
        // Adicionar atributo data-modal se não existir
        if (!addButton.hasAttribute('data-modal')) {
            addButton.setAttribute('data-modal', 'custoFixoModal');
        }
        
        // Remover listeners existentes para evitar duplicação
        addButton.removeEventListener('click', function() { openModal('custoFixoModal'); });
        
        // Adicionar novo listener
        addButton.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Botão de adicionar custo fixo clicado');
            clearCustoFixoForm();
            openModal('custoFixoModal');
        });
    }
    
    // Adicionar evento ao formulário
    const formCustoFixo = document.getElementById('formCustoFixo') || document.querySelector('form');
    
    if (formCustoFixo) {
        console.log('Formulário de custo fixo encontrado');
        
        // Remover listeners existentes para evitar duplicação
        formCustoFixo.removeEventListener('submit', handleCustoFixoSubmit);
        
        // Adicionar novo listener
        formCustoFixo.addEventListener('submit', handleCustoFixoSubmit);
    }
    
    // Adicionar evento ao botão de salvar no formulário
    const saveButton = document.querySelector('button[type="submit"]') || document.querySelector('.btn-primary');
    
    if (saveButton) {
        console.log('Botão de salvar encontrado');
        
        // Remover listeners existentes para evitar duplicação
        saveButton.removeEventListener('click', handleCustoFixoSubmit);
        
        // Adicionar novo listener
        saveButton.addEventListener('click', handleCustoFixoSubmit);
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
