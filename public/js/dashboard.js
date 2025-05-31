// VEEX - Sistema de Gestão de Custos e Produção
// Dashboard.js - Funcionalidades específicas da página Dashboard

document.addEventListener('DOMContentLoaded', function() {
  // Inicializa o dashboard quando o DOM estiver pronto
  DashboardPage.init();
});

// Objeto do Dashboard
const DashboardPage = {
  // Dados do dashboard
  data: {
    producao: {
      total: 1250,
      unidade: 'pares'
    },
    custoMedio: 7.50,
    lucroTotal: 26000,
    modelos: [
      { nome: 'Tênis Esportivo', custo: 95.00, margem: 25, preco: 119.00 },
      { nome: 'Sandália Casual', custo: 66.00, margem: 30, preco: 36.00 },
      { nome: 'Sapato Social', custo: 112.00, margem: 20, preco: 135.00 },
      { nome: 'Bota Feminina', custo: 135.00, margem: 25, preco: 169.00 }
    ],
    resumoCustos: {
      insumos: 25000,
      fixos: 8500,
      variaveis: 3250
    }
  },
  
  // Gráficos
  charts: {},
  
  // Inicialização
  init: function() {
    // Carrega dados do armazenamento local ou usa os padrões
    this.loadData();
    
    // Renderiza os elementos do dashboard
    this.renderSummaryCards();
    this.renderModelosTable();
    this.renderResumoCustos();
    this.renderMargemSlider();
    
    // Inicializa gráficos se a biblioteca Chart.js estiver disponível
    if (typeof Chart !== 'undefined') {
      this.initCharts();
    }
    
    // Inicializa eventos
    this.initEvents();
    
    console.log('Dashboard: Inicializado');
  },
  
  // Carrega dados
  loadData: function() {
    const savedData = VEEX.storage.load('dashboard');
    if (savedData) {
      this.data = savedData;
    }
  },
  
  // Renderiza os cards de resumo
  renderSummaryCards: function() {
    // Produção
    const producaoElement = document.getElementById('producaoTotal');
    if (producaoElement) {
      producaoElement.textContent = `${this.data.producao.total} ${this.data.producao.unidade}`;
    }
    
    // Custo médio
    const custoMedioElement = document.getElementById('custoMedio');
    if (custoMedioElement) {
      custoMedioElement.textContent = VEEX.formatters.currency(this.data.custoMedio);
    }
    
    // Lucro total
    const lucroTotalElement = document.getElementById('lucroTotal');
    if (lucroTotalElement) {
      lucroTotalElement.textContent = VEEX.formatters.currency(this.data.lucroTotal);
    }
  },
  
  // Renderiza a tabela de modelos
  renderModelosTable: function() {
    const tableBody = document.querySelector('#modelosTable tbody');
    if (!tableBody) return;
    
    // Limpa a tabela
    tableBody.innerHTML = '';
    
    // Adiciona as linhas
    this.data.modelos.forEach(modelo => {
      const row = document.createElement('tr');
      
      row.innerHTML = `
        <td>
          <div class="d-flex align-items-center">
            <div class="model-icon">👟</div>
            <div>${modelo.nome}</div>
          </div>
        </td>
        <td class="text-right">${VEEX.formatters.currency(modelo.custo)}</td>
        <td class="text-center">${modelo.margem}%</td>
        <td class="text-right">${VEEX.formatters.currency(modelo.preco)}</td>
      `;
      
      tableBody.appendChild(row);
    });
  },
  
  // Renderiza o resumo de custos
  renderResumoCustos: function() {
    const insumosElement = document.getElementById('valorInsumos');
    const fixosElement = document.getElementById('valorFixos');
    const variaveisElement = document.getElementById('valorVariaveis');
    
    if (insumosElement) {
      insumosElement.textContent = VEEX.formatters.currency(this.data.resumoCustos.insumos);
    }
    
    if (fixosElement) {
      fixosElement.textContent = VEEX.formatters.currency(this.data.resumoCustos.fixos);
    }
    
    if (variaveisElement) {
      variaveisElement.textContent = VEEX.formatters.currency(this.data.resumoCustos.variaveis);
    }
  },
  
  // Renderiza o slider de margem
  renderMargemSlider: function() {
    const margemSlider = document.getElementById('margemSlider');
    const margemValue = document.getElementById('margemValue');
    
    if (margemSlider && margemValue) {
      // Define o valor inicial
      margemSlider.value = 30;
      margemValue.textContent = '30%';
      
      // Adiciona evento de mudança
      margemSlider.addEventListener('input', function() {
        const value = this.value;
        margemValue.textContent = `${value}%`;
      });
    }
  },
  
  // Inicializa gráficos
  initCharts: function() {
    // Verifica se a biblioteca Chart.js está disponível
    if (typeof Chart === 'undefined') {
      console.warn('Dashboard: Chart.js não está disponível');
      return;
    }
    
    // Inicializa o gráfico de produção mensal
    this.initProducaoChart();
    
    // Inicializa o gráfico de distribuição de custos
    this.initCustosChart();
  },
  
  // Inicializa o gráfico de produção mensal
  initProducaoChart: function() {
    const ctx = document.getElementById('producaoChart');
    if (!ctx) return;
    
    // Dados de exemplo para o gráfico
    const labels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
    const data = [850, 920, 1050, 980, 1120, 1250];
    
    // Configuração do gráfico
    this.charts.producao = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Produção Mensal (pares)',
          data: data,
          borderColor: 'rgb(233, 30, 99)',
          backgroundColor: 'rgba(233, 30, 99, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(26, 31, 60, 0.9)',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: 'rgba(255, 255, 255, 0.2)',
            borderWidth: 1
          }
        },
        scales: {
          x: {
            grid: {
              color: 'rgba(255, 255, 255, 0.05)'
            },
            ticks: {
              color: 'rgba(255, 255, 255, 0.7)'
            }
          },
          y: {
            grid: {
              color: 'rgba(255, 255, 255, 0.05)'
            },
            ticks: {
              color: 'rgba(255, 255, 255, 0.7)'
            }
          }
        }
      }
    });
  },
  
  // Inicializa o gráfico de distribuição de custos
  initCustosChart: function() {
    const ctx = document.getElementById('custosChart');
    if (!ctx) return;
    
    // Dados para o gráfico
    const data = [
      this.data.resumoCustos.insumos,
      this.data.resumoCustos.fixos,
      this.data.resumoCustos.variaveis
    ];
    
    // Configuração do gráfico
    this.charts.custos = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Insumos', 'Custos Fixos', 'Custos Variáveis'],
        datasets: [{
          data: data,
          backgroundColor: [
            'rgb(233, 30, 99)',
            'rgb(33, 150, 243)',
            'rgb(255, 152, 0)'
          ],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: 'rgba(255, 255, 255, 0.7)',
              padding: 15,
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(26, 31, 60, 0.9)',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: 'rgba(255, 255, 255, 0.2)',
            borderWidth: 1,
            callbacks: {
              label: function(context) {
                const value = context.raw;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = Math.round((value / total) * 100);
                return `${context.label}: ${VEEX.formatters.currency(value)} (${percentage}%)`;
              }
            }
          }
        },
        cutout: '60%'
      }
    });
  },
  
  // Inicializa eventos
  initEvents: function() {
    // Exemplo de evento para atualizar dados
    const refreshBtn = document.getElementById('refreshDashboard');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        this.refreshData();
      });
    }
  },
  
  // Atualiza os dados do dashboard
  refreshData: function() {
    // Aqui você implementaria a lógica para buscar dados atualizados
    // Por enquanto, apenas recarrega a página
    window.location.reload();
  }
};
