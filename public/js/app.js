// VEEX - Sistema de Gestão de Custos e Produção
// Arquivo principal de JavaScript

// Configurações globais
const VEEX = {
  // Configurações do sistema
  config: {
    theme: 'dark',
    sidebarCollapsed: false,
    currency: 'BRL',
    dateFormat: 'DD/MM/YYYY',
    decimalSeparator: ',',
    thousandSeparator: '.',
    decimalPlaces: 2
  },
  
  // Inicialização do sistema
  init: function() {
    // Inicializa componentes da UI
    this.initSidebar();
    this.initTheme();
    this.initTooltips();
    this.initModals();
    
    // Inicializa formatadores
    this.initFormatters();
    
    // Inicializa armazenamento local
    this.storage.init();
    
    // Inicializa eventos globais
    this.initGlobalEvents();
    
    console.log('VEEX: Sistema inicializado');
  },
  
  // Inicialização da sidebar
  initSidebar: function() {
    const toggleBtn = document.getElementById('toggleSidebar');
    const sidebar = document.querySelector('.sidebar');
    
    if (toggleBtn && sidebar) {
      toggleBtn.addEventListener('click', function() {
        sidebar.classList.toggle('collapsed');
        VEEX.config.sidebarCollapsed = sidebar.classList.contains('collapsed');
        
        // Ajusta o conteúdo principal
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
          if (VEEX.config.sidebarCollapsed) {
            mainContent.style.marginLeft = 'var(--sidebar-collapsed-width)';
            mainContent.style.width = 'calc(100% - var(--sidebar-collapsed-width))';
          } else {
            mainContent.style.marginLeft = 'var(--sidebar-width)';
            mainContent.style.width = 'calc(100% - var(--sidebar-width))';
          }
        }
        
        // Salva a preferência do usuário
        localStorage.setItem('sidebarCollapsed', VEEX.config.sidebarCollapsed);
      });
      
      // Restaura o estado da sidebar
      const savedState = localStorage.getItem('sidebarCollapsed');
      if (savedState === 'true') {
        sidebar.classList.add('collapsed');
        VEEX.config.sidebarCollapsed = true;
        
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
          mainContent.style.marginLeft = 'var(--sidebar-collapsed-width)';
          mainContent.style.width = 'calc(100% - var(--sidebar-collapsed-width))';
        }
      }
    }
  },
  
  // Inicialização do tema
  initTheme: function() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      document.body.classList.remove('theme-dark', 'theme-light');
      document.body.classList.add(`theme-${savedTheme}`);
      VEEX.config.theme = savedTheme;
    }
  },
  
  // Alternar tema
  toggleTheme: function() {
    const currentTheme = VEEX.config.theme;
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.body.classList.remove(`theme-${currentTheme}`);
    document.body.classList.add(`theme-${newTheme}`);
    
    VEEX.config.theme = newTheme;
    localStorage.setItem('theme', newTheme);
  },
  
  // Inicialização de tooltips
  initTooltips: function() {
    const tooltips = document.querySelectorAll('[data-tooltip]');
    tooltips.forEach(tooltip => {
      tooltip.classList.add('modal-tooltip');
    });
  },
  
  // Inicialização de modais
  initModals: function() {
    // Abrir modal
    document.querySelectorAll('[data-modal-target]').forEach(trigger => {
      trigger.addEventListener('click', function() {
        const modalId = this.getAttribute('data-modal-target');
        VEEX.openModal(modalId);
      });
    });
    
    // Fechar modal com botão de fechar
    document.querySelectorAll('.btn-close, [data-dismiss="modal"]').forEach(closeBtn => {
      closeBtn.addEventListener('click', function() {
        const modal = this.closest('.modal');
        if (modal) {
          VEEX.closeModal(modal.id);
        }
      });
    });
    
    // Fechar modal clicando fora
    document.querySelectorAll('.modal').forEach(modal => {
      modal.addEventListener('click', function(e) {
        if (e.target === this) {
          VEEX.closeModal(this.id);
        }
      });
    });
  },
  
  // Abrir modal
  openModal: function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('show');
      document.body.style.overflow = 'hidden';
    }
  },
  
  // Fechar modal
  closeModal: function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('show');
      document.body.style.overflow = '';
    }
  },
  
  // Inicialização de formatadores
  initFormatters: function() {
    // Formatadores de número e moeda
    this.formatters = {
      // Formata número
      number: function(value, decimals = VEEX.config.decimalPlaces) {
        if (value === null || value === undefined || isNaN(value)) return '0';
        
        return Number(value).toFixed(decimals)
          .replace('.', VEEX.config.decimalSeparator)
          .replace(/\B(?=(\d{3})+(?!\d))/g, VEEX.config.thousandSeparator);
      },
      
      // Formata moeda
      currency: function(value, symbol = 'R$') {
        if (value === null || value === undefined || isNaN(value)) return `${symbol} 0,00`;
        
        return `${symbol} ${VEEX.formatters.number(value, 2)}`;
      },
      
      // Formata data
      date: function(value) {
        if (!value) return '';
        
        const date = new Date(value);
        if (isNaN(date.getTime())) return '';
        
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        
        return `${day}/${month}/${year}`;
      },
      
      // Formata porcentagem
      percent: function(value, decimals = 1) {
        if (value === null || value === undefined || isNaN(value)) return '0%';
        
        return `${VEEX.formatters.number(value, decimals)}%`;
      }
    };
  },
  
  // Inicialização de eventos globais
  initGlobalEvents: function() {
    // Evento de redimensionamento da janela
    window.addEventListener('resize', function() {
      VEEX.handleResponsiveLayout();
    });
    
    // Inicializa o layout responsivo
    VEEX.handleResponsiveLayout();
    
    // Evento de teclas globais
    document.addEventListener('keydown', function(e) {
      // Fechar modais com ESC
      if (e.key === 'Escape') {
        const openModals = document.querySelectorAll('.modal.show');
        if (openModals.length > 0) {
          openModals.forEach(modal => {
            VEEX.closeModal(modal.id);
          });
        }
      }
    });
  },
  
  // Manipulação de layout responsivo
  handleResponsiveLayout: function() {
    const width = window.innerWidth;
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    
    if (width < 768) {
      // Mobile: colapsa a sidebar automaticamente
      if (sidebar && !sidebar.classList.contains('collapsed')) {
        sidebar.classList.add('collapsed');
        
        if (mainContent) {
          mainContent.style.marginLeft = 'var(--sidebar-collapsed-width)';
          mainContent.style.width = 'calc(100% - var(--sidebar-collapsed-width))';
        }
      }
    }
  },
  
  // Módulo de armazenamento local
  storage: {
    // Inicialização do armazenamento
    init: function() {
      // Verifica se o localStorage está disponível
      this.available = this.checkAvailability();
      
      if (!this.available) {
        console.warn('VEEX: LocalStorage não está disponível. Os dados não serão persistidos.');
      }
    },
    
    // Verifica disponibilidade do localStorage
    checkAvailability: function() {
      try {
        const test = 'test';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
      } catch (e) {
        return false;
      }
    },
    
    // Salva dados
    save: function(key, data) {
      if (!this.available) return false;
      
      try {
        const serialized = JSON.stringify(data);
        localStorage.setItem(`veex_${key}`, serialized);
        return true;
      } catch (e) {
        console.error('VEEX: Erro ao salvar dados', e);
        return false;
      }
    },
    
    // Carrega dados
    load: function(key, defaultValue = null) {
      if (!this.available) return defaultValue;
      
      try {
        const serialized = localStorage.getItem(`veex_${key}`);
        if (serialized === null) return defaultValue;
        
        return JSON.parse(serialized);
      } catch (e) {
        console.error('VEEX: Erro ao carregar dados', e);
        return defaultValue;
      }
    },
    
    // Remove dados
    remove: function(key) {
      if (!this.available) return false;
      
      try {
        localStorage.removeItem(`veex_${key}`);
        return true;
      } catch (e) {
        console.error('VEEX: Erro ao remover dados', e);
        return false;
      }
    },
    
    // Limpa todos os dados
    clear: function() {
      if (!this.available) return false;
      
      try {
        // Remove apenas as chaves do VEEX
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('veex_')) {
            localStorage.removeItem(key);
          }
        });
        return true;
      } catch (e) {
        console.error('VEEX: Erro ao limpar dados', e);
        return false;
      }
    }
  },
  
  // Utilitários
  utils: {
    // Gera um ID único
    generateId: function() {
      return 'id_' + Math.random().toString(36).substr(2, 9);
    },
    
    // Debounce para evitar múltiplas chamadas de função
    debounce: function(func, wait) {
      let timeout;
      return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
      };
    },
    
    // Formata um número como moeda
    formatCurrency: function(value) {
      return VEEX.formatters.currency(value);
    },
    
    // Formata um número como porcentagem
    formatPercent: function(value) {
      return VEEX.formatters.percent(value);
    },
    
    // Formata uma data
    formatDate: function(value) {
      return VEEX.formatters.date(value);
    },
    
    // Converte string para número
    parseNumber: function(value) {
      if (typeof value === 'number') return value;
      if (!value) return 0;
      
      // Remove separadores de milhar e substitui separador decimal
      return parseFloat(
        value.toString()
          .replace(new RegExp(`\\${VEEX.config.thousandSeparator}`, 'g'), '')
          .replace(VEEX.config.decimalSeparator, '.')
      );
    }
  }
};

// Inicializa o sistema quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
  VEEX.init();
});
