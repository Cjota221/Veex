// VEEX - Sistema de Gestão de Custos e Produção
// Arquivo: financeiro.js
// Descrição: Funções específicas para a página de Financeiro

// Carregar dados financeiros
function loadFinanceiro() {
    console.log("Carregando dados financeiros...");
    
    // Obter dados
    const producoes = getProducoes();
    const custosFixos = getCustosFixos();
    const custosVariaveis = getCustosVariaveis();
    
    // Calcular receitas
    const receitas = calcularReceitas(producoes);
    
    // Calcular despesas
    const despesas = calcularDespesas(custosFixos, custosVariaveis, producoes);
    
    // Calcular lucro
    const lucro = receitas - despesas;
    
    // Atualizar cards
    updateFinanceiroCards(receitas, despesas, lucro);
    
    // Carregar tabela de fluxo de caixa
    loadFluxoCaixa(producoes, custosFixos, custosVariaveis);
    
    // Inicializar gráficos
    initFinanceiroCharts(receitas, despesas, lucro);
}

// Calcular receitas
function calcularReceitas(producoes) {
    let total = 0;
    
    producoes.forEach(producao => {
        const modelo = getModeloById(parseInt(producao.modelo));
        if (modelo) {
            total += modelo.preco * producao.quantidade;
        }
    });
    
    return total;
}

// Calcular despesas
function calcularDespesas(custosFixos, custosVariaveis, producoes) {
    // Calcular total de custos fixos
    const totalFixos = custosFixos.reduce((total, custo) => total + custo.valor, 0);
    
    // Calcular total de custos variáveis
    let totalVariaveis = 0;
    
    // Custos variáveis por par
    const custosVariaveisPorPar = custosVariaveis.filter(custo => custo.porPar);
    const totalProducao = producoes.reduce((total, producao) => total + producao.quantidade, 0);
    
    custosVariaveisPorPar.forEach(custo => {
        totalVariaveis += custo.valor * totalProducao;
    });
    
    // Custos variáveis gerais
    const custosVariaveisGerais = custosVariaveis.filter(custo => !custo.porPar);
    custosVariaveisGerais.forEach(custo => {
        totalVariaveis += custo.valor;
    });
    
    return totalFixos + totalVariaveis;
}

// Atualizar cards financeiros
function updateFinanceiroCards(receitas, despesas, lucro) {
    const receitasElement = document.getElementById('totalReceitas');
    const despesasElement = document.getElementById('totalDespesas');
    const lucroElement = document.getElementById('totalLucro');
    const margemElement = document.getElementById('margemLucro');
    
    if (receitasElement) receitasElement.textContent = formatCurrency(receitas);
    if (despesasElement) despesasElement.textContent = formatCurrency(despesas);
    if (lucroElement) lucroElement.textContent = formatCurrency(lucro);
    
    // Calcular margem de lucro
    const margem = receitas > 0 ? (lucro / receitas) * 100 : 0;
    if (margemElement) margemElement.textContent = `${margem.toFixed(2)}%`;
    
    // Adicionar classe para lucro positivo ou negativo
    if (lucroElement) {
        lucroElement.classList.remove('text-success', 'text-danger');
        lucroElement.classList.add(lucro >= 0 ? 'text-success' : 'text-danger');
    }
}

