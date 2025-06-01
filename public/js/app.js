// VEEX - Sistema de Gestão de Custos e Produção
// Arquivo: app.js
// Descrição: Funções globais e inicialização do sistema

// Inicialização do sistema
document.addEventListener('DOMContentLoaded', function() {
    console.log('VEEX: Sistema inicializado');
    
    // Inicializar menu mobile
    initMobileMenu();
    
    // Inicializar modais
    initModals();
    
    // Carregar dados iniciais (mock ou localStorage)
    loadInitialData();
    
    // Inicializar eventos específicos da página atual
    initPageSpecificEvents();
});

// Inicialização do menu mobile
function initMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });
        
        // Fechar menu ao clicar fora
        document.addEventListener('click', function(event) {
            if (!sidebar.contains(event.target) && !menuToggle.contains(event.target) && sidebar.classList.contains('active')) {
                sidebar.classList.remove('active');
            }
        });
    }
}

// Inicialização de modais
function initModals() {
    // Adicionar listeners para todos os botões que abrem modais
    const modalButtons = document.querySelectorAll('[data-modal]');
    
    modalButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modalId = this.getAttribute('data-modal');
            openModal(modalId);
        });
    });
    
    // Adicionar listeners para fechar modais
    const closeButtons = document.querySelectorAll('.close, .btn-cancel');
    
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            closeModal(modal.id);
        });
    });
    
    // Fechar modal ao clicar fora
    const modals = document.querySelectorAll('.modal');
    
    modals.forEach(modal => {
        modal.addEventListener('click', function(event) {
            if (event.target === this) {
                closeModal(this.id);
            }
        });
    });
}

// Abrir modal
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Impedir rolagem do body
    }
}

// Fechar modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = ''; // Restaurar rolagem do body
    }
}

// Carregar dados iniciais
function loadInitialData() {
    // Verificar se existem dados no localStorage
    if (!localStorage.getItem('veex_insumos')) {
        // Criar dados de exemplo
        const mockData = {
            insumos: [
                { id: 1, nome: 'Couro', unidade: 'm', custo: 50.00 },
                { id: 2, nome: 'Borracha', unidade: 'm', custo: 30.00 },
                { id: 3, nome: 'Cola', unidade: 'l', custo: 25.00 },
                { id: 4, nome: 'Linha', unidade: 'm', custo: 5.00 }
            ],
            modelos: [
                { id: 1, nome: 'Tênis de Corrida', custo: 80.00, margem: 0.25, preco: 120.00 },
                { id: 2, nome: 'Oxford Casual', custo: 63.00, margem: 0.30, preco: 120.00 },
                { id: 3, nome: 'Sandália', custo: 80.00, margem: 0.20, preco: 120.00 }
            ],
            producoes: [
                { id: 1, data: '2025-05-15', nome: 'Lote Maio - Tênis', modelo: 1, quantidade: 100, custo: 8000.00, lucro: 4000.00 },
                { id: 2, data: '2025-05-20', nome: 'Lote Maio - Oxford', modelo: 2, quantidade: 50, custo: 3150.00, lucro: 2850.00 }
            ],
            custosFixos: [
                { id: 1, nome: 'Aluguel', valor: 3000.00 },
                { id: 2, nome: 'Salários', valor: 5000.00 },
                { id: 3, nome: 'Energia', valor: 500.00 }
            ],
            custosVariaveis: [
                { id: 1, nome: 'Embalagens', valor: 2.00, porPar: true },
                { id: 2, nome: 'Transporte', valor: 1000.00, porPar: false }
            ]
        };
        
        // Salvar no localStorage
        for (const key in mockData) {
            localStorage.setItem(`veex_${key}`, JSON.stringify(mockData[key]));
        }
    }
}

// Inicializar eventos específicos da página atual
function initPageSpecificEvents() {
    const currentPage = window.location.pathname;
    
    if (currentPage.includes('index.html') || currentPage.endsWith('/')) {
        // Dashboard
        initDashboard();
    } else if (currentPage.includes('insumos.html')) {
        // Insumos
        loadInsumos();
    } else if (currentPage.includes('modelos.html')) {
        // Modelos
        loadModelos();
    } else if (currentPage.includes('producao.html')) {
        // Produção
        loadProducoes();
    } else if (currentPage.includes('custos-fixos.html')) {
        // Custos Fixos
        loadCustosFixos();
    } else if (currentPage.includes('custos-variaveis.html')) {
        // Custos Variáveis
        loadCustosVariaveis();
    }
}

// Funções utilitárias

// Formatar valor como moeda
function formatCurrency(value) {
    return 'R$ ' + parseFloat(value).toFixed(2).replace('.', ',');
}

// Gerar ID único
function generateId(collection) {
    const items = JSON.parse(localStorage.getItem(`veex_${collection}`)) || [];
    if (items.length === 0) return 1;
    
    const maxId = Math.max(...items.map(item => item.id));
    return maxId + 1;
}

// Mostrar notificação
function showNotification(message, type = 'success') {
    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Adicionar ao DOM
    document.body.appendChild(notification);
    
    // Mostrar com animação
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Remover após 3 segundos
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Verificar se é dispositivo móvel
function isMobile() {
    return window.innerWidth <= 768;
}
