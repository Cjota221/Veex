/**
 * VEEX - Correção de Interatividade
 * 
 * Este arquivo restaura a funcionalidade de todos os botões interativos
 * do sistema VEEX sem alterar o HTML ou CSS existente.
 * 
 * Adicione este arquivo após todos os outros scripts JS em cada página HTML.
 */

(function() {
    'use strict';
    
    // Executar quando o DOM estiver completamente carregado
    document.addEventListener('DOMContentLoaded', function() {
        console.log('VEEX-FIX: Inicializando correções de interatividade...');
        
        // Corrigir menu lateral mobile
        fixMobileMenu();
        
        // Corrigir botões de modal
        fixModalButtons();
        
        // Corrigir formulários
        fixForms();
        
        // Adicionar observador para elementos dinâmicos
        setupMutationObserver();
        
        console.log('VEEX-FIX: Correções aplicadas com sucesso!');
    });
    
    /**
     * Corrige o menu lateral mobile
     */
    function fixMobileMenu() {
        // Encontrar o botão de menu hambúrguer
        const menuToggle = document.getElementById('toggleSidebar') || 
                          document.querySelector('.menu-toggle') || 
                          document.querySelector('button:first-child');
        
        // Encontrar a sidebar
        const sidebar = document.querySelector('.sidebar');
        
        if (menuToggle && sidebar) {
            console.log('VEEX-FIX: Corrigindo menu mobile...');
            
            // Remover listeners existentes para evitar duplicação
            menuToggle.removeEventListener('click', toggleSidebar);
            
            // Adicionar novo listener
            menuToggle.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                toggleSidebar();
            });
            
            // Fechar menu ao clicar fora
            document.addEventListener('click', function(event) {
                if (!sidebar.contains(event.target) && 
                    !menuToggle.contains(event.target) && 
                    sidebar.classList.contains('active')) {
                    sidebar.classList.remove('active');
                }
            });
            
            // Fechar menu ao clicar em um item do menu (apenas em mobile)
            const menuItems = document.querySelectorAll('.menu-item');
            menuItems.forEach(item => {
                item.addEventListener('click', function() {
                    if (window.innerWidth <= 768) {
                        sidebar.classList.remove('active');
                    }
                });
            });
        }
    }
    
    /**
     * Função para alternar a visibilidade do sidebar
     */
    function toggleSidebar() {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            sidebar.classList.toggle('active');
            console.log('VEEX-FIX: Sidebar toggled:', sidebar.classList.contains('active'));
        }
    }
    
    /**
     * Corrige os botões que abrem modais
     */
    function fixModalButtons() {
        console.log('VEEX-FIX: Corrigindo botões de modal...');
        
        // Identificar a página atual
        const currentPage = window.location.pathname;
        
        // Determinar qual modal deve ser aberto com base na página atual
        let defaultModalId = null;
        
        if (currentPage.includes('producao')) {
            defaultModalId = 'producaoModal';
        } else if (currentPage.includes('insumos')) {
            defaultModalId = 'insumoModal';
        } else if (currentPage.includes('modelos')) {
            defaultModalId = 'modeloModal';
        } else if (currentPage.includes('custos-fixos')) {
            defaultModalId = 'custoFixoModal';
        } else if (currentPage.includes('custos-variaveis')) {
            defaultModalId = 'custoVariavelModal';
        } else if (currentPage.includes('estoque')) {
            defaultModalId = 'estoqueModal';
        }
        
        // Encontrar todos os botões que podem abrir modais
        const addButtons = Array.from(document.querySelectorAll('button')).filter(btn => 
            btn.textContent.includes('Adicionar') || 
            btn.textContent.includes('Registrar') || 
            btn.textContent.includes('Nova') ||
            btn.classList.contains('btn-add') ||
            btn.classList.contains('btn-new') ||
            btn.classList.contains('btn-primary')
        );
        
        // Adicionar evento a cada botão encontrado
        addButtons.forEach(button => {
            // Determinar qual modal abrir
            let modalId = button.getAttribute('data-modal') || defaultModalId;
            
            if (modalId) {
                // Remover listeners existentes para evitar duplicação
                button.removeEventListener('click', function() { openModal(modalId); });
                
                // Adicionar novo listener
                button.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('VEEX-FIX: Botão clicado, abrindo modal:', modalId);
                    openModal(modalId);
                });
                
                // Garantir que o botão tenha o atributo data-modal
                if (!button.hasAttribute('data-modal')) {
                    button.setAttribute('data-modal', modalId);
                }
            }
        });
        
        // Corrigir botões de fechar modal
        const closeButtons = document.querySelectorAll('.close, .btn-cancel');
        closeButtons.forEach(button => {
            button.addEventListener('click', function(e) {
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
            modal.addEventListener('click', function(event) {
                if (event.target === this) {
                    closeModal(this.id);
                }
            });
        });
    }
    
    /**
     * Corrige os formulários
     */
    function fixForms() {
        console.log('VEEX-FIX: Corrigindo formulários...');
        
        // Encontrar todos os formulários
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            // Remover listeners existentes para evitar duplicação
            form.removeEventListener('submit', handleFormSubmit);
            
            // Adicionar novo listener
            form.addEventListener('submit', handleFormSubmit);
        });
    }
    
    /**
     * Handler para envio de formulários
     */
    function handleFormSubmit(e) {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('VEEX-FIX: Formulário enviado');
        
        // Identificar a página atual
        const currentPage = window.location.pathname;
        
        // Executar função específica com base na página
        if (currentPage.includes('producao') && typeof handleProducaoSubmit === 'function') {
            handleProducaoSubmit(e);
        } else if (currentPage.includes('insumos') && typeof handleInsumoSubmit === 'function') {
            handleInsumoSubmit(e);
        } else if (currentPage.includes('modelos') && typeof handleModeloSubmit === 'function') {
            handleModeloSubmit(e);
        } else if (currentPage.includes('custos-fixos') && typeof handleCustoFixoSubmit === 'function') {
            handleCustoFixoSubmit(e);
        } else if (currentPage.includes('custos-variaveis') && typeof handleCustoVariavelSubmit === 'function') {
            handleCustoVariavelSubmit(e);
        } else {
            // Comportamento genérico para outros formulários
            const formData = new FormData(this);
            const formValues = {};
            
            for (let [key, value] of formData.entries()) {
                formValues[key] = value;
            }
            
            console.log('VEEX-FIX: Dados do formulário:', formValues);
            
            // Fechar modal associado
            const modal = this.closest('.modal');
            if (modal) {
                closeModal(modal.id);
            }
            
            // Mostrar notificação de sucesso
            if (typeof showNotification === 'function') {
                showNotification('Operação realizada com sucesso');
            } else {
                alert('Operação realizada com sucesso');
            }
        }
    }
    
    /**
     * Abrir modal
     */
    function openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden'; // Impedir rolagem do body
            console.log('VEEX-FIX: Modal aberto:', modalId);
        } else {
            console.error('VEEX-FIX: Modal não encontrado:', modalId);
        }
    }
    
    /**
     * Fechar modal
     */
    function closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = ''; // Restaurar rolagem do body
            console.log('VEEX-FIX: Modal fechado:', modalId);
        }
    }
    
    /**
     * Configurar observador de mutações para elementos dinâmicos
     */
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
                console.log('VEEX-FIX: DOM modificado, reinicializando eventos...');
                fixModalButtons();
                fixForms();
            }
        });
        
        // Iniciar observação do DOM
        observer.observe(document.body, { childList: true, subtree: true });
    }
    
    // Executar novamente após 1 segundo para garantir que todos os elementos estejam carregados
    setTimeout(function() {
        fixMobileMenu();
        fixModalButtons();
        fixForms();
    }, 1000);
    
})();