// Carregar tabela de fluxo de caixa
function loadFluxoCaixa(producoes, custosFixos, custosVariaveis) {
    const tableBody = document.querySelector('#tabelaFluxoCaixa tbody') || document.querySelector('table tbody');
    
    if (!tableBody) {
        console.error('Elemento tbody não encontrado');
        return;
    }
    
    // Limpar tabela
    tableBody.innerHTML = '';
    
    // Agrupar produções por mês
    const producoesPorMes = agruparPorMes(producoes);
    
    // Total de custos fixos mensais
    const totalCustosFixos = custosFixos.reduce((total, custo) => total + custo.valor, 0);
    
    // Custos variáveis não relacionados à produção
    const custosVariaveisGerais = custosVariaveis
        .filter(custo => !custo.porPar)
        .reduce((total, custo) => total + custo.valor, 0);
    
    // Custos variáveis por par
    const custosVariaveisPorPar = custosVariaveis.filter(custo => custo.porPar);
    
    // Meses do ano
    const meses = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    
    // Preencher tabela com dados
    meses.forEach((mes, index) => {
        const producoesMes = producoesPorMes[index] || [];
        
        // Calcular receitas do mês
        let receitasMes = 0;
        let quantidadeProduzida = 0;
        
        producoesMes.forEach(producao => {
            const modelo = getModeloById(parseInt(producao.modelo));
            if (modelo) {
                receitasMes += modelo.preco * producao.quantidade;
                quantidadeProduzida += producao.quantidade;
            }
        });
        
        // Calcular custos variáveis por par
        let custosVariaveisMes = custosVariaveisGerais;
        custosVariaveisPorPar.forEach(custo => {
            custosVariaveisMes += custo.valor * quantidadeProduzida;
        });
        
        // Calcular despesas totais
        const despesasMes = totalCustosFixos + custosVariaveisMes;
        
        // Calcular lucro
        const lucroMes = receitasMes - despesasMes;
        
        // Criar linha na tabela
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${mes}</td>
            <td>${formatCurrency(receitasMes)}</td>
            <td>${formatCurrency(despesasMes)}</td>
            <td class="${lucroMes >= 0 ? 'text-success' : 'text-danger'}">${formatCurrency(lucroMes)}</td>
        `;
        
        tableBody.appendChild(row);
    });
}

// Agrupar produções por mês
function agruparPorMes(producoes) {
    const producoesPorMes = {};
    
    producoes.forEach(producao => {
        const data = new Date(producao.data);
        const mes = data.getMonth();
        
        if (!producoesPorMes[mes]) {
            producoesPorMes[mes] = [];
        }
        
        producoesPorMes[mes].push(producao);
    });
    
    return producoesPorMes;
}

// Inicializar gráficos financeiros
function initFinanceiroCharts(receitas, despesas, lucro) {
    // Gráfico de receitas x despesas
    const ctxReceitasDespesas = document.getElementById('graficoReceitasDespesas');
    
    if (ctxReceitasDespesas) {
        new Chart(ctxReceitasDespesas, {
            type: 'bar',
            data: {
                labels: ['Receitas', 'Despesas', 'Lucro'],
                datasets: [{
                    label: 'Valores (R$)',
                    data: [receitas, despesas, lucro],
                    backgroundColor: [
                        'rgba(75, 192, 192, 0.6)',
                        'rgba(255, 99, 132, 0.6)',
                        lucro >= 0 ? 'rgba(54, 162, 235, 0.6)' : 'rgba(255, 159, 64, 0.6)'
                    ],
                    borderColor: [
                        'rgba(75, 192, 192, 1)',
                        'rgba(255, 99, 132, 1)',
                        lucro >= 0 ? 'rgba(54, 162, 235, 1)' : 'rgba(255, 159, 64, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
    
    // Gráfico de distribuição de despesas
    const ctxDespesas = document.getElementById('graficoDespesas');
    
    if (ctxDespesas) {
        const custosFixos = getCustosFixos();
        const custosVariaveis = getCustosVariaveis();
        
        const totalFixos = custosFixos.reduce((total, custo) => total + custo.valor, 0);
        const totalVariaveis = custosVariaveis.reduce((total, custo) => total + custo.valor, 0);
        
        new Chart(ctxDespesas, {
            type: 'pie',
            data: {
                labels: ['Custos Fixos', 'Custos Variáveis'],
                datasets: [{
                    label: 'Despesas',
                    data: [totalFixos, totalVariaveis],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.6)',
                        'rgba(54, 162, 235, 0.6)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)'
                    ],
                    borderWidth: 1
                }]
            }
        });
    }
}

// Obter produções do localStorage
function getProducoes() {
    return JSON.parse(localStorage.getItem('veex_producoes')) || [];
}

// Obter custos fixos do localStorage
function getCustosFixos() {
    return JSON.parse(localStorage.getItem('veex_custosFixos')) || [];
}

// Obter custos variáveis do localStorage
function getCustosVariaveis() {
    return JSON.parse(localStorage.getItem('veex_custosVariaveis')) || [];
}

// Obter modelo por ID
function getModeloById(id) {
    const modelos = JSON.parse(localStorage.getItem('veex_modelos')) || [];
    return modelos.find(modelo => modelo.id === id);
}

// Inicializar página financeira
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se estamos na página financeira
    if (!window.location.pathname.includes('financeiro.html')) {
        return;
    }
    
    console.log('Inicializando página financeira...');
    
    // Carregar dados financeiros
    loadFinanceiro();
    
    // Adicionar evento ao botão de gerar relatório
    const gerarRelatorioBtn = document.getElementById('gerarRelatorioBtn');
    
    if (gerarRelatorioBtn) {
        gerarRelatorioBtn.addEventListener('click', function() {
            console.log('Gerando relatório financeiro...');
            // Implementar geração de relatório
            showNotification('Relatório gerado com sucesso');
        });
    }
    
    // Adicionar evento ao botão de exportar dados
    const exportarDadosBtn = document.getElementById('exportarDadosBtn');
    
    if (exportarDadosBtn) {
        exportarDadosBtn.addEventListener('click', function() {
            console.log('Exportando dados financeiros...');
            // Implementar exportação de dados
            showNotification('Dados exportados com sucesso');
        });
    }
});
