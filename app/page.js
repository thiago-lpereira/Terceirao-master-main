// app/page.js
'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

const MONTHS_PT = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                   'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const DAYS_PT   = ['DOM','SEG','TER','QUA','QUI','SEX','SÁB'];
const EVENT_TYPES = ['Trabalho','Prova','Apresentação','Entrega'];

function toISO(d) { return d.toISOString().slice(0,10); }

function useTheme() {
  const [theme, setTheme] = useState('dark');
  useEffect(() => {
    const saved = localStorage.getItem('theme') || 'dark';
    setTheme(saved);
    document.documentElement.setAttribute('data-theme', saved);
  }, []);
  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('theme', next);
    document.documentElement.setAttribute('data-theme', next);
  };
  return [theme, toggle];
}

// ── Navbar ──
function Navbar({ theme, toggleTheme }) {
  const [open, setOpen] = useState(null);

  const menus = {
    Turma:      [{ label: 'Ver Galeria', href: '/galeria' }],
    Matérias:   [{ label: 'Ver matérias', scroll: 'grade' }],
    Calendário: [
      { label: 'Ver próximos eventos', scroll: 'eventos' },
      { label: 'Ver calendário',       scroll: 'calendario' },
    ],
    Contato:    [{ label: 'Ver contato', scroll: 'contato' }],
  };

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setOpen(null);
  };

  const s = {
    nav: {
      width: '100%',
      padding: '16px 40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      backdropFilter: 'blur(10px)',
      backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.6)',
      position: 'sticky', top: 0, zIndex: 100,
      height: '84px'
    },
    logo: { 
      fontFamily: "'Agdasima', sans-serif", 
      fontSize: '28px', 
      color: theme === 'dark' ? '#F1C971' : '#3E006B'
    },
    links: { 
      listStyle: 'none', 
      display: 'flex', 
      gap: '30px', 
      fontFamily: "'Poppins', sans-serif", 
      fontSize: '16px',
      margin: 0,
      padding: 0
    },
    btn: {
      background: 'none', border: 'none', 
      color: theme === 'dark' ? 'white' : 'black',
      fontSize: '16px', display: 'flex', alignItems: 'center', gap: 4,
      cursor: 'pointer', position: 'relative',
      fontFamily: "'Poppins', sans-serif",
      transition: '0.3s'
    },
    dropdown: {
      position: 'absolute', top: '100%', left: 0,
      background: 'var(--bg2)', border: '1px solid var(--border)',
      borderRadius: 8, minWidth: 200, padding: '6px 0', marginTop: 10,
      zIndex: 200,
    },
    dropItem: {
      display: 'block', padding: '8px 14px', color: 'var(--text)',
      fontSize: '0.82rem', background: 'none', border: 'none',
      width: '100%', textAlign: 'left', cursor: 'pointer',
      fontFamily: "system-ui, sans-serif"
    },
    toggleTheme: {
      border: 'none', padding: '10px 14px', borderRadius: '10px',
      cursor: 'pointer', fontSize: '16px', transition: '0.3s',
      backgroundColor: theme === 'dark' ? '#3E006B' : '#F1C971',
      color: theme === 'dark' ? 'white' : 'black'
    },
  };

  return (
    <nav style={s.nav}>
      <div style={s.logo}>3° DS</div>
      
      <ul style={s.links}>
        {Object.entries(menus).map(([name, items]) => (
          <li key={name} style={{ position: 'relative' }}>
            <button style={s.btn} onClick={() => setOpen(open === name ? null : name)} className="nav-btn">
              {name}
            </button>
            {open === name && (
              <div style={s.dropdown}>
                {items.map(item => (
                  item.href
                    ? <Link key={item.label} href={item.href} style={s.dropItem} onClick={() => setOpen(null)}>{item.label}</Link>
                    : <button key={item.label} style={s.dropItem} onClick={() => scrollTo(item.scroll)}>{item.label}</button>
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button style={s.toggleTheme} onClick={toggleTheme}>
          {theme === 'dark' ? '⏾' : '☀︎︎'}
        </button>
      </div>
    </nav>
  );
}

// ── Avisos Bar ──
function AvisosBar({ theme }) {
  const [addModal, setAddModal] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [newDate, setNewDate]       = useState('');
  const [addSaving, setAddSaving]   = useState(false);
  const [todayOnly, setTodayOnly] = useState(true);
  const [avisos, setAvisos] = useState([]);

  useEffect(() => {
    fetch(`/api/avisos?today=${todayOnly ? '1' : '0'}`)
      .then(r => r.json()).then(setAvisos);
  }, [todayOnly]);

  const handleAddAviso = async () => {
    if (!newContent.trim()) return;
    setAddSaving(true);
    await fetch('/api/avisos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newContent, date: newDate || undefined }),
    });
    setNewContent(''); setNewDate('');
    setAddModal(false); setAddSaving(false);
    fetch(`/api/avisos?today=${todayOnly ? '1' : '0'}`)
      .then(r => r.json()).then(setAvisos);
  };

  const s = {
    bar: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      fontFamily: "'Poppins', sans-serif",
      flexShrink: 0,
      backgroundColor: theme === 'dark' ? '#1F0035' : '#F7E3B7',
      color: theme === 'dark' ? 'white' : 'black',
      overflow: 'hidden',
      borderTop: '1px solid var(--border)', 
      borderBottom: '1px solid var(--border)',
    },
    label: {
      padding: '12px 24px',
      fontWeight: 600,
      whiteSpace: 'nowrap',
      backgroundColor: theme === 'dark' ? '#3E006B' : '#F1C971',
      color: theme === 'dark' ? 'white' : 'black',
    },
    contentArea: {
      display: 'flex', alignItems: 'center', gap: '20px', padding: '12px 24px', flex: 1, overflow: 'hidden'
    },
    toggle: { 
      display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', flexShrink: 0 
    },
    track: { 
      width: 30, height: 16, borderRadius: 8, 
      background: todayOnly ? (theme === 'dark' ? '#F1C971' : '#3E006B') : 'gray', 
      position: 'relative', cursor: 'pointer', transition: 'background .2s', flexShrink: 0 
    },
    thumb: { 
      position: 'absolute', top: 2, width: 12, height: 12, borderRadius: '50%', 
      background: '#fff', transition: 'left .2s', left: todayOnly ? 16 : 2 
    },
    ticker: { 
      flex: 1, overflow: 'hidden', display: 'flex', gap: '40px' 
    },
    item: { 
      display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500, whiteSpace: 'nowrap' 
    },
    icon: {
      color: theme === 'dark' ? '#F1C971' : '#3E006B',
      fontWeight: 'bold'
    }
  };

  return (
    <div style={s.bar}>
      <div style={s.label}>AVISOS</div>
      
      <div style={s.contentArea}>
        <div style={s.toggle}>
          <div style={s.track} onClick={() => setTodayOnly(t => !t)}>
            <div style={s.thumb} />
          </div>
          <span>{todayOnly ? 'Hoje' : 'Todos'}</span>
        </div>

        <div style={s.ticker}>
          {avisos.length === 0
            ? <span style={{...s.item, opacity: 0.7}}>Nenhum aviso.</span>
            : avisos.map(a => (
                <span key={a.id} style={s.item}>
                  <span style={s.icon}>⚠</span>
                  {a.content}
                  <span style={{ opacity: 0.7, fontSize:'0.72rem' }}>— {new Date(a.aviso_date).toLocaleDateString('pt-BR')}</span>
                </span>
              ))
          }
        </div>
        
        <button onClick={() => setAddModal(true)} title="Adicionar aviso"
          style={{ 
            flexShrink: 0, marginLeft: 'auto', border: 'none', color: theme === 'dark' ? 'white' : 'black', 
            background: theme === 'dark' ? '#3E006B' : '#F1C971', 
            width: 28, height: 28, borderRadius: '50%', fontSize: '1.2rem', lineHeight: 1, 
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' 
          }}>+</button>
      </div>

      {addModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:300 }} onClick={() => setAddModal(false)}>
          <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:12, padding:'1.5rem', width:320, color: 'var(--text)' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ color:'var(--accent)', marginBottom:'1rem', fontFamily: 'system-ui' }}>Novo aviso</h3>
            <textarea style={{ width:'100%', padding:'7px 10px', marginBottom:8, background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:6, color:'var(--text)', fontSize:'0.85rem', minHeight:80, resize:'vertical' }} placeholder="Texto do aviso *" value={newContent} onChange={e => setNewContent(e.target.value)} />
            <input type="date" style={{ width:'100%', padding:'7px 10px', marginBottom:8, background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:6, color:'var(--text)', fontSize:'0.85rem' }} value={newDate} onChange={e => setNewDate(e.target.value)} />
            <div style={{ display:'flex', gap:8, marginTop:8 }}>
              <button onClick={handleAddAviso} disabled={addSaving} style={{ flex:1, padding:'8px', background:'var(--accent2)', color:'#fff', border:'none', borderRadius:6, fontSize:'0.85rem' }}>{addSaving ? 'Salvando…' : 'Salvar'}</button>
              <button onClick={() => setAddModal(false)} style={{ flex:1, padding:'8px', background:'var(--bg3)', color:'var(--text)', border:'1px solid var(--border)', borderRadius:6, fontSize:'0.85rem' }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Galeria Section ──
function GaleriaSection() {
  const [cats, setCats] = useState([]);
  useEffect(() => {
    fetch('/api/categorias').then(r => r.json()).then(data => setCats(data.slice(0,4)));
  }, []);

  const s = {
    section: { 
      background: 'var(--bg)', 
      padding: '2rem', 
      textAlign: 'center',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Poppins', sans-serif"
    },
    title: { 
      fontFamily: "'Poppins', sans-serif", 
      fontSize: '4.5rem', 
      color: 'var(--accent)', 
      marginBottom: '1.5rem',
      flexShrink: 0
    },
    gridWrapper: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      width: '95%',
      height: '75vh',
      margin: '0 auto',
      marginBottom: '2rem'
    },
    row: {
      display: 'flex',
      gap: '1rem',
      flex: 1,
      minHeight: 0
    },
    card: (isLarge) => ({ 
      position: 'relative', 
      borderRadius: 12, 
      overflow: 'hidden', 
      cursor: 'pointer',
      flex: isLarge ? '6' : '4',
      display: 'block',
      height: '100%',
      minHeight: 0 
    }),
    img: { 
      width: '100%', 
      height: '100%', 
      objectFit: 'cover', 
      display: 'block', 
      filter: 'brightness(0.65)' 
    },
    overlay: { 
      position: 'absolute', 
      inset: 0, 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center' 
    },
    catLabel: { 
      color: '#fff', 
      fontWeight: 700, 
      fontSize: '1.5rem', 
      letterSpacing: 3, 
      textTransform: 'uppercase' 
    },
    verBtn: { 
      padding: '12px 32px', 
      background: 'transparent', 
      border: '2px solid var(--text)', 
      color: 'var(--text)', 
      borderRadius: 6, 
      fontSize: '1rem',
      cursor: 'pointer',
      flexShrink: 0,
      alignSelf: 'center'
    },
  };

  const row1 = cats.slice(0, 2);
  const row2 = cats.slice(2, 4);

  return (
    <section style={s.section}>
      <h2 style={s.title}>Galeria</h2>
      
      <div style={s.gridWrapper}>
        {row1.length > 0 && (
          <div style={s.row}>
            {row1[0] && (
              <Link href={`/galeria/${row1[0].id}`} style={s.card(true)}>
                <img src={row1[0].thumbnail_url} alt={row1[0].name} style={s.img} />
                <div style={s.overlay}><span style={s.catLabel}>{row1[0].name}</span></div>
              </Link>
            )}
            {row1[1] && (
              <Link href={`/galeria/${row1[1].id}`} style={s.card(false)}>
                <img src={row1[1].thumbnail_url} alt={row1[1].name} style={s.img} />
                <div style={s.overlay}><span style={s.catLabel}>{row1[1].name}</span></div>
              </Link>
            )}
          </div>
        )}
        
        {row2.length > 0 && (
          <div style={s.row}>
            {row2[0] && (
              <Link href={`/galeria/${row2[0].id}`} style={s.card(false)}>
                <img src={row2[0].thumbnail_url} alt={row2[0].name} style={s.img} />
                <div style={s.overlay}><span style={s.catLabel}>{row2[0].name}</span></div>
              </Link>
            )}
            {row2[1] && (
              <Link href={`/galeria/${row2[1].id}`} style={s.card(true)}>
                <img src={row2[1].thumbnail_url} alt={row2[1].name} style={s.img} />
                <div style={s.overlay}><span style={s.catLabel}>{row2[1].name}</span></div>
              </Link>
            )}
          </div>
        )}
      </div>

      <Link href="/galeria" style={{ alignSelf: 'center' }}>
        <button style={s.verBtn}>Ver Galeria</button>
      </Link>
    </section>
  );
}

// ── Próximos Eventos ──
function EventosSection({ events }) {
  const todayIso = new Date().toISOString().slice(0,10);
  const futureEvents = events.filter(e => e.event_date.slice(0, 10) >= todayIso);

  const s = {
    section: { background: 'var(--bg2)', padding: '3rem 2rem', fontFamily: "'Poppins', sans-serif" },
    title: { fontFamily: "'Poppins', sans-serif", fontSize: '2rem', color: 'var(--accent)', textAlign: 'center', marginBottom: '1.5rem' },
    gridWrapper: { maxWidth: 1200, margin: '0 auto' },
    grid: { 
      display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem', 
      scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' 
    },
    card: { 
      flex: '0 0 auto',
      width: 'calc(33.333% - 0.67rem)', 
      minWidth: 300, 
      borderRadius: 12, overflow: 'hidden', background: 'var(--card-bg)', border: '1px solid var(--border)',
      scrollSnapAlign: 'start'
    },
    cardImg: { width: '100%', height: 180, objectFit: 'cover', display: 'block' },
    cardBody: { padding: '1.2rem' },
    type: { fontSize: '0.8rem', color: 'var(--text2)', marginBottom: 6 },
    cardTitle: { fontWeight: 600, fontSize: '1.1rem', color: 'var(--text)', marginBottom: 6 },
    cardDesc: { fontSize: '0.9rem', color: 'var(--text2)', marginBottom: 12, lineHeight: 1.4 },
    timeDateRow: { display:'flex', alignItems:'center', gap: 6, fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 500 },
  };

  return (
    <section id="eventos" style={s.section}>
      <h2 style={s.title}>Próximos Eventos</h2>
      <div style={s.gridWrapper}>
        <div style={s.grid}>
          {futureEvents.length === 0 && <p style={{ color: 'var(--text2)', fontSize: '0.85rem' }}>Nenhum evento futuro.</p>}
          {futureEvents.map(e => {
            const d = new Date(e.event_date.slice(0, 10) + 'T12:00:00');
            return (
              <div key={e.id} style={s.card}>
                <img src={e.image_url || 'https://placehold.co/400x200/2a0450/fff?text=Evento'} alt={e.title} style={s.cardImg} />
                <div style={s.cardBody}>
                  <div style={s.type}>🗂 {e.type}</div>
                  <div style={s.cardTitle}>{e.title}</div>
                  {e.description && <div style={s.cardDesc}>{e.description}</div>}
                  
                  <div style={s.timeDateRow}>
                     📅 {String(d.getDate()).padStart(2,'0')}/{MONTHS_PT[d.getMonth()].slice(0,3)} 
                     {e.time_start && ` ⏰ ${e.time_start}${e.time_end ? ` – ${e.time_end}` : ''}`}
                  </div>
                  {e.responsible_names && <div style={{ fontSize:'0.8rem', color:'var(--text2)', marginTop:10 }}>👤 Resp: {e.responsible_names}</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ── Calendar Section ──
function CalendarioSection({ events, scheduleEvents, fetchEvents }) {
  const today = new Date();
  const [year]  = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  // Left Menu Form State
  const [leftOpen, setLeftOpen] = useState(false);
  const [creatorName, setCreatorName] = useState('');
  const [creatorHash, setCreatorHash] = useState('');
  const [responsibleNames, setResponsibleNames] = useState('');
  const [form, setForm] = useState({ title:'', description:'', eventDate:'', timeStart:'', timeEnd:'', type:'Trabalho' });
  const [imgFile, setImgFile] = useState(null);
  const [saving, setSaving] = useState(false);

  // Deletion State
  const [hoveredEventId, setHoveredEventId] = useState(null);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCreatorBlur = async () => {
    if(!creatorName.trim()) return;
    const res = await fetch('/api/creators', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ name: creatorName }) });
    const data = await res.json();
    setCreatorHash(data.hash_code);
  };

  const handleSubmit = async () => {
    if (!form.title || !form.eventDate || !creatorName.trim() || !imgFile) {
      alert("Preencha o título, data, o seu nome e faça o upload de uma imagem.");
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData(); 
      fd.append('file', imgFile);
      const up = await fetch('/api/upload', { method:'POST', body:fd });
      const imageUrl = (await up.json()).url;

      const cRes = await fetch('/api/creators', { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ name: creatorName }) });
      const creator = await cRes.json();

      await fetch('/api/events', {
        method: 'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ ...form, imageUrl, creatorId: creator.id, responsibleNames })
      });

      setLeftOpen(false);
      setForm({ title:'', description:'', eventDate:'', timeStart:'', timeEnd:'', type:'Trabalho' });
      setCreatorName(''); setCreatorHash(''); setResponsibleNames(''); setImgFile(null);
      fetchEvents();
    } finally { setSaving(false); }
  };

  const handleDeleteConfirm = async () => {
    if (!eventToDelete) return;
    setIsDeleting(true);
    try {
      await fetch(`/api/events?id=${eventToDelete.id}`, { method: 'DELETE' });
      setEventToDelete(null);
      fetchEvents();
    } finally {
      setIsDeleting(false);
    }
  };

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [...Array(firstDay).fill(null), ...Array.from({length: daysInMonth}, (_,i) => i+1)];
  const monthPrefix = `${year}-${String(month+1).padStart(2,'0')}`;

  const monthEvents = [
    ...scheduleEvents.map(e => ({...e, src: 'schedule'})),
    ...events.map(e => ({...e, src: 'event'}))
  ].filter(e => e.event_date.slice(0,7) === monthPrefix).sort((a,b) => a.event_date.localeCompare(b.event_date));

  const inputStyle = {
    width: '100%', padding: '7px 10px', marginBottom: 8, background: 'var(--bg3)', border: '1px solid var(--border)',
    borderRadius: 6, color: 'var(--text)', fontSize: '0.85rem', fontFamily: "'Poppins', sans-serif"
  };

  const s = {
    section: { background: 'var(--bg)', padding: '3rem 2rem', fontFamily: "'Poppins', sans-serif" },
    inner: { 
      display: 'flex', gap: '2rem', maxWidth: 1050, margin: '0 auto', alignItems: 'flex-start',
      background: 'rgba(0, 0, 0, 0.2)', padding: '2rem', borderRadius: '24px'
    },
    plusContainer: { flexShrink: 0, display: 'flex', gap: '1rem', alignItems: 'flex-start' },
    plusBtn: {
      background: 'var(--accent2)', color: '#fff', border: 'none', width: 44, height: 44, borderRadius: '50%', 
      fontSize: '1.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
    },
    leftMenu: {
      width: 260, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: '1rem', display: 'flex', flexDirection: 'column'
    },
    calBox: { flex: 1 },
    header: { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1rem' },
    monthTitle: { fontWeight: 600, color: 'var(--text)' },
    navBtn: { background:'none', border:'none', color:'var(--text2)', fontSize:'1.2rem', cursor:'pointer' },
    grid: { display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:4 },
    dayHead: { textAlign:'center', fontSize:'0.65rem', color:'var(--text2)', fontWeight:600, paddingBottom:4 },
    cell: (hasEvent, hasSchedule, isToday) => ({
      aspectRatio: '1', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:6, fontSize:'0.72rem',
      background: isToday ? 'var(--accent2)' : hasEvent ? 'var(--accent)' : hasSchedule ? 'var(--bg3)' : 'var(--bg2)',
      border: '1px solid var(--border)',
      color: isToday ? '#fff' : hasEvent ? '#000' : 'var(--text)',
      fontWeight: (hasEvent || hasSchedule) ? 'bold' : 'normal',
      cursor: (hasEvent || hasSchedule) ? 'pointer' : 'default',
    }),
    sidebar: { width: 280, display:'flex', flexDirection:'column', gap:'0.75rem', maxHeight: 500, overflowY: 'auto', paddingRight: 4 },
    eventCard: (src) => ({
      position: 'relative', background: 'var(--bg3)', border: `1px solid ${src==='event' ? 'var(--accent)' : 'var(--border)'}`, borderRadius:8, padding:'0.6rem 0.75rem',
    }),
    eLabel: { fontSize:'0.65rem', color:'var(--text2)', marginBottom:2 },
    eTitle: { fontWeight:600, fontSize:'0.85rem', color:'var(--text)' },
    eSub: { fontSize:'0.72rem', color:'var(--text2)', marginTop:2, lineHeight: 1.3 },
    deleteBtn: {
      position: 'absolute', top: 8, right: 8, width: 24, height: 24, borderRadius: '50%',
      background: '#e74c3c', color: '#fff', border: 'none', cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem',
      boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
    }
  };

  return (
    <section id="calendario" style={s.section}>
      <div style={s.inner}>
        {/* Left Side: Add Event Button + Slide-out Menu */}
        <div style={s.plusContainer}>
          <button onClick={() => setLeftOpen(!leftOpen)} style={s.plusBtn} title="Adicionar Evento">
            {leftOpen ? '✕' : '+'}
          </button>
          
          {leftOpen && (
            <div style={s.leftMenu}>
              <h4 style={{color:'var(--accent)', marginBottom:'1rem', fontSize:'1rem'}}>Novo Evento</h4>
              
              <input placeholder="Seu nome *" value={creatorName} onChange={e=>setCreatorName(e.target.value)} onBlur={handleCreatorBlur} style={inputStyle} />
              {creatorHash && <div style={{fontSize:'0.75rem', color:'var(--accent)', marginTop:-4, marginBottom:8}}>Seu Hash: #{creatorHash}</div>}
              
              <input placeholder="Responsável (opcional)" value={responsibleNames} onChange={e=>setResponsibleNames(e.target.value)} style={inputStyle} />
              <input placeholder="Título *" value={form.title} onChange={e=>setForm({...form, title:e.target.value})} style={inputStyle} />
              <textarea placeholder="Descrição" value={form.description} onChange={e=>setForm({...form, description:e.target.value})} style={{...inputStyle, minHeight:60, resize:'vertical'}} />
              <input type="date" value={form.eventDate} onChange={e=>setForm({...form, eventDate:e.target.value})} style={inputStyle} />
              <div style={{display:'flex', gap:8}}>
                <input type="time" value={form.timeStart} onChange={e=>setForm({...form, timeStart:e.target.value})} style={inputStyle} />
                <input type="time" value={form.timeEnd} onChange={e=>setForm({...form, timeEnd:e.target.value})} style={inputStyle} />
              </div>
              <select value={form.type} onChange={e=>setForm({...form, type:e.target.value})} style={inputStyle}>
                {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              
              <label style={{fontSize:'0.75rem', color:'var(--text2)', marginBottom:4, display:'block'}}>Thumbnail (Obrigatório) *</label>
              <input type="file" accept="image/*" onChange={e=>setImgFile(e.target.files[0])} style={{fontSize:'0.75rem', color:'var(--text)', marginBottom:12}} />
              
              <button onClick={handleSubmit} disabled={saving} style={{padding:'8px', background:'var(--accent2)', color:'#fff', border:'none', borderRadius:6, fontSize:'0.85rem', fontFamily: "'Poppins', sans-serif"}}>
                {saving ? 'Salvando...' : 'Adicionar Evento'}
              </button>
            </div>
          )}
        </div>

        {/* Center: The Calendar */}
        <div style={s.calBox}>
          <div style={s.header}>
            <button style={s.navBtn} onClick={() => setMonth(m => (m-1+12)%12)}>‹</button>
            <span style={s.monthTitle}>{MONTHS_PT[month]} {year}</span>
            <button style={s.navBtn} onClick={() => setMonth(m => (m+1)%12)}>›</button>
          </div>
          <div style={s.grid}>
            {DAYS_PT.map(d => <div key={d} style={s.dayHead}>{d}</div>)}
            {cells.map((day, i) => {
              if (!day) return <div key={`e${i}`}/>;
              const iso = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
              
              const hasSchedule = monthEvents.some(e => e.src === 'schedule' && e.event_date.slice(0,10) === iso);
              const hasEvent = monthEvents.some(e => e.src === 'event' && e.event_date.slice(0,10) === iso);
              const isToday = iso === toISO(today);
              
              return <div key={day} style={s.cell(hasEvent, hasSchedule, isToday)}>{day}</div>;
            })}
          </div>
        </div>

        {/* Right Side: The Event Side Bar */}
        <div style={s.sidebar}>
          {monthEvents.length === 0
            ? <p style={{ fontSize:'0.8rem', color:'var(--text2)' }}>Sem eventos neste mês.</p>
            : monthEvents.map(e => {
                const d = new Date(e.event_date.slice(0, 10) + 'T12:00:00');
                const isHovered = hoveredEventId === (e.id + e.src);

                return (
                  <div 
                    key={e.id + e.src} 
                    style={s.eventCard(e.src)}
                    onMouseEnter={() => setHoveredEventId(e.id + e.src)}
                    onMouseLeave={() => setHoveredEventId(null)}
                  >
                    {e.src === 'event' && isHovered && (
                      <button 
                        style={s.deleteBtn} 
                        onClick={() => setEventToDelete(e)} 
                        title="Deletar Evento"
                      >
                        ✕
                      </button>
                    )}

                    {e.src === 'event' && e.image_url && (
                      <img src={e.image_url} alt="Thumb" style={{width:'100%', height:90, objectFit:'cover', borderRadius:4, marginBottom:6}} />
                    )}
                    <div style={s.eLabel}>
                      {e.type} – {String(d.getDate()).padStart(2,'0')} {MONTHS_PT[d.getMonth()].slice(0,3).toUpperCase()}
                      {e.time_start && ` às ${e.time_start}`}
                    </div>
                    <div style={s.eTitle}>{e.title}</div>
                    {e.subtitle && <div style={s.eSub}>{e.subtitle}</div>}
                    {e.description && <div style={s.eSub}>{e.description}</div>}
                    
                    {e.src === 'event' && e.creator_name && (
                       <div style={{fontSize:'0.65rem', color:'var(--text2)', marginTop:6}}>
                         👤 <b>{e.creator_name}</b> <span style={{color:'var(--accent)'}}>#{e.hash_code}</span>
                         {e.responsible_names && <div style={{marginTop: 2}}>↳ Resp: {e.responsible_names}</div>}
                       </div>
                    )}
                  </div>
                );
              })
          }
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {eventToDelete && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:300 }} onClick={() => setEventToDelete(null)}>
          <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:12, padding:'2rem', width:320, textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ color:'var(--accent)', marginBottom:'1rem' }}>Deletar Evento</h3>
            <p style={{ color:'var(--text)', fontSize:'0.9rem', marginBottom:'1.5rem', lineHeight: 1.4 }}>
              Tem certeza que deseja deletar o evento <b>{eventToDelete.title}</b>? Esta ação não pode ser desfeita.
            </p>
            <div style={{ display:'flex', gap:8, justifyContent: 'center' }}>
              <button onClick={handleDeleteConfirm} disabled={isDeleting} style={{ flex:1, padding:'8px', background:'#e74c3c', color:'#fff', border:'none', borderRadius:6, fontSize:'0.85rem', cursor: 'pointer', fontFamily: "'Poppins', sans-serif" }}>
                {isDeleting ? 'Deletando...' : 'Deletar'}
              </button>
              <button onClick={() => setEventToDelete(null)} disabled={isDeleting} style={{ flex:1, padding:'8px', background:'var(--bg3)', color:'var(--text)', border:'1px solid var(--border)', borderRadius:6, fontSize:'0.85rem', cursor: 'pointer', fontFamily: "'Poppins', sans-serif" }}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

// ── Grade Curricular ──
function GradeSection() {
  const [subjects, setSubjects] = useState([]);
  const [active, setActive] = useState(null);
  const [index, setIndex] = useState(0);

  useEffect(() => { 
    fetch('/api/subjects').then(r=>r.json()).then(data => { 
      setSubjects(data); 
      if (data.length > 0) setActive(data[0].id); 
    }); 
  }, []);

  // Auto-sliding interval
  useEffect(() => {
    if (subjects.length <= 3) return;
    const timer = setInterval(() => {
      setIndex(prev => (prev + 1) % (subjects.length - 2));
    }, 3000);
    return () => clearInterval(timer);
  }, [subjects.length]);

  const s = {
    section: { background: 'var(--bg2)', padding: '3rem 2rem', textAlign:'center', overflow: 'hidden', fontFamily: "'Poppins', sans-serif" },
    title: { fontFamily: "'Poppins', sans-serif", fontSize:'2rem', color:'var(--accent)', marginBottom:'1.5rem' },
    carousel: { maxWidth: 900, margin: '0 auto', overflow: 'hidden' },
    track: { 
      display: 'flex', transition: 'transform 0.5s ease-in-out',
      transform: `translateX(-${index * 33.333}%)`
    },
    slide: {
      flex: '0 0 33.333%', padding: '0 0.5rem', boxSizing: 'border-box'
    },
    pill: (isActive) => ({
      width: '100%', padding:'1rem 0', borderRadius:10, fontWeight:600, fontSize:'1rem', cursor:'pointer', transition:'all .2s',
      background: isActive ? 'var(--accent)' : 'var(--bg3)', color: isActive ? '#1a0230' : 'var(--text)', border: isActive ? 'none' : '1px solid var(--border)',
      fontFamily: "'Poppins', sans-serif"
    }),
  };

  return (
    <section id="grade" style={s.section}>
      <h2 style={s.title}>Grade Curricular</h2>
      <div style={s.carousel}>
        <div style={s.track}>
          {subjects.map(sub => (
            <div key={sub.id} style={s.slide}>
              <button style={s.pill(active===sub.id)} onClick={() => setActive(sub.id)}>
                {sub.name}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Footer ──
function Footer({ theme }) {
  const s = {
    footer: { background: 'var(--bg)', borderTop:'1px solid var(--border)', padding:'2rem', display:'flex', gap:'3rem', alignItems:'center', fontFamily: "'Poppins', sans-serif" },
    logo: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
    links: { display:'flex', flexDirection:'column', gap:'0.5rem' },
    link: { fontSize:'0.85rem', color:'var(--text2)', display:'flex', alignItems:'center', gap:8 },
  };
  return (
    <footer id="contato" style={s.footer}>
      <div style={s.logo}>
        <img 
          src={theme === 'dark' ? '/3-dark.png' : '/3-light.png'} 
          alt="3° DS" 
          style={{ height: '240px', width: 'auto', objectFit: 'contain' }} 
        />
      </div>
      <div style={s.links}>
        <a style={s.link} href="mailto:terceiro.dev@gmail.com">✉ terceiro.dev@gmail.com</a>
        <span style={s.link}>📷 siqueira_3ds</span>
        <span style={s.link}>♪ siqueira_3ds</span>
      </div>
    </footer>
  );
}

// ── Main Page ──
export default function Home() {
  const [theme, toggleTheme] = useTheme();
  
  const [events, setEvents] = useState([]);
  const [scheduleEvents, setScheduleEvents] = useState([]);

  const fetchAll = () => {
    fetch('/api/events?all=1').then(r=>r.json()).then(setEvents);
    fetch('/api/schedule').then(r=>r.json()).then(setScheduleEvents);
  };

  useEffect(() => { fetchAll(); }, []);

  // Theme-based background container styling to match App.css logic
  const topWrapperStyle = {
    width: '100%',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundImage: theme === 'dark' ? 'url(/bg-dark.png)' : 'url(/bg-light.png)',
    backgroundColor: theme === 'dark' ? '#000000' : '#ffffff',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'top center',
    backgroundSize: '100% auto',
    transition: '0.3s'
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Agdasima:wght@400;700&family=Poppins:wght@400;500;600&display=swap');
        .nav-btn:hover { opacity: 0.7; }
      `}} />

      {/* Wrapper to handle the background images for the top section */}
      <div style={topWrapperStyle}>
        <Navbar theme={theme} toggleTheme={toggleTheme} />

        {/* Hero */}
        <section style={{ 
          flex: 1, // Fills the remaining vertical space naturally
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: '50px', 
          padding: '2rem',
          width: '100%',
          overflow: 'hidden'
        }}>
          <img 
            src={theme === 'dark' ? '/3-dark.png' : '/3-light.png'} 
            alt="3" 
            style={{ width: '100%', maxWidth: '33vw', height: 'auto', maxHeight: '75%', objectFit: 'contain' }} 
          />
          <img 
            src={theme === 'dark' ? '/panther-dark.png' : '/panther-light.png'} 
            alt="panther" 
            style={{ width: '100%', maxWidth: '33vw', height: 'auto', maxHeight: '75%', objectFit: 'contain' }} 
          />
        </section>

        <AvisosBar theme={theme} />
      </div>
      
      <GaleriaSection />
      
      <EventosSection events={events} />
      
      <CalendarioSection events={events} scheduleEvents={scheduleEvents} fetchEvents={fetchAll} />
      
      <GradeSection />
      
      <Footer theme={theme} />
    </>
  );
}