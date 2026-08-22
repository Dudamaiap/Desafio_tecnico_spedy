import { useState, useEffect, useRef } from 'react';
import './App.css';

// Logo oficial com o laço gradiente "S" da Spedy (idêntico ao spedy.com.br)
const SpedyLogo = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
    <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
      <defs>
        <linearGradient id="spedyLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="40%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
      </defs>
      <path
        d="M10 12C10 9.79086 11.7909 8 14 8H28C30.2091 8 32 9.79086 32 12V14C32 16.2091 30.2091 18 28 18H18C15.7909 18 14 19.7909 14 22V24C14 26.2091 15.7909 28 18 28H30"
        stroke="url(#spedyLogoGrad)"
        strokeWidth="6"
        strokeLinecap="round"
      />
    </svg>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
      <span style={{ fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.04em', color: '#ffffff' }}>
        spedy
      </span>
      <span style={{
        fontSize: '0.72rem',
        fontWeight: '800',
        textTransform: 'uppercase',
        background: 'rgba(236, 72, 153, 0.25)',
        color: '#f472b6',
        padding: '2px 8px',
        borderRadius: '12px',
        letterSpacing: '0.05em'
      }}>
        Coworking
      </span>
    </div>
  </div>
);

// SVG Icons minimalistas
const IconCalendar = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

const IconClock = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

const IconBuilding = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
    <line x1="9" y1="6" x2="9.01" y2="6"></line>
    <line x1="15" y1="6" x2="15.01" y2="6"></line>
    <line x1="9" y1="10" x2="9.01" y2="10"></line>
    <line x1="15" y1="10" x2="15.01" y2="10"></line>
    <line x1="9" y1="14" x2="9.01" y2="14"></line>
    <line x1="15" y1="14" x2="15.01" y2="14"></line>
  </svg>
);

const IconCheckCircle = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

const IconUsers = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

const IconTrash = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);

const IconBell = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 17h5l-1.4-1.4a2 2 0 0 1-.6-1.42V11a6 6 0 1 0-12 0v3.18a2 2 0 0 1-.6 1.42L4 17h5"></path>
    <path d="M10 17a2 2 0 0 0 4 0"></path>
  </svg>
);

// Imagens reais de salas corporativas
const FOTOS_SALAS = {
  1: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=600&q=80',
  2: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=600&q=80',
  3: 'https://images.unsplash.com/photo-1577412647305-991150c7d163?auto=format&fit=crop&w=600&q=80',
};
const API_BASE_URL = 'http://localhost:3000';
const NOTIFICATION_REFRESH_MS = 60000;

