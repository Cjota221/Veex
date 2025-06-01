// VEEX - Sistema de Gestão de Custos e Produção
// Arquivo: app-minimal.js
// Descrição: Versão minimalista com apenas funções essenciais

// Inicialização do sistema
document.addEventListener('DOMContentLoaded', function() {
  console.log('VEEX: Sistema inicializado (versão minimalista)');
  
  // Inicializar menu mobile
  initMobileMenu();
  
  // Inicializar modais
  initModals();
});

// Inicialização do menu mobile
function initMobileMenu() {
  const menuToggle = document.getElementById('menuToggle') || document.getElementById('toggleSidebar');
  const sidebar = document.querySelector('.sidebar');
  
  if (menuToggle && sidebar) {
    console.log('Menu mobile inicializado');
    
    menuToggle.addEventListener('click', function(e) {
      e.preventDefault();
      sidebar.classList.toggle('active');
    });
  }
}

// Inicialização de modais
function initModals() {
  console.log('Inicializando modais');
  
  // Adicionar listeners para todos os botões que abrem modais
  const modalButtons = document.querySelectorAll('[data-modal]');
  
  modalButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      const modalId = this.getAttribute('data-modal');
      openModal(modalId);
    });
  });
  
  // Adicionar listeners para botões de adicionar/registrar sem atributo data-modal
  const addButtons = Array.from(document.querySelectorAll('button')).filter(btn => 
    btn.textContent.includes('Adicionar') || 
    btn.textContent.includes('Registrar')
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
      }
      
      if (modalId) {
        button.setAttribute('data-modal', modalId);
        
        button.addEventListener('click', function(e) {
          e.preventDefault();
          openModal(modalId);
        });
      }
    }
  });
  
  // Adicionar listeners para fechar modais
  const closeButtons = document.querySelectorAll('.close, .btn-cancel');
  
  closeButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
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

// Abrir modal
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

// Fechar modal
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// Formatar valor como moeda
function formatCurrency(value) {
  return 'R$ ' + parseFloat(value).toFixed(2).replace('.', ',');
}

// Mostrar notificação
function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}
