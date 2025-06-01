// VEEX - Sistema de Gestão de Custos e Produção
// Arquivo: app-simplified.js
// Descrição: Versão simplificada com todas as funções essenciais em um único arquivo

// Namespace global VEEX
window.VEEX = {
    // Formatadores
    formatters: {
        currency: function(value) {
            return 'R$ ' + parseFloat(value).toFixed(2).replace('.', ',');
        }
    },
    
    // Armazenamento
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
        },
        deleteById: function(collection, id) {
            const items = this.load(collection);
            const index = items.findIndex(item => item.id === parseInt(id));
            if (index !== -1) {
                items.splice(index, 1);
                this.save(collection, items);
                return true;
            }
            return false;
        },
        generateId: function(collection) {
            const items = this.load(collection);
            if (items.length === 0) return 1;
            const maxId = Math.max(...items.map(item => item.id || 0));
            return maxId + 1;
        }
    },
    
    // Interface do usuário
    ui: {
        openModal: function(modalId) {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
                console.log('Modal aberto:', modalId);
            } else {
                console.error('Modal não encontrado:', modalId);
            }
        },
        closeModal: function(modalId) {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.remove('active');
                document.body.style.overflow = '';
                console.log('Modal fechado:', modalId);
            }
        },
        showNotification: function(message, type = 'success') {
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
    }
};

// Funções utilitárias globais para compatibilidade com scripts existentes
function formatCurrency(value) {
    return VEEX.formatters.currency(value);
}

function generateId(collection) {
    return VEEX.storage.generateId(collection);
}

function openModal(modalId) {
    VEEX.ui.openModal(modalId);
}

function closeModal(modalId) {
    VEEX.ui.closeModal(modalId);
}

function showNotification(message, type = 'success') {
    VEEX.ui.showNotification(message, type);
}

function isMobile() {
    return window.innerWidth <= 768;
}

function deleteItem(collection, id) {
    return VEEX.storage.deleteById(collection, id);
}