function App() {
  const [salas, setSalas] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [notificacoes, setNotificacoes] = useState([]);
  
  // Formulário
  const [salaId, setSalaId] = useState('');
  const [titulo, setTitulo] = useState('');
  const [inicio, setInicio] = useState('');
  const [fim, setFim] = useState('');
  
  // Feedback e Modais
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [modalCriarAberto, setModalCriarAberto] = useState(false);
  const [modalCancelamento, setModalCancelamento] = useState({ aberto: false, id: null, titulo: '' });
  const [painelNotificacoesAberto, setPainelNotificacoesAberto] = useState(false);
  const [carregandoNotificacoes, setCarregandoNotificacoes] = useState(false);
  const [erroNotificacoes, setErroNotificacoes] = useState('');
  const [marcandoNotificacoes, setMarcandoNotificacoes] = useState(false);
  const painelNotificacoesRef = useRef(null);

  // Calendário Interativo
  const [dataCalendario, setDataCalendario] = useState(new Date(2026, 7, 1)); // Mês base: Agosto 2026
  const [filtroData, setFiltroData] = useState('2026-08-15'); // Data selecionada YYYY-MM-DD
  const [filtroAtivo, setFiltroAtivo] = useState(false); // Flag de filtro ativado

  function buscarSalas() {
    fetch(`${API_BASE_URL}/salas`)
      .then((res) => res.json())
      .then((dados) => {
        if (Array.isArray(dados)) {
          setSalas(dados);
          if (dados.length > 0 && !salaId) {
            setSalaId(dados[0].id);
          }
        }
      })
      .catch((err) => console.error('Erro ao buscar salas:', err));
  }

  function buscarReservas() {
    fetch(`${API_BASE_URL}/reservas`)
      .then((res) => res.json())
      .then((dados) => {
        if (Array.isArray(dados)) {
          setReservas(dados);
          setErro('');
        }
      })
      .catch((err) => {
        console.error('Erro ao buscar reservas:', err);
        setErro('Não foi possível conectar ao servidor backend (http://localhost:3000).');
      });
  }

  function buscarNotificacoes(opcoes = {}) {
    const { silencioso = false } = opcoes;

    if (!silencioso) {
      setCarregandoNotificacoes(true);
    }

    fetch(`${API_BASE_URL}/notificacoes?limite=12`)
      .then((res) => res.json().then((dados) => ({ status: res.status, dados })))
      .then(({ status, dados }) => {
        if (status !== 200 || !Array.isArray(dados)) {
          setErroNotificacoes('Não foi possível carregar as notificações.');
          return;
        }

        setNotificacoes(dados);
        setErroNotificacoes('');
      })
      .catch((err) => {
        console.error('Erro ao buscar notificações:', err);
        setErroNotificacoes('Não foi possível carregar as notificações.');
      })
      .finally(() => {
        if (!silencioso) {
          setCarregandoNotificacoes(false);
        }
      });
  }

  function marcarNotificacoesComoLidas(ids = []) {
    const possuiIds = Array.isArray(ids) && ids.length > 0;
    setMarcandoNotificacoes(true);

    fetch(`${API_BASE_URL}/notificacoes/marcar-lidas`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(possuiIds ? { ids } : {}),
    })
      .then((res) => res.json().then((dados) => ({ status: res.status, dados })))
      .then(({ status, dados }) => {
        setMarcandoNotificacoes(false);

        if (status !== 200) {
          setErroNotificacoes(dados.erro || 'Não foi possível atualizar as notificações.');
          return;
        }

        setErroNotificacoes('');
        buscarNotificacoes({ silencioso: true });
      })
      .catch((err) => {
        console.error('Erro ao marcar notificações como lidas:', err);
        setMarcandoNotificacoes(false);
        setErroNotificacoes('Não foi possível atualizar as notificações.');
      });
  }

  useEffect(() => {
    buscarSalas();
    buscarReservas();
    buscarNotificacoes({ silencioso: true });

    const intervalId = window.setInterval(() => {
      buscarReservas();
      buscarNotificacoes({ silencioso: true });
    }, NOTIFICATION_REFRESH_MS);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (painelNotificacoesAberto) {
      buscarNotificacoes();
    }
  }, [painelNotificacoesAberto]);

  useEffect(() => {
    function fecharPainelAoClicarFora(event) {
      if (painelNotificacoesRef.current && !painelNotificacoesRef.current.contains(event.target)) {
        setPainelNotificacoesAberto(false);
      }
    }

    function fecharPainelComEscape(event) {
      if (event.key === 'Escape') {
        setPainelNotificacoesAberto(false);
      }
    }

    document.addEventListener('mousedown', fecharPainelAoClicarFora);
    document.addEventListener('keydown', fecharPainelComEscape);

    return () => {
      document.removeEventListener('mousedown', fecharPainelAoClicarFora);
      document.removeEventListener('keydown', fecharPainelComEscape);
    };
  }, []);

  function handleCriarReserva(e) {
    if (e) e.preventDefault();
    setErro('');
    setSucesso('');

    if (!salaId) {
      setErro('Selecione uma sala de reunião.');
      return;
    }
    if (!titulo.trim()) {
      setErro('Informe o título da reunião.');
      return;
    }
    if (!inicio || !fim) {
      setErro('Os horários de início e término são obrigatórios.');
      return;
    }

    if (new Date(fim) <= new Date(inicio)) {
      setErro('O horário de término precisa ser posterior ao horário de início.');
      return;
    }

    setCarregando(true);

    fetch(`${API_BASE_URL}/reservas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sala_id: Number(salaId),
        titulo: titulo.trim(),
        inicio,
        fim,
      }),
    })
      .then((res) => res.json().then((dados) => ({ status: res.status, dados })))
      .then(({ status, dados }) => {
        setCarregando(false);
        if (status !== 201) {
          setErro(dados.erro || 'Erro ao realizar a reserva.');
        } else {
          setSucesso(`Reserva "${dados.titulo}" agendada com sucesso!`);
          setTitulo('');
          setInicio('');
          setFim('');
          setModalCriarAberto(false);
          buscarReservas();
          buscarNotificacoes({ silencioso: true });
        }
      })
      .catch(() => {
        setCarregando(false);
        setErro('Erro de conexão com o servidor.');
      });
  }

  function confirmarCancelamento() {
    const { id } = modalCancelamento;
    if (!id) return;

    fetch(`${API_BASE_URL}/reservas/${id}/cancelar`, {
      method: 'PATCH',
    })
      .then((res) => res.json())
      .then((dados) => {
        setModalCancelamento({ aberto: false, id: null, titulo: '' });
        if (dados.erro) {
          setErro(dados.erro);
        } else {
          setSucesso('Reserva cancelada com sucesso.');
          buscarReservas();
          buscarNotificacoes({ silencioso: true });
        }
      })
      .catch(() => {
        setModalCancelamento({ aberto: false, id: null, titulo: '' });
        setErro('Erro ao cancelar a reserva.');
      });
  }

  // Lógica do Calendário Interativo
  const anoCalendario = dataCalendario.getFullYear();
  const mesCalendario = dataCalendario.getMonth();

  const nomeMesFormatado = dataCalendario.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const nomeMesCapitalizado = nomeMesFormatado.charAt(0).toUpperCase() + nomeMesFormatado.slice(1);

  const primeiroDiaSemana = new Date(anoCalendario, mesCalendario, 1).getDay();
  const diasNoMes = new Date(anoCalendario, mesCalendario + 1, 0).getDate();
  const diasMesAnterior = new Date(anoCalendario, mesCalendario, 0).getDate();

  function mudarMes(delta) {
    setDataCalendario(new Date(anoCalendario, mesCalendario + delta, 1));
  }

  function formatarDataIso(ano, mes, dia) {
    const mm = String(mes + 1).padStart(2, '0');
    const dd = String(dia).padStart(2, '0');
    return `${ano}-${mm}-${dd}`;
  }

  function temReservaNoDia(ano, mes, dia) {
    const dataChave = formatarDataIso(ano, mes, dia);
    return reservas.some((r) => r.inicio.startsWith(dataChave));
  }

  function selecionarDiaCalendario(ano, mes, dia) {
    const dataChave = formatarDataIso(ano, mes, dia);
    setFiltroData(dataChave);
    setFiltroAtivo(true);

    // Pré-preenche a data de início e término no formulário para conveniência
    setInicio(`${dataChave}T09:00`);
    setFim(`${dataChave}T10:00`);
  }

  function limparFiltroCalendario() {
    setFiltroAtivo(false);
  }

  // Filtrar reservas se o filtro de calendário estiver ativado
  const reservasExibidas = filtroAtivo
    ? reservas.filter((r) => r.inicio.startsWith(filtroData))
    : reservas;

  function formatarReservaParaDisplay(reserva) {
    const dataIso = reserva.inicio.includes('T') ? reserva.inicio.split('T')[0] : reserva.inicio.split(' ')[0];
    const partes = dataIso.split('-');
    const dia = partes[2];
    const meses = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
    const mesAbr = meses[Number(partes[1]) - 1] || 'AGO';

    const horaInicio = reserva.inicio.includes('T') ? reserva.inicio.split('T')[1].substring(0, 5) : reserva.inicio.split(' ')[1].substring(0, 5);
    const horaFim = reserva.fim.includes('T') ? reserva.fim.split('T')[1].substring(0, 5) : reserva.fim.split(' ')[1].substring(0, 5);

    return {
      dia,
      mesAbr,
      horarioFormatado: `${horaInicio} às ${horaFim}`,
    };
  }

  function converterDataReserva(dataHora) {
    return new Date(dataHora.includes('T') ? dataHora : dataHora.replace(' ', 'T'));
  }

  function converterDataNotificacao(dataHora) {
    return new Date(dataHora.includes('T') ? dataHora : dataHora.replace(' ', 'T'));
  }

  function formatarMomentoNotificacao(dataHora) {
    const data = converterDataNotificacao(dataHora);
    const agoraLocal = new Date();
    const hora = data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    if (data.toDateString() === agoraLocal.toDateString()) {
      return `Hoje às ${hora}`;
    }

    return `${data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} às ${hora}`;
  }

  function obterEstiloNotificacao(tipo) {
    if (tipo === 'cancelamento') {
      return 'alert';
    }

    if (tipo === 'lembrete_1h') {
      return 'upcoming';
    }

    if (tipo === 'lembrete_24h') {
      return 'info';
    }

    if (tipo === 'reserva_criada') {
      return 'live';
    }

    return 'history';
  }

  const agora = new Date();
  const reservasOrdenadas = [...reservas].sort((a, b) => converterDataReserva(a.inicio) - converterDataReserva(b.inicio));
  const reservasFuturas = reservasOrdenadas.filter((reserva) => converterDataReserva(reserva.fim) >= agora);
  const reservasHoje = reservas.filter((reserva) => converterDataReserva(reserva.inicio).toDateString() === agora.toDateString()).length;
  const reservasConcluidasMes = reservas.filter((reserva) => {
    const fimReserva = converterDataReserva(reserva.fim);
    return fimReserva < agora && fimReserva.getMonth() === agora.getMonth() && fimReserva.getFullYear() === agora.getFullYear();
  }).length;
  const notificacoesNaoLidas = notificacoes.filter((notificacao) => !notificacao.lida);
  const totalNotificacoes = notificacoes.length;
  const totalNotificacoesNaoLidas = notificacoesNaoLidas.length;
  const badgeNotificacoes = totalNotificacoesNaoLidas > 9 ? '9+' : String(totalNotificacoesNaoLidas);

  // Renderizar a grade de dias do calendário
  function renderizarDiasCalendario() {
    const celulas = [];

    // Dias do mês anterior
    for (let i = primeiroDiaSemana - 1; i >= 0; i--) {
      const diaNum = diasMesAnterior - i;
      celulas.push(
        <div key={`prev-${diaNum}`} className="cal-number-item" style={{ opacity: 0.3, cursor: 'default' }}>
          {diaNum}
        </div>
      );
    }

    // Dias do mês atual
    for (let dia = 1; dia <= diasNoMes; dia++) {
      const dataIso = formatarDataIso(anoCalendario, mesCalendario, dia);
      const isSelecionado = filtroAtivo && filtroData === dataIso;
      const possuiReserva = temReservaNoDia(anoCalendario, mesCalendario, dia);

      celulas.push(
        <div
          key={`curr-${dia}`}
          className={`cal-number-item ${isSelecionado ? 'selected' : ''} ${possuiReserva ? 'has-event' : ''}`}
          onClick={() => selecionarDiaCalendario(anoCalendario, mesCalendario, dia)}
          title={possuiReserva ? `Ver reservas de ${dia}/${mesCalendario + 1}/${anoCalendario}` : `Agendar para ${dia}/${mesCalendario + 1}/${anoCalendario}`}
        >
          {dia}
        </div>
      );
    }

    return celulas;
  }

  return (
    <div>
      {/* Hero Section com o Roxo Oficial da Spedy */}
      <section className="spedy-hero-section">
        <header className="spedy-header-nav">
          <SpedyLogo />

          <div className="spedy-header-actions">
            <div
              className={`spedy-notification-wrap ${painelNotificacoesAberto ? 'open' : ''}`}
              ref={painelNotificacoesRef}
            >
              <button
                type="button"
                className="spedy-notification-button"
                aria-label="Abrir notificações"
                aria-expanded={painelNotificacoesAberto}
                onClick={() => setPainelNotificacoesAberto((aberto) => !aberto)}
              >
                <IconBell />
                {totalNotificacoesNaoLidas > 0 && (
                  <span className="spedy-notification-badge">{badgeNotificacoes}</span>
                )}
              </button>

              {painelNotificacoesAberto && (
                <div className="spedy-notification-panel">
                  <div className="spedy-notification-panel-header">
                    <div>
                      <div className="spedy-notification-panel-title">Notificações</div>
                      <div className="spedy-notification-panel-subtitle">
                        {totalNotificacoesNaoLidas > 0
                          ? `${totalNotificacoesNaoLidas} não lida${totalNotificacoesNaoLidas === 1 ? '' : 's'}`
                          : totalNotificacoes > 0
                            ? 'Todas as notificações foram lidas'
                            : 'Sem novidades no momento'}
                      </div>
                    </div>

                    {totalNotificacoesNaoLidas > 0 && (
                      <button
                        type="button"
                        className="spedy-notification-mark-read"
                        onClick={() => marcarNotificacoesComoLidas()}
                        disabled={marcandoNotificacoes}
                      >
                        {marcandoNotificacoes ? 'Salvando...' : 'Marcar todas'}
                      </button>
                    )}
                  </div>

                  {carregandoNotificacoes && notificacoes.length === 0 ? (
                    <div className="spedy-notification-empty">
                      Carregando notificações...
                    </div>
                  ) : erroNotificacoes ? (
                    <div className="spedy-notification-empty">
                      {erroNotificacoes}
                    </div>
                  ) : notificacoes.length === 0 ? (
                    <div className="spedy-notification-empty">
                      Suas próximas atualizações de reserva vão aparecer aqui.
                    </div>
                  ) : (
                    <div className="spedy-notification-list">
                      {notificacoes.map((notificacao) => (
                        <button
                          type="button"
                          key={notificacao.id}
                          className={`spedy-notification-item ${obterEstiloNotificacao(notificacao.tipo)} ${notificacao.lida ? 'read' : 'unread'}`}
                          onClick={() => {
                            if (!notificacao.lida && !marcandoNotificacoes) {
                              marcarNotificacoesComoLidas([notificacao.id]);
                            }
                          }}
                        >
                          <span className="spedy-notification-dot" />
                          <div className="spedy-notification-item-content">
                            <div className="spedy-notification-item-top">
                              <div className="spedy-notification-item-title">{notificacao.titulo}</div>
                              <div className="spedy-notification-item-time">{formatarMomentoNotificacao(notificacao.criado_em)}</div>
                            </div>
                            {!notificacao.lida && (
                              <div className="spedy-notification-item-tag">Nova</div>
                            )}
                            <div className="spedy-notification-item-copy">{notificacao.descricao}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              className="btn-spedy-magenta"
              onClick={() => setModalCriarAberto(true)}
            >
              Nova Reserva
            </button>
          </div>
        </header>

        {/* Headline Oficial no Estilo do spedy.com.br */}
        <div className="spedy-hero-body">
          <h1 className="spedy-hero-title">
            Foque <span className="highlight-magenta">no seu trabalho</span> e deixe as reservas com <span className="highlight-magenta">a Spedy.</span>
          </h1>

          <div className="spedy-hero-subtitle">
            <span>Escolha a sala</span>
            <span className="spedy-arrow-sep">➔</span>
            <span>Agende o horário</span>
            <span className="spedy-arrow-sep">➔</span>
            <span>O resto é com a Spedy</span>
          </div>

          {/* Barra Flutuante de Agendamento */}
          <div className="spedy-booking-bar">
            <div className="booking-field">
              <span className="field-icon"><IconBuilding /></span>
              <select
                className="field-select-input"
                value={salaId}
                onChange={(e) => setSalaId(e.target.value)}
              >
                {salas.map((sala) => (
                  <option key={sala.id} value={sala.id}>
                    {sala.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="booking-field">
              <span className="field-icon"><IconCalendar /></span>
              <input
                type="datetime-local"
                className="field-select-input"
                value={inicio}
                onChange={(e) => setInicio(e.target.value)}
              />
            </div>

            <div className="booking-field">
              <span className="field-icon"><IconClock /></span>
              <input
                type="datetime-local"
                className="field-select-input"
                value={fim}
                onChange={(e) => setFim(e.target.value)}
              />
            </div>

            <button
              type="button"
              className="btn-spedy-magenta"
              onClick={() => setModalCriarAberto(true)}
            >
              Buscar salas
            </button>
          </div>
        </div>
      </section>

      {/* Conteúdo do Dashboard em Fundo Claro */}
      <main className="spedy-dashboard-section">
        {/* Alertas */}
        {erro && (
          <div className="alert-message error">
            ⚠️ {erro}
          </div>
        )}
        {sucesso && (
          <div className="alert-message success">
            ✅ {sucesso}
          </div>
        )}

        <div className="spedy-tag-badge">DISPONÍVEIS & RECENTES</div>
        <h2 className="spedy-section-title">
          Gerencie <span className="highlight-magenta">suas reuniões</span> com agilidade.
        </h2>

        {/* 4 Cards de Métricas Rápidas */}
        <div className="spedy-stats-grid">
          <div className="spedy-stat-card">
            <div className="stat-icon-pill"><IconBuilding /></div>
            <div className="stat-number-bold">{salas.length}</div>
            <div className="stat-title-label">Salas disponíveis</div>
          </div>

          <div className="spedy-stat-card">
            <div className="stat-icon-pill magenta"><IconCalendar /></div>
            <div className="stat-number-bold">{reservasHoje}</div>
            <div className="stat-title-label">Reservas hoje</div>
          </div>

          <div className="spedy-stat-card">
            <div className="stat-icon-pill"><IconClock /></div>
            <div className="stat-number-bold">{reservasFuturas.length}</div>
            <div className="stat-title-label">Próximas reservas</div>
          </div>

          <div className="spedy-stat-card">
            <div className="stat-icon-pill magenta"><IconCheckCircle /></div>
            <div className="stat-number-bold">{reservasConcluidasMes}</div>
            <div className="stat-title-label">Concluídas este mês</div>
          </div>
        </div>

        {/* 2 Colunas: Esquerda (Próximas Reservas) | Direita (Salas + Calendário) */}
        <div className="spedy-columns-grid">
          {/* Coluna Esquerda: Timeline de Reservas Agrupadas */}
          <div>
            <div className="spedy-box-card">
              <div className="spedy-box-header">
                <div>
                  <h3 className="spedy-box-h3">Próximas reservas</h3>
                  {filtroAtivo && (
                    <div style={{ fontSize: '0.82rem', color: 'var(--spedy-magenta)', marginTop: '4px', fontWeight: 600 }}>
                      📅 Filtrando por: {filtroData.split('-').reverse().join('/')}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  {filtroAtivo && (
                    <button
                      className="btn-spedy-outline"
                      style={{ padding: '6px 14px', fontSize: '0.8rem', color: 'var(--text-dark)', borderColor: 'var(--border-light)' }}
                      onClick={limparFiltroCalendario}
                    >
                      Ver Todas
                    </button>
                  )}
                  <button
                    className="btn-spedy-magenta"
                    style={{ padding: '6px 16px', fontSize: '0.82rem' }}
                    onClick={() => setModalCriarAberto(true)}
                  >
                    + Nova reserva
                  </button>
                </div>
              </div>

              {reservasExibidas.length === 0 ? (
                <div style={{ textTransform: 'none', textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)' }}>
                  <p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-dark)', marginBottom: '4px' }}>
                    {filtroAtivo ? `Nenhuma reserva agendada para ${filtroData.split('-').reverse().join('/')}` : 'Nenhuma reserva ativa cadastrada no momento.'}
                  </p>
                  <p style={{ fontSize: '0.85rem' }}>
                    {filtroAtivo ? 'Clique em "Nova reserva" para agendar esta data.' : 'Preencha os horários acima para agendar uma reunião.'}
                  </p>
                </div>
              ) : (
                reservasExibidas.map((reserva, idx) => {
                  const display = formatarReservaParaDisplay(reserva);
                  const isConfirmada = idx % 2 === 0;

                  return (
                    <div key={reserva.id} className="spedy-timeline-card">
                      <div className="date-pill-left">
                        <div className="date-pill-day">{display.dia}</div>
                        <div className="date-pill-month">{display.mesAbr}</div>
                      </div>

                      <div className="res-content-mid">
                        <div className="res-title-text">{reserva.titulo}</div>
                        <div className="res-meta-text">
                          <span>{reserva.sala_nome}</span> • <span>{display.horarioFormatado}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span className={`badge-status-pill ${isConfirmada ? 'confirmed' : 'pending'}`}>
                          {isConfirmada ? 'Confirmada' : 'Agendada'}
                        </span>
                        <button
                          className="btn-trash-action"
                          onClick={() => setModalCancelamento({ aberto: true, id: reserva.id, titulo: reserva.titulo })}
                          title="Cancelar reserva"
                        >
                          <IconTrash />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Coluna Direita: Cards de Salas + Calendário Interativo */}
          <div>
            {/* Box: Salas Disponíveis */}
            <div className="spedy-box-card">
              <div className="spedy-box-header">
                <h3 className="spedy-box-h3" style={{ fontSize: '1.1rem' }}>Salas disponíveis</h3>
                <span className="spedy-tag-badge" style={{ marginBottom: 0 }}>SPEY SP</span>
              </div>

              <div className="spedy-rooms-grid">
                {salas.slice(0, 3).map((sala, index) => {
                  const numSala = (index % 3) + 1;
                  return (
                    <div
                      key={sala.id}
                      className="room-single-card"
                      onClick={() => {
                        setSalaId(sala.id);
                        setModalCriarAberto(true);
                      }}
                    >
                      <img
                        src={FOTOS_SALAS[numSala] || FOTOS_SALAS[1]}
                        alt={sala.nome}
                        className="room-img-top"
                      />
                      <div className="room-details-padding">
                        <div className="room-name-bold">{sala.nome}</div>
                        <div className="room-cap-text">
                          <IconUsers /> {numSala === 1 ? '6 lugares' : numSala === 2 ? '8 lugares' : '4 lugares'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Box: Calendário Mensal Interativo */}
            <div className="spedy-box-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 800 }}>
                <button
                  className="btn-trash-action"
                  style={{ fontSize: '1rem', color: 'var(--text-dark)' }}
                  onClick={() => mudarMes(-1)}
                  title="Mês anterior"
                >
                  &lt;
                </button>
                <span style={{ fontSize: '0.98rem' }}>{nomeMesCapitalizado}</span>
                <button
                  className="btn-trash-action"
                  style={{ fontSize: '1rem', color: 'var(--text-dark)' }}
                  onClick={() => mudarMes(1)}
                  title="Próximo mês"
                >
                  &gt;
                </button>
              </div>

              <div className="cal-grid-month">
                <div className="cal-head-day">D</div>
                <div className="cal-head-day">S</div>
                <div className="cal-head-day">T</div>
                <div className="cal-head-day">Q</div>
                <div className="cal-head-day">Q</div>
                <div className="cal-head-day">S</div>
                <div className="cal-head-day">S</div>

                {renderizarDiasCalendario()}
              </div>

              {filtroAtivo && (
                <div style={{ marginTop: '14px', textTransform: 'none', textAlign: 'center' }}>
                  <button
                    className="btn-spedy-outline"
                    style={{ fontSize: '0.78rem', color: 'var(--spedy-magenta)', borderColor: 'var(--spedy-magenta)', padding: '4px 12px' }}
                    onClick={limparFiltroCalendario}
                  >
                    Limpar Filtro ({filtroData.split('-').reverse().join('/')})
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Modal para Criar Reserva */}
      {modalCriarAberto && (
        <div className="spedy-modal-backdrop" onClick={() => setModalCriarAberto(false)}>
          <div className="spedy-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="spedy-tag-badge">NOVO AGENDAMENTO</div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '16px', color: 'var(--text-dark)' }}>
              Reservar Sala com a Spedy
            </h3>

            {erro && (
              <div className="alert-message error" style={{ marginBottom: '16px' }}>
                ⚠️ {erro}
              </div>
            )}

            <form onSubmit={handleCriarReserva}>
              <div style={{ marginBottom: '14px' }}>
                <label className="field-label" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>
                  Sala de Reunião
                </label>
                <select
                  className="input-spedy-form"
                  value={salaId}
                  onChange={(e) => setSalaId(e.target.value)}
                  required
                >
                  {salas.map((sala) => (
                    <option key={sala.id} value={sala.id}>
                      {sala.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label className="field-label" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>
                  Título da Reunião
                </label>
                <input
                  type="text"
                  className="input-spedy-form"
                  placeholder="Ex: Alinhamento Estratégico"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '24px' }}>
                <div>
                  <label className="field-label" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>
                    Início
                  </label>
                  <input
                    type="datetime-local"
                    className="input-spedy-form"
                    value={inicio}
                    onChange={(e) => setInicio(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="field-label" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>
                    Término
                  </label>
                  <input
                    type="datetime-local"
                    className="input-spedy-form"
                    value={fim}
                    onChange={(e) => setFim(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  className="btn-spedy-outline"
                  style={{ color: 'var(--text-dark)', borderColor: 'var(--border-light)' }}
                  onClick={() => setModalCriarAberto(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-spedy-magenta"
                  disabled={carregando}
                >
                  {carregando ? 'Agendando...' : 'Confirmar Reserva'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para Confirmar Cancelamento */}
      {modalCancelamento.aberto && (
        <div className="spedy-modal-backdrop" onClick={() => setModalCancelamento({ aberto: false, id: null, titulo: '' })}>
          <div className="spedy-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="spedy-tag-badge" style={{ background: 'rgba(230,0,126,0.1)', color: 'var(--spedy-magenta)' }}>CANCELAR RESERVA</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '12px', color: 'var(--text-dark)' }}>
              Desocupar Sala
            </h3>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
              Deseja realmente cancelar a reserva <strong>"{modalCancelamento.titulo}"</strong>? A reserva será marcada como cancelada no histórico e o horário ficará livre.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                className="btn-spedy-outline"
                style={{ color: 'var(--text-dark)', borderColor: 'var(--border-light)' }}
                onClick={() => setModalCancelamento({ aberto: false, id: null, titulo: '' })}
              >
                Voltar
              </button>
              <button
                className="btn-spedy-magenta"
                onClick={confirmarCancelamento}
              >
                Confirmar Cancelamento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
