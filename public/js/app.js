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
    // Suporta tanto menuToggle quanto toggleSidebar como IDs
    const menuToggle = document.getElementById('menuToggle') || document.getElementById('toggleSidebar');
    const sidebar = document.querySelector('.sidebar');
    
    if (menuToggle && sidebar) {
        console.log('Menu mobile inicializado');
        
        // Remover listeners existentes para evitar duplicação
        const newMenuToggle = menuToggle.cloneNode(true);
        menuToggle.parentNode.replaceChild(newMenuToggle, menuToggle);
        
        // Adicionar novo listener
        newMenuToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Menu toggle clicado');
            sidebar.classList.toggle('active');
        });
        
        // Fechar menu ao clicar fora
        document.addEventListener('click', function(event) {
            if (!sidebar.contains(event.target) && !newMenuToggle.contains(event.target) && sidebar.classList.contains('active')) {
                sidebar.classList.remove('active');
            }
        });
        
        // Fechar menu ao clicar em um item do menu (apenas em mobile)
        const menuItems = document.querySelectorAll('.sidebar a, .menu-item');
        menuItems.forEach(item => {
            item.addEventListener('click', function() {
                if (window.innerWidth <= 768) {
                    sidebar.classList.remove('active');
                }
            });
        });
        
        // Verificar tamanho da tela ao carregar
        checkScreenSize();
        
        // Verificar tamanho da tela ao redimensionar
        window.addEventListener('resize', checkScreenSize);
    }
}

// Verificar tamanho da tela para menu mobile
function checkScreenSize() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        if (window.innerWidth <= 768) {
            sidebar.classList.remove('active');
        }
    }
}

// Inicialização de modais
function initModals() {
    console.log('Inicializando modais');
    
    // Adicionar listeners para todos os botões que abrem modais
    const modalButtons = document.querySelectorAll('[data-modal]');
    
    modalButtons.forEach(button => {
        // Remover listeners existentes para evitar duplicação
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        // Adicionar novo listener
        newButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const modalId = this.getAttribute('data-modal');
            console.log('Botão modal clicado, abrindo:', modalId);
            openModal(modalId);
        });
    });
    
    // Adicionar listeners para botões de adicionar/registrar sem atributo data-modal
    const addButtons = Array.from(document.querySelectorAll('button')).filter(btn => 
        btn.textContent.includes('Adicionar') || 
        btn.textContent.includes('Registrar') || 
        btn.textContent.includes('Nova') ||
        btn.classList.contains('btn-add') ||
        btn.classList.contains('btn-new')
    );
    
    addButtons.forEach(button => {
        if (!button.hasAttribute('data-modal')) {
            // Determinar qual modal abrir com base na página atual
            let modalId = null;
            const currentPage = window.location.pathname;
            
            if (currentPage.includes('producao')) {
                modalId = 'producaoModal';
            } else if (currentPage.includes('insumos')) {
                modalId = 'insumoModal';
            } else if (currentPage.includes('modelos')) {
                modalId = 'modeloModal';
            } else if (currentPage.includes('custos-fixos')) {
                modalId = 'custoFixoModal';
            } else if (currentPage.includes('custos-variaveis')) {
                modalId = 'custoVariavelModal';
            } else if (currentPage.includes('estoque')) {
                modalId = 'estoqueModal';
            }
            
            if (modalId) {
                // Adicionar atributo data-modal
                button.setAttribute('data-modal', modalId);
                
                // Remover listeners existentes para evitar duplicação
                const newButton = button.cloneNode(true);
                button.parentNode.replaceChild(newButton, button);
                
                // Adicionar novo listener
                newButton.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Botão de adicionar clicado, abrindo:', modalId);
                    
                    // Limpar formulário antes de abrir o modal
                    const formId = modalId.replace('Modal', '');
                    if (typeof window[`clear${formId}Form`] === 'function') {
                        window[`clear${formId}Form`]();
                    }
                    
                    openModal(modalId);
                });
            }
        }
    });
    
    // Adicionar listeners para fechar modais
    const closeButtons = document.querySelectorAll('.close, .btn-cancel');
    
    closeButtons.forEach(button => {
        // Remover listeners existentes para evitar duplicação
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        // Adicionar novo listener
        newButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const modal = this.closest('.modal');
            if (modal) {
                closeModal(modal.id);
            }
        });
    });
    
    // Fechar modal ao clicar fora
    const modals = document.querySelectorAll('.modal');
    
    modals.forEach(modal => {
        // Remover listeners existentes para evitar duplicação
        const newModal = modal.cloneNode(true);
        modal.parentNode.replaceChild(newModal, modal);
        
        // Adicionar novo listener
        newModal.addEventListener('click', function(event) {
            if (event.target === this) {
                closeModal(this.id);
            }
        });
        
        // Readicionar listeners para botões dentro do modal
        const closeButtons = newModal.querySelectorAll('.close, .btn-cancel');
        closeButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                closeModal(newModal.id);
            });
        });
        
        // Readicionar listeners para formulários dentro do modal
        const form = newModal.querySelector('form');
        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                // Determinar qual handler chamar com base no ID do modal
                const formId = newModal.id.replace('Modal', '');
                const handlerName = `handle${formId}Submit`;
                
                if (typeof window[handlerName] === 'function') {
                    window[handlerName](e);
                } else {
                    console.warn(`Handler ${handlerName} não encontrado`);
                    closeModal(newModal.id);
                }
            });
        }
    });
}