// Inicialização do sistema
document.addEventListener('DOMContentLoaded', function() {
    console.log('VEEX: Sistema inicializado (versão simplificada)');
    
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
        
        // Adicionar listener para toggle do menu
        menuToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Menu toggle clicado');
            sidebar.classList.toggle('active');
        });
        
        // Fechar menu ao clicar fora
        document.addEventListener('click', function(event) {
            if (!sidebar.contains(event.target) && !menuToggle.contains(event.target) && sidebar.classList.contains('active')) {
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
        button.addEventListener('click', function(e) {
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
                
                // Adicionar listener
                button.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Botão de adicionar clicado, abrindo:', modalId);
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
    
    // Implementações básicas para cada página
    if (currentPage.includes('insumos.html')) {
        // Insumos - Implementação básica
        implementInsumosPage();
    } else if (currentPage.includes('modelos.html')) {
        // Modelos - Implementação básica
        implementModelosPage();
    } else if (currentPage.includes('producao.html')) {
        // Produção - Implementação básica
        implementProducaoPage();
    } else if (currentPage.includes('custos-fixos.html')) {
        // Custos Fixos - Implementação básica
        implementCustosFixosPage();
    } else if (currentPage.includes('custos-variaveis.html')) {
        // Custos Variáveis - Implementação básica
        implementCustosVariaveisPage();
    }
}

// Implementações básicas para cada página
function implementInsumosPage() {
    // Carregar insumos
    const insumos = VEEX.storage.load('insumos');
    const tableBody = document.querySelector('table tbody');
    
    if (tableBody) {
        // Limpar tabela
        tableBody.innerHTML = '';
        
        if (insumos.length === 0) {
            // Mostrar mensagem de nenhum insumo
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="4" class="text-center">Nenhum insumo cadastrado.</td>`;
            tableBody.appendChild(row);
        } else {
            // Preencher tabela com dados
            insumos.forEach(insumo => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${insumo.nome}</td>
                    <td>${insumo.unidade}</td>
                    <td>${formatCurrency(insumo.custo)}</td>
                    <td>
                        <button class="btn-icon btn-edit" onclick="editInsumo(${insumo.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-delete" onclick="deleteInsumo(${insumo.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        }
    }
    
    // Adicionar evento ao formulário
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const id = form.getAttribute('data-id');
            const nome = document.querySelector('input[name="nome"]').value;
            const unidade = document.querySelector('input[name="unidade"]').value;
            const custo = parseFloat(document.querySelector('input[name="custo"]').value);
            
            if (!nome || !unidade || isNaN(custo)) {
                showNotification('Preencha todos os campos corretamente', 'error');
                return;
            }
            
            const insumo = { nome, unidade, custo };
            
            if (id) {
                // Editar insumo existente
                insumo.id = parseInt(id);
                const insumos = VEEX.storage.load('insumos');
                const index = insumos.findIndex(i => i.id === insumo.id);
                if (index !== -1) {
                    insumos[index] = insumo;
                    VEEX.storage.save('insumos', insumos);
                    showNotification('Insumo atualizado com sucesso');
                }
            } else {
                // Adicionar novo insumo
                insumo.id = generateId('insumos');
                const insumos = VEEX.storage.load('insumos');
                insumos.push(insumo);
                VEEX.storage.save('insumos', insumos);
                showNotification('Insumo adicionado com sucesso');
            }
            
            // Fechar modal e recarregar dados
            closeModal('insumoModal');
            implementInsumosPage();
            
            // Limpar formulário
            form.removeAttribute('data-id');
            form.reset();
        });
    }
    
    // Definir funções globais para editar e excluir insumos
    window.editInsumo = function(id) {
        const insumo = VEEX.storage.getById('insumos', id);
        if (!insumo) return;
        
        const form = document.querySelector('form');
        if (!form) return;
        
        form.setAttribute('data-id', insumo.id);
        
        const inputNome = document.querySelector('input[name="nome"]');
        const inputUnidade = document.querySelector('input[name="unidade"]');
        const inputCusto = document.querySelector('input[name="custo"]');
        
        if (inputNome) inputNome.value = insumo.nome;
        if (inputUnidade) inputUnidade.value = insumo.unidade;
        if (inputCusto) inputCusto.value = insumo.custo;
        
        openModal('insumoModal');
    };
    
    window.deleteInsumo = function(id) {
        if (confirm('Tem certeza que deseja excluir este insumo?')) {
            if (deleteItem('insumos', id)) {
                showNotification('Insumo excluído com sucesso');
                implementInsumosPage();
            } else {
                showNotification('Erro ao excluir insumo', 'error');
            }
        }
    };
}

function implementModelosPage() {
    // Implementação básica para modelos
    const modelos = VEEX.storage.load('modelos');
    const container = document.querySelector('.card-grid') || document.querySelector('.container');
    
    if (container) {
        // Limpar container
        const existingCards = container.querySelectorAll('.card:not(.card-add)');
        existingCards.forEach(card => card.remove());
        
        // Adicionar cards de modelos
        modelos.forEach(modelo => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <div class="card-header">
                    <h3>${modelo.nome}</h3>
                </div>
                <div class="card-content">
                    <p><strong>Custo:</strong> ${formatCurrency(modelo.custo)}</p>
                    <p><strong>Preço:</strong> ${formatCurrency(modelo.preco)}</p>
                    <p><strong>Margem:</strong> ${(modelo.margem * 100).toFixed(0)}%</p>
                </div>
                <div class="card-footer">
                    <button class="btn-icon btn-edit" onclick="editModelo(${modelo.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-delete" onclick="deleteModelo(${modelo.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            // Inserir antes do card de adicionar
            const addCard = container.querySelector('.card-add');
            if (addCard) {
                container.insertBefore(card, addCard);
            } else {
                container.appendChild(card);
            }
        });
    }
    
    // Adicionar evento ao formulário
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const id = form.getAttribute('data-id');
            const nome = document.querySelector('input[name="nome"]').value;
            const custo = parseFloat(document.querySelector('input[name="custo"]').value);
            const preco = parseFloat(document.querySelector('input[name="preco"]').value);
            
            if (!nome || isNaN(custo) || isNaN(preco)) {
                showNotification('Preencha todos os campos corretamente', 'error');
                return;
            }
            
            const margem = (preco - custo) / preco;
            const modelo = { nome, custo, preco, margem };
            
            if (id) {
                // Editar modelo existente
                modelo.id = parseInt(id);
                const modelos = VEEX.storage.load('modelos');
                const index = modelos.findIndex(m => m.id === modelo.id);
                if (index !== -1) {
                    modelos[index] = modelo;
                    VEEX.storage.save('modelos', modelos);
                    showNotification('Modelo atualizado com sucesso');
                }
            } else {
                // Adicionar novo modelo
                modelo.id = generateId('modelos');
                const modelos = VEEX.storage.load('modelos');
                modelos.push(modelo);
                VEEX.storage.save('modelos', modelos);
                showNotification('Modelo adicionado com sucesso');
            }
            
            // Fechar modal e recarregar dados
            closeModal('modeloModal');
            implementModelosPage();
            
            // Limpar formulário
            form.removeAttribute('data-id');
            form.reset();
        });
    }
    
    // Definir funções globais para editar e excluir modelos
    window.editModelo = function(id) {
        const modelo = VEEX.storage.getById('modelos', id);
        if (!modelo) return;
        
        const form = document.querySelector('form');
        if (!form) return;
        
        form.setAttribute('data-id', modelo.id);
        
        const inputNome = document.querySelector('input[name="nome"]');
        const inputCusto = document.querySelector('input[name="custo"]');
        const inputPreco = document.querySelector('input[name="preco"]');
        
        if (inputNome) inputNome.value = modelo.nome;
        if (inputCusto) inputCusto.value = modelo.custo;
        if (inputPreco) inputPreco.value = modelo.preco;
        
        openModal('modeloModal');
    };
    
    window.deleteModelo = function(id) {
        if (confirm('Tem certeza que deseja excluir este modelo?')) {
            if (deleteItem('modelos', id)) {
                showNotification('Modelo excluído com sucesso');
                implementModelosPage();
            } else {
                showNotification('Erro ao excluir modelo', 'error');
            }
        }
    };
}

function implementProducaoPage() {
    // Implementação básica para produção
    const producoes = VEEX.storage.load('producoes');
    const tableBody = document.querySelector('table tbody');
    
    if (tableBody) {
        // Limpar tabela
        tableBody.innerHTML = '';
        
        if (producoes.length === 0) {
            // Mostrar mensagem de nenhuma produção
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="5" class="text-center">Nenhuma produção registrada.</td>`;
            tableBody.appendChild(row);
        } else {
            // Preencher tabela com dados
            producoes.forEach(producao => {
                const modelo = VEEX.storage.getById('modelos', producao.modelo);
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${producao.data}</td>
                    <td>${producao.nome}</td>
                    <td>${modelo ? modelo.nome : 'Modelo não encontrado'}</td>
                    <td>${producao.quantidade}</td>
                    <td>
                        <button class="btn-icon btn-edit" onclick="editProducao(${producao.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-delete" onclick="deleteProducao(${producao.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        }
    }
    
    // Adicionar evento ao formulário
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const id = form.getAttribute('data-id');
            const nome = document.querySelector('input[name="nome"]').value;
            const data = document.querySelector('input[name="data"]').value;
            const modeloId = parseInt(document.querySelector('select[name="modelo"]').value);
            const quantidade = parseInt(document.querySelector('input[name="quantidade"]').value);
            
            if (!nome || !data || isNaN(modeloId) || isNaN(quantidade)) {
                showNotification('Preencha todos os campos corretamente', 'error');
                return;
            }
            
            const modelo = VEEX.storage.getById('modelos', modeloId);
            if (!modelo) {
                showNotification('Modelo não encontrado', 'error');
                return;
            }
            
            const custo = modelo.custo * quantidade;
            const lucro = (modelo.preco - modelo.custo) * quantidade;
            
            const producao = { 
                nome, 
                data, 
                modelo: modeloId, 
                quantidade,
                custo,
                lucro
            };
            
            if (id) {
                // Editar produção existente
                producao.id = parseInt(id);
                const producoes = VEEX.storage.load('producoes');
                const index = producoes.findIndex(p => p.id === producao.id);
                if (index !== -1) {
                    producoes[index] = producao;
                    VEEX.storage.save('producoes', producoes);
                    showNotification('Produção atualizada com sucesso');
                }
            } else {
                // Adicionar nova produção
                producao.id = generateId('producoes');
                const producoes = VEEX.storage.load('producoes');
                producoes.push(producao);
                VEEX.storage.save('producoes', producoes);
                showNotification('Produção registrada com sucesso');
            }
            
            // Fechar modal e recarregar dados
            closeModal('producaoModal');
            implementProducaoPage();
            
            // Limpar formulário
            form.removeAttribute('data-id');
            form.reset();
        });
    }
    
    // Preencher select de modelos
    const selectModelo = document.querySelector('select[name="modelo"]');
    if (selectModelo) {
        // Limpar select
        selectModelo.innerHTML = '<option value="">Selecione um modelo</option>';
        
        // Preencher com modelos
        const modelos = VEEX.storage.load('modelos');
        modelos.forEach(modelo => {
            const option = document.createElement('option');
            option.value = modelo.id;
            option.textContent = modelo.nome;
            selectModelo.appendChild(option);
        });
    }
    
    // Definir funções globais para editar e excluir produções
    window.editProducao = function(id) {
        const producao = VEEX.storage.getById('producoes', id);
        if (!producao) return;
        
        const form = document.querySelector('form');
        if (!form) return;
        
        form.setAttribute('data-id', producao.id);
        
        const inputNome = document.querySelector('input[name="nome"]');
        const inputData = document.querySelector('input[name="data"]');
        const selectModelo = document.querySelector('select[name="modelo"]');
        const inputQuantidade = document.querySelector('input[name="quantidade"]');
        
        if (inputNome) inputNome.value = producao.nome;
        if (inputData) inputData.value = producao.data;
        if (selectModelo) selectModelo.value = producao.modelo;
        if (inputQuantidade) inputQuantidade.value = producao.quantidade;
        
        openModal('producaoModal');
    };
    
    window.deleteProducao = function(id) {
        if (confirm('Tem certeza que deseja excluir esta produção?')) {
            if (deleteItem('producoes', id)) {
                showNotification('Produção excluída com sucesso');
                implementProducaoPage();
            } else {
                showNotification('Erro ao excluir produção', 'error');
            }
        }
    };
}

function implementCustosFixosPage() {
    // Implementação básica para custos fixos
    const custosFixos = VEEX.storage.load('custosFixos');
    const tableBody = document.querySelector('table tbody');
    
    if (tableBody) {
        // Limpar tabela
        tableBody.innerHTML = '';
        
        if (custosFixos.length === 0) {
            // Mostrar mensagem de nenhum custo fixo
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="3" class="text-center">Nenhum custo fixo cadastrado.</td>`;
            tableBody.appendChild(row);
        } else {
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
            
            // Adicionar linha de total
            const totalValor = custosFixos.reduce((total, custoFixo) => total + custoFixo.valor, 0);
            const rowTotal = document.createElement('tr');
            rowTotal.className = 'total-row';
            rowTotal.innerHTML = `
                <td><strong>Total</strong></td>
                <td><strong>${formatCurrency(totalValor)}</strong></td>
                <td></td>
            `;
            tableBody.appendChild(rowTotal);
        }
    }
    
    // Adicionar evento ao formulário
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const id = form.getAttribute('data-id');
            const nome = document.querySelector('input[name="nome"]').value;
            const valor = parseFloat(document.querySelector('input[name="valor"]').value);
            
            if (!nome || isNaN(valor)) {
                showNotification('Preencha todos os campos corretamente', 'error');
                return;
            }
            
            const custoFixo = { nome, valor };
            
            if (id) {
                // Editar custo fixo existente
                custoFixo.id = parseInt(id);
                const custosFixos = VEEX.storage.load('custosFixos');
                const index = custosFixos.findIndex(c => c.id === custoFixo.id);
                if (index !== -1) {
                    custosFixos[index] = custoFixo;
                    VEEX.storage.save('custosFixos', custosFixos);
                    showNotification('Custo fixo atualizado com sucesso');
                }
            } else {
                // Adicionar novo custo fixo
                custoFixo.id = generateId('custosFixos');
                const custosFixos = VEEX.storage.load('custosFixos');
                custosFixos.push(custoFixo);
                VEEX.storage.save('custosFixos', custosFixos);
                showNotification('Custo fixo adicionado com sucesso');
            }
            
            // Fechar modal e recarregar dados
            closeModal('custoFixoModal');
            implementCustosFixosPage();
            
            // Limpar formulário
            form.removeAttribute('data-id');
            form.reset();
        });
    }
    
    // Definir funções globais para editar e excluir custos fixos
    window.editCustoFixo = function(id) {
        const custoFixo = VEEX.storage.getById('custosFixos', id);
        if (!custoFixo) return;
        
        const form = document.querySelector('form');
        if (!form) return;
        
        form.setAttribute('data-id', custoFixo.id);
        
        const inputNome = document.querySelector('input[name="nome"]');
        const inputValor = document.querySelector('input[name="valor"]');
        
        if (inputNome) inputNome.value = custoFixo.nome;
        if (inputValor) inputValor.value = custoFixo.valor;
        
        openModal('custoFixoModal');
    };
    
    window.deleteCustoFixo = function(id) {
        if (confirm('Tem certeza que deseja excluir este custo fixo?')) {
            if (deleteItem('custosFixos', id)) {
                showNotification('Custo fixo excluído com sucesso');
                implementCustosFixosPage();
            } else {
                showNotification('Erro ao excluir custo fixo', 'error');
            }
        }
    };
}

function implementCustosVariaveisPage() {
    // Implementação básica para custos variáveis
    const custosVariaveis = VEEX.storage.load('custosVariaveis');
    const tableBody = document.querySelector('table tbody');
    
    if (tableBody) {
        // Limpar tabela
        tableBody.innerHTML = '';
        
        if (custosVariaveis.length === 0) {
            // Mostrar mensagem de nenhum custo variável
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="4" class="text-center">Nenhum custo variável cadastrado.</td>`;
            tableBody.appendChild(row);
        } else {
            // Preencher tabela com dados
            custosVariaveis.forEach(custoVariavel => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${custoVariavel.nome}</td>
                    <td>${formatCurrency(custoVariavel.valor)}</td>
                    <td>${custoVariavel.porPar ? 'Sim' : 'Não'}</td>
                    <td>
                        <button class="btn-icon btn-edit" onclick="editCustoVariavel(${custoVariavel.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-delete" onclick="deleteCustoVariavel(${custoVariavel.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        }
    }
    
    // Adicionar evento ao formulário
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const id = form.getAttribute('data-id');
            const nome = document.querySelector('input[name="nome"]').value;
            const valor = parseFloat(document.querySelector('input[name="valor"]').value);
            const porPar = document.querySelector('input[type="checkbox"]').checked;
            
            if (!nome || isNaN(valor)) {
                showNotification('Preencha todos os campos corretamente', 'error');
                return;
            }
            
            const custoVariavel = { nome, valor, porPar };
            
            if (id) {
                // Editar custo variável existente
                custoVariavel.id = parseInt(id);
                const custosVariaveis = VEEX.storage.load('custosVariaveis');
                const index = custosVariaveis.findIndex(c => c.id === custoVariavel.id);
                if (index !== -1) {
                    custosVariaveis[index] = custoVariavel;
                    VEEX.storage.save('custosVariaveis', custosVariaveis);
                    showNotification('Custo variável atualizado com sucesso');
                }
            } else {
                // Adicionar novo custo variável
                custoVariavel.id = generateId('custosVariaveis');
                const custosVariaveis = VEEX.storage.load('custosVariaveis');
                custosVariaveis.push(custoVariavel);
                VEEX.storage.save('custosVariaveis', custosVariaveis);
                showNotification('Custo variável adicionado com sucesso');
            }
            
            // Fechar modal e recarregar dados
            closeModal('custoVariavelModal');
            implementCustosVariaveisPage();
            
            // Limpar formulário
            form.removeAttribute('data-id');
            form.reset();
        });
    }
    
    // Definir funções globais para editar e excluir custos variáveis
    window.editCustoVariavel = function(id) {
        const custoVariavel = VEEX.storage.getById('custosVariaveis', id);
        if (!custoVariavel) return;
        
        const form = document.querySelector('form');
        if (!form) return;
        
        form.setAttribute('data-id', custoVariavel.id);
        
        const inputNome = document.querySelector('input[name="nome"]');
        const inputValor = document.querySelector('input[name="valor"]');
        const checkboxPorPar = document.querySelector('input[type="checkbox"]');
        
        if (inputNome) inputNome.value = custoVariavel.nome;
        if (inputValor) inputValor.value = custoVariavel.valor;
        if (checkboxPorPar) checkboxPorPar.checked = custoVariavel.porPar;
        
        openModal('custoVariavelModal');
    };
    
    window.deleteCustoVariavel = function(id) {
        if (confirm('Tem certeza que deseja excluir este custo variável?')) {
            if (deleteItem('custosVariaveis', id)) {
                showNotification('Custo variável excluído com sucesso');
                implementCustosVariaveisPage();
            } else {
                showNotification('Erro ao excluir custo variável', 'error');
            }
        }
    };
}

// Executar novamente após 1 segundo para garantir que todos os elementos estejam carregados
setTimeout(function() {
    initMobileMenu();
    initModals();
    initPageSpecificEvents();
}, 1000);
