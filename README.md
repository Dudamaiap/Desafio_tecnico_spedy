#  Spedy Coworking - Sistema de Gestão de Reservas

Aplicação web completa desenvolvida para o **Desafio Técnico Spedy**, voltada ao gerenciamento corporativo de reservas de salas de reunião em espaços de coworking.

---

##  Tecnologias Utilizadas

- **Front-end**: React 19, Vite, HTML5, Vanilla CSS (Design System escuro moderno com Glassmorphism e Google Fonts `Outfit` + `Plus Jakarta Sans`).
- **Back-end**: Node.js, Express (v5), CORS.
- **Banco de Dados**: SQLite3 (gerenciado com a biblioteca de alta performance `better-sqlite3`).

---

##  Como Rodar o Projeto

### Pré-requisitos
- Node.js (versão 18 ou superior)
- Gerenciador de pacotes `npm`

---

### 1️ Executando o Back-end

1. Acesse o diretório do backend:
   ```bash
   cd backend
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o servidor Node:
   ```bash
   node index.js
   ```
   *O backend iniciará na porta `3000` (`http://localhost:3000`). O banco de dados SQLite (`reservas.db`) será criado e populado automaticamente com salas de teste no primeiro arranque.*

---

### 2️ Executando o Front-end

1. Em um novo terminal, acesse o diretório do frontend:
   ```bash
   cd frontend
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Inicie o servidor de desenvolvimento Vite:
   ```bash
   npm run dev
   ```
4. Abra o navegador e acesse a URL indicada (geralmente `http://localhost:5173`).

---

##  Justificativa da Decisão de Cancelamento: Soft Delete vs Hard Delete

### **Decisão Adotada: Soft Delete (`status = 'cancelada'`)**

Para este projeto, optou-se por **manter a reserva no banco de dados e apenas atualizar seu status para `'cancelada'`** (*Soft Delete*), em vez de remover fisicamente o registro da tabela (*Hard Delete*).

### **Por que essa foi a melhor escolha?**

1. **Auditoria e Rastreabilidade**: Em um ambiente de coworking, é fundamental manter o histórico de ações. Cancelamentos frequentes por um mesmo cliente ou sala podem indicar problemas operacionais ou necessidade de políticas de cancelamento.
2. **Métricas e Business Intelligence (BI)**: Apagar registros destrói dados históricos valiosos. Com a abordagem de *Soft Delete*, a gestão do coworking pode gerar relatórios de taxa de cancelamento, ociosidade e demanda por horário.
3. **Liberdade de Horário Garantida**: A validação de sobreposição de horários no backend filtra estritamente por reservas com `status = 'ativa'` (`WHERE status = 'ativa' AND fim > ? AND inicio < ?`). Dessa forma, ao cancelar uma reserva, o horário fica **imediatamente disponível** para novos agendamentos, sem comprometer as regras de negócio.
4. **Segurança de Dados**: Previne perdas acidentais de informações ou disputas comerciais onde o cliente afirma ter agendado e o registro foi apagado do sistema.

---

##  API REST - Endpoints

| Método | Endpoint | Descrição |
| :--- | :--- | :--- |
| `GET` | `/salas` | Retorna a lista de salas disponíveis para agendamento. |
| `GET` | `/reservas` | Retorna todas as reservas ativas ordenadas por horário de início. |
| `POST` | `/reservas` | Cria uma nova reserva com validação de sobreposição no backend. |
| `PATCH` | `/reservas/:id/cancelar` | Cancela uma reserva existente (marca `status = 'cancelada'`). |