// Abrir modal
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Impedir rolagem do body
        console.log('Modal aberto:', modalId);
    } else {
        console.error('Modal não encontrado:', modalId);
    }
}

// Fechar modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = ''; // Restaurar rolagem do body
        console.log('Modal fechado:', modalId);
    }
}

// Carregar dados iniciais
function loadInitialData() {
    // Verificar se existem dados no localStorage
    if (!localStorage.getItem('veex_insumos')) {
        console.log('Carregando dados iniciais...');
        
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
    
    console.log('Inicializando eventos específicos para:', currentPage);
    
    // Adicionar evento aos botões de adicionar
    const addButtons = document.querySelectorAll('.btn-add, [id$="Btn"]');
    addButtons.forEach(button => {
        if (button.id && button.id.startsWith('add')) {
            const modalId = button.id.replace('add', '').replace('Btn', 'Modal');
            button.setAttribute('data-modal', modalId);
        }
    });
    
    // Inicializar página específica
    if (currentPage.includes('index.html') || currentPage.endsWith('/')) {
        // Dashboard
        if (typeof initDashboard === 'function') {
            initDashboard();
        }
    } else if (currentPage.includes('insumos.html')) {
        // Insumos
        if (typeof loadInsumos === 'function') {
            loadInsumos();
        }
    } else if (currentPage.includes('modelos.html')) {
        // Modelos
        if (typeof loadModelos === 'function') {
            loadModelos();
        }
    } else if (currentPage.includes('producao.html')) {
        // Produção
        if (typeof loadProducoes === 'function') {
            loadProducoes();
        }
    } else if (currentPage.includes('custos-fixos.html')) {
        // Custos Fixos
        if (typeof loadCustosFixos === 'function') {
            loadCustosFixos();
        }
    } else if (currentPage.includes('custos-variaveis.html')) {
        // Custos Variáveis
        if (typeof loadCustosVariaveis === 'function') {
            loadCustosVariaveis();
        }
    } else if (currentPage.includes('estoque.html')) {
        // Estoque
        if (typeof loadEstoque === 'function') {
            loadEstoque();
        }
    } else if (currentPage.includes('financeiro.html')) {
        // Financeiro
        if (typeof loadFinanceiro === 'function') {
            loadFinanceiro();
        }
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

// Namespace VEEX para compatibilidade com outros scripts
window.VEEX = {
    formatters: {
        currency: formatCurrency
    },
    storage: {
        load: function(collection) {
            return JSON.parse(localStorage.getItem(`veex_${collection}`)) || [];
        },
        save: function(collection, data) {
            localStorage.setItem(`veex_${collection}`, JSON.stringify(data));
        },
        getById: function(collection, id) {
            const items = this.load(collection);
            return items.find(item => item.id === parseInt(id));
        }
    },
    ui: {
        openModal: openModal,
        closeModal: closeModal,
        showNotification: showNotification
    }
};

// Configurar observador de mutações para elementos dinâmicos
function setupMutationObserver() {
    // Criar um observador de mutações
    const observer = new MutationObserver(function(mutations) {
        let shouldReinitialize = false;
        
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                // Verificar se algum dos nós adicionados é um botão ou contém botões
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) { // Elemento
                        if (node.tagName === 'BUTTON' || 
                            node.querySelector('button') || 
                            node.hasAttribute('data-modal') || 
                            node.querySelector('[data-modal]')) {
                            shouldReinitialize = true;
                        }
                    }
                });
            }
        });
        
        if (shouldReinitialize) {
            console.log('DOM modificado, reinicializando eventos...');
            initModals();
        }
    });
    
    // Iniciar observação do DOM
    observer.observe(document.body, { childList: true, subtree: true });
}

// Inicializar observador de mutações
setTimeout(setupMutationObserver, 1000);

// Executar novamente após 1 segundo para garantir que todos os elementos estejam carregados
setTimeout(function() {
    initMobileMenu();
    initModals();
}, 1000);
