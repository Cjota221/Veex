// VEEX - Sistema de Gestão de Custos e Produção
// Arquivo: modelos.js
// Descrição: Funções específicas para a página de Modelos

// Carregar modelos
function loadModelos() {
    console.log("Carregando modelos...");
    const modelos = getModelos();
    const tableBody = document.querySelector('#tabelaModelos tbody') || document.querySelector('table tbody');
    
    if (!tableBody) {
        console.error('Elemento tbody não encontrado');
        return;
    }
    
    // Limpar tabela
    tableBody.innerHTML = '';
    
    if (modelos.length === 0) {
        // Mostrar mensagem de nenhum modelo
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="5" class="text-center">Nenhum modelo cadastrado.</td>`;
        tableBody.appendChild(row);
        return;
    }
    
    // Preencher tabela com dados
    modelos.forEach(modelo => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${modelo.nome}</td>
            <td>${formatCurrency(modelo.custo)}</td>
            <td>${(modelo.margem * 100).toFixed(0)}%</td>
            <td>${formatCurrency(modelo.preco)}</td>
            <td>
                <button class="btn-icon btn-edit" onclick="editModelo(${modelo.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon btn-delete" onclick="deleteModelo(${modelo.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Atualizar contador
    const totalModelos = document.getElementById('totalModelos');
    if (totalModelos) {
        totalModelos.textContent = modelos.length;
    }
}

// Adicionar modelo
function addModelo(modelo) {
    const modelos = getModelos();
    modelo.id = generateId('modelos');
    modelos.push(modelo);
    saveModelos(modelos);
    return modelo;
}

// Atualizar modelo
function updateModelo(modelo) {
    const modelos = getModelos();
    const index = modelos.findIndex(m => m.id === modelo.id);
    
    if (index !== -1) {
        modelos[index] = modelo;
        saveModelos(modelos);
        return true;
    }
    
    return false;
}

// Excluir modelo
function deleteModelo(id) {
    if (confirm('Tem certeza que deseja excluir este modelo?')) {
        if (deleteItem('modelos', id)) {
            showNotification('Modelo excluído com sucesso');
            loadModelos();
        } else {
            showNotification('Erro ao excluir modelo', 'error');
        }
    }
}

// Editar modelo
function editModelo(id) {
    const modelo = getModeloById(id);
    
    if (!modelo) {
        showNotification('Modelo não encontrado', 'error');
        return;
    }
    
    // Preencher formulário
    const form = document.getElementById('formModelo') || document.querySelector('form');
    if (!form) return;
    
    form.setAttribute('data-id', modelo.id);
    
    const inputNome = document.getElementById('nomeModelo') || document.querySelector('input[name="nome"]');
    const inputCusto = document.getElementById('custoModelo') || document.querySelector('input[name="custo"]');
    const inputMargem = document.getElementById('margemModelo') || document.querySelector('input[name="margem"]');
    const inputPreco = document.getElementById('precoModelo') || document.querySelector('input[name="preco"]');
    
    if (inputNome) inputNome.value = modelo.nome;
    if (inputCusto) inputCusto.value = modelo.custo;
    if (inputMargem) inputMargem.value = modelo.margem * 100;
    if (inputPreco) inputPreco.value = modelo.preco;
    
    // Abrir modal
    openModal('modeloModal');
}

// Manipular envio do formulário de modelo
function handleModeloSubmit(e) {
    if (e) e.preventDefault();
    
    const form = document.getElementById('formModelo') || document.querySelector('form');
    
    if (!form) {
        console.error('Formulário não encontrado');
        return;
    }
    
    // Obter valores do formulário
    const id = form.getAttribute('data-id');
    const inputNome = document.getElementById('nomeModelo') || document.querySelector('input[name="nome"]');
    const inputCusto = document.getElementById('custoModelo') || document.querySelector('input[name="custo"]');
    const inputMargem = document.getElementById('margemModelo') || document.querySelector('input[name="margem"]');
    const inputPreco = document.getElementById('precoModelo') || document.querySelector('input[name="preco"]');
    
    if (!inputNome || !inputCusto || !inputMargem || !inputPreco) {
        console.error('Campos do formulário não encontrados');
        return;
    }
    
    const nome = inputNome.value;
    const custo = parseFloat(inputCusto.value);
    const margem = parseFloat(inputMargem.value) / 100;
    const preco = parseFloat(inputPreco.value);
    
    // Validar campos
    if (!nome || isNaN(custo) || isNaN(margem) || isNaN(preco)) {
        showNotification('Preencha todos os campos corretamente', 'error');
        return;
    }
    
    // Criar objeto de modelo
    const modelo = {
        nome,
        custo,
        margem,
        preco
    };
    
    // Adicionar ou atualizar modelo
    if (id) {
        modelo.id = parseInt(id);
        updateModelo(modelo);
        showNotification('Modelo atualizado com sucesso');
    } else {
        addModelo(modelo);
        showNotification('Modelo adicionado com sucesso');
    }
    
    // Fechar modal e recarregar dados
    closeModal('modeloModal');
    loadModelos();
    
    // Limpar formulário
    clearModeloForm();
}

// Limpar formulário de modelo
function clearModeloForm() {
    const form = document.getElementById('formModelo') || document.querySelector('form');
    
    if (!form) {
        return;
    }
    
    form.removeAttribute('data-id');
    form.reset();
}

// Calcular preço com base no custo e margem
function calcularPreco() {
    const custoInput = document.getElementById('custoModelo') || document.querySelector('input[name="custo"]');
    const margemInput = document.getElementById('margemModelo') || document.querySelector('input[name="margem"]');
    const precoInput = document.getElementById('precoModelo') || document.querySelector('input[name="preco"]');
    
    if (!custoInput || !margemInput || !precoInput) {
        return;
    }
    
    const custo = parseFloat(custoInput.value) || 0;
    const margem = parseFloat(margemInput.value) / 100 || 0;
    
    const preco = custo / (1 - margem);
    precoInput.value = preco.toFixed(2);
}

// Calcular margem com base no custo e preço
function calcularMargem() {
    const custoInput = document.getElementById('custoModelo') || document.querySelector('input[name="custo"]');
    const margemInput = document.getElementById('margemModelo') || document.querySelector('input[name="margem"]');
    const precoInput = document.getElementById('precoModelo') || document.querySelector('input[name="preco"]');
    
    if (!custoInput || !margemInput || !precoInput) {
        return;
    }
    
    const custo = parseFloat(custoInput.value) || 0;
    const preco = parseFloat(precoInput.value) || 0;
    
    if (preco <= custo) {
        margemInput.value = '0';
        return;
    }
    
    const margem = (preco - custo) / preco;
    margemInput.value = (margem * 100).toFixed(0);
}

// Obter modelos do localStorage
function getModelos() {
    return JSON.parse(localStorage.getItem('veex_modelos')) || [];
}

// Salvar modelos no localStorage
function saveModelos(modelos) {
    localStorage.setItem('veex_modelos', JSON.stringify(modelos));
}

// Obter modelo por ID
function getModeloById(id) {
    const modelos = getModelos();
    return modelos.find(modelo => modelo.id === id);
}

// Inicializar página de modelos
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se estamos na página de modelos
    if (!window.location.pathname.includes('modelos.html')) {
        return;
    }
    
    console.log('Inicializando página de modelos...');
    
    // Carregar modelos
    loadModelos();
    
    // Adicionar evento ao botão de adicionar modelo
    const addButton = document.getElementById('addModeloBtn') || document.querySelector('button:nth-child(1)');
    
    if (addButton) {
        console.log('Botão de adicionar modelo encontrado:', addButton);
        
        // Adicionar atributo data-modal se não existir
        if (!addButton.hasAttribute('data-modal')) {
            addButton.setAttribute('data-modal', 'modeloModal');
        }
        
        // Remover listeners existentes para evitar duplicação
        addButton.removeEventListener('click', function() { openModal('modeloModal'); });
        
        // Adicionar novo listener
        addButton.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Botão de adicionar modelo clicado');
            clearModeloForm();
            openModal('modeloModal');
        });
    }
    
    // Adicionar evento ao formulário
    const formModelo = document.getElementById('formModelo') || document.querySelector('form');
    
    if (formModelo) {
        console.log('Formulário de modelo encontrado');
        
        // Remover listeners existentes para evitar duplicação
        formModelo.removeEventListener('submit', handleModeloSubmit);
        
        // Adicionar novo listener
        formModelo.addEventListener('submit', handleModeloSubmit);
    }
    
    // Adicionar evento ao botão de salvar no formulário
    const saveButton = document.querySelector('button[type="submit"]') || document.querySelector('.btn-primary');
    
    if (saveButton) {
        console.log('Botão de salvar encontrado');
        
        // Remover listeners existentes para evitar duplicação
        saveButton.removeEventListener('click', handleModeloSubmit);
        
        // Adicionar novo listener
        saveButton.addEventListener('click', handleModeloSubmit);
    }
    
    // Adicionar eventos para cálculo automático
    const custoInput = document.getElementById('custoModelo') || document.querySelector('input[name="custo"]');
    const margemInput = document.getElementById('margemModelo') || document.querySelector('input[name="margem"]');
    const precoInput = document.getElementById('precoModelo') || document.querySelector('input[name="preco"]');
    
    if (custoInput && margemInput) {
        custoInput.addEventListener('input', calcularPreco);
        margemInput.addEventListener('input', calcularPreco);
    }
    
    if (custoInput && precoInput) {
        precoInput.addEventListener('input', calcularMargem);
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
