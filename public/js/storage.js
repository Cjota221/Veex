// VEEX - Sistema de Gestão de Custos e Produção
// Arquivo: storage.js
// Descrição: Funções para gerenciamento de dados locais

// Funções para manipulação de dados no localStorage

// Obter dados
function getData(collection) {
    const data = localStorage.getItem(`veex_${collection}`);
    return data ? JSON.parse(data) : [];
}

// Salvar dados
function saveData(collection, data) {
    localStorage.setItem(`veex_${collection}`, JSON.stringify(data));
}

// Adicionar item
function addItem(collection, item) {
    const items = getData(collection);
    
    // Gerar ID se não existir
    if (!item.id) {
        item.id = items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
    }
    
    items.push(item);
    saveData(collection, items);
    return item;
}

// Atualizar item
function updateItem(collection, item) {
    const items = getData(collection);
    const index = items.findIndex(i => i.id === item.id);
    
    if (index !== -1) {
        items[index] = item;
        saveData(collection, items);
        return true;
    }
    
    return false;
}

// Remover item
function deleteItem(collection, id) {
    const items = getData(collection);
    const newItems = items.filter(item => item.id !== id);
    
    if (newItems.length !== items.length) {
        saveData(collection, newItems);
        return true;
    }
    
    return false;
}

// Obter item por ID
function getItemById(collection, id) {
    const items = getData(collection);
    return items.find(item => item.id === id) || null;
}

// Funções específicas para cada coleção

// Insumos
function getInsumos() {
    return getData('insumos');
}

function addInsumo(insumo) {
    return addItem('insumos', insumo);
}

function updateInsumo(insumo) {
    return updateItem('insumos', insumo);
}

function deleteInsumo(id) {
    return deleteItem('insumos', id);
}

function getInsumoById(id) {
    return getItemById('insumos', id);
}

// Modelos
function getModelos() {
    return getData('modelos');
}

function addModelo(modelo) {
    return addItem('modelos', modelo);
}

function updateModelo(modelo) {
    return updateItem('modelos', modelo);
}

function deleteModelo(id) {
    return deleteItem('modelos', id);
}

function getModeloById(id) {
    return getItemById('modelos', id);
}

// Produções
function getProducoes() {
    return getData('producoes');
}

function addProducao(producao) {
    return addItem('producoes', producao);
}

function updateProducao(producao) {
    return updateItem('producoes', producao);
}

function deleteProducao(id) {
    return deleteItem('producoes', id);
}

function getProducaoById(id) {
    return getItemById('producoes', id);
}

// Custos Fixos
function getCustosFixos() {
    return getData('custosFixos');
}

function addCustoFixo(custoFixo) {
    return addItem('custosFixos', custoFixo);
}

function updateCustoFixo(custoFixo) {
    return updateItem('custosFixos', custoFixo);
}

function deleteCustoFixo(id) {
    return deleteItem('custosFixos', id);
}

function getCustoFixoById(id) {
    return getItemById('custosFixos', id);
}

// Custos Variáveis
function getCustosVariaveis() {
    return getData('custosVariaveis');
}

function addCustoVariavel(custoVariavel) {
    return addItem('custosVariaveis', custoVariavel);
}

function updateCustoVariavel(custoVariavel) {
    return updateItem('custosVariaveis', custoVariavel);
}

function deleteCustoVariavel(id) {
    return deleteItem('custosVariaveis', id);
}

function getCustoVariavelById(id) {
    return getItemById('custosVariaveis', id);
}

// Funções de cálculo e estatísticas

// Calcular total de custos fixos
function calcularTotalCustosFixos() {
    const custosFixos = getCustosFixos();
    return custosFixos.reduce((total, custo) => total + parseFloat(custo.valor), 0);
}

// Calcular custo total de produção
function calcularCustoProducao(modeloId, quantidade) {
    const modelo = getModeloById(parseInt(modeloId));
    if (!modelo) return 0;
    
    return modelo.custo * quantidade;
}

// Calcular lucro estimado de produção
function calcularLucroProducao(modeloId, quantidade) {
    const modelo = getModeloById(parseInt(modeloId));
    if (!modelo) return 0;
    
    const custoTotal = modelo.custo * quantidade;
    const vendaTotal = modelo.preco * quantidade;
    
    return vendaTotal - custoTotal;
}

// Calcular estatísticas para dashboard
function calcularEstatisticasDashboard() {
    const modelos = getModelos();
    const producoes = getProducoes();
    
    // Total de modelos cadastrados
    const totalModelos = modelos.length;
    
    // Custo médio por unidade
    let custoMedio = 0;
    if (modelos.length > 0) {
        custoMedio = modelos.reduce((total, modelo) => total + parseFloat(modelo.custo), 0) / modelos.length;
    }
    
    // Produção do mês
    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
    
    const producoesDoMes = producoes.filter(p => {
        const dataProducao = new Date(p.data);
        return dataProducao >= inicioMes && dataProducao <= fimMes;
    });
    
    const totalProducaoMes = producoesDoMes.reduce((total, p) => total + parseInt(p.quantidade), 0);
    
    // Lucro estimado
    const lucroEstimado = producoes.reduce((total, p) => {
        const modelo = getModeloById(parseInt(p.modelo));
        if (!modelo) return total;
        
        const custoTotal = modelo.custo * p.quantidade;
        const vendaTotal = modelo.preco * p.quantidade;
        
        return total + (vendaTotal - custoTotal);
    }, 0);
    
    return {
        totalModelos,
        custoMedio,
        totalProducaoMes,
        lucroEstimado
    };
}
