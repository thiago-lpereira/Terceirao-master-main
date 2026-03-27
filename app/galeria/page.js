'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function GaleriaPage() {
  const [cats, setCats] = useState([]);
  const [modal, setModal] = useState(false);
  const [editModal, setEditModal] = useState(null);
  const [name, setName] = useState('');
  const [imgFile, setImgFile] = useState(null);
  const [saving, setSaving] = useState(false);
// ADD these state variables
const [eventModal, setEventModal] = useState(false);
const [evForm, setEvForm] = useState({ title:'', subtitle:'', eventDate:'', type:'Prova' });
const [evCreator, setEvCreator] = useState('');
const [evResponsible, setEvResponsible] = useState('');
const [evSaving, setEvSaving] = useState(false);

const handleAddEvent = async () => {
  if (!evForm.title || !evForm.eventDate) return;
  setEvSaving(true);
  await fetch('/api/schedule', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: evForm.title,
      subtitle: evForm.subtitle || null,
      eventDate: evForm.eventDate,
      type: evForm.type,
      responsible: evResponsible || null,
      creatorName: evCreator || null,
    }),
  });
  setEvForm({ title:'', subtitle:'', eventDate:'', type:'Prova' });
  setEvCreator(''); setEvResponsible('');
  setEventModal(false); setEvSaving(false);
};

  const fetchCats = () => fetch('/api/categorias').then(r=>r.json()).then(setCats);
  useEffect(() => { fetchCats(); }, []);

  const upload = async (file) => {
    const fd = new FormData(); fd.append('file', file);
    const res = await fetch('/api/upload', { method:'POST', body:fd });
    return (await res.json()).url;
  };

  const handleAdd = async () => {
    if (!name.trim() || !imgFile) return;
    setSaving(true);
    const url = await upload(imgFile);
    await fetch('/api/categorias', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ name, thumbnailUrl: url }),
    });
    setName(''); setImgFile(null); setModal(false);
    setSaving(false); fetchCats();
  };

  const handleEdit = async () => {
    if (!editModal) return;
    setSaving(true);
    let url = null;
    if (imgFile) url = await upload(imgFile);
    await fetch('/api/categorias', {
      method:'PUT', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ id: editModal.id, name: name||undefined, thumbnailUrl: url||undefined }),
    });
    setEditModal(null); setName(''); setImgFile(null);
    setSaving(false); fetchCats();
  };

  const moveUp = async (cat, i) => {
    if (i === 0) return;
    const prev = cats[i-1];
    await fetch('/api/categorias', { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ id: cat.id, displayOrder: prev.display_order }) });
    await fetch('/api/categorias', { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ id: prev.id, displayOrder: cat.display_order }) });
    fetchCats();
  };

  const moveDown = async (cat, i) => {
    if (i === cats.length-1) return;
    const next = cats[i+1];
    await fetch('/api/categorias', { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ id: cat.id, displayOrder: next.display_order }) });
    await fetch('/api/categorias', { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ id: next.id, displayOrder: cat.display_order }) });
    fetchCats();
  };

  const s = {
    page: { background:'var(--bg)', minHeight:'100vh', padding:'2rem', color:'var(--text)', fontFamily:'system-ui,sans-serif' },
    header: { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'2rem' },
    title: { fontSize:'1.5rem', fontWeight:700, color:'var(--accent)' },
    grid: { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:'1rem' },
    card: { background:'var(--card-bg)', border:'1px solid var(--border)', borderRadius:10, overflow:'hidden', position:'relative' },
    img: { width:'100%', height:150, objectFit:'cover', display:'block' },
    cardBody: { padding:'0.75rem', display:'flex', alignItems:'center', justifyContent:'space-between' },
    catName: { fontWeight:600, fontSize:'0.9rem' },
    actions: { display:'flex', gap:6 },
    iconBtn: { background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:5, color:'var(--text)', padding:'3px 7px', fontSize:'0.75rem', cursor:'pointer' },
    badge: { position:'absolute', top:8, left:8, background:'var(--accent2)', color:'#fff', borderRadius:4, padding:'1px 6px', fontSize:'0.65rem', fontWeight:700 },
    addBtn: { padding:'8px 18px', background:'var(--accent2)', color:'#fff', border:'none', borderRadius:7, fontSize:'0.85rem', cursor:'pointer' },
    inputStyle: { width:'100%', padding:'7px 10px', marginBottom:8, background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:6, color:'var(--text)', fontSize:'0.85rem' },
  };

  const ModalForm = ({ title, onSave, onClose, defaultName }) => (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:300 }}
         onClick={onClose}>
      <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:12, padding:'1.5rem', width:320 }}
           onClick={e=>e.stopPropagation()}>
        <h3 style={{ color:'var(--accent)', marginBottom:'1rem' }}>{title}</h3>
        <input style={s.inputStyle} placeholder="Nome da categoria" defaultValue={defaultName} onChange={e=>setName(e.target.value)} />
        <div style={{ marginBottom:8 }}>
          <label style={{ fontSize:'0.8rem', color:'var(--text2)', display:'block', marginBottom:4 }}>Thumbnail</label>
          <input type="file" accept="image/*" onChange={e=>setImgFile(e.target.files[0])} style={{ color:'var(--text)', fontSize:'0.8rem' }}/>
        </div>
        <div style={{ display:'flex', gap:8, marginTop:12 }}>
          <button onClick={onSave} disabled={saving} style={{ flex:1, padding:'8px', background:'var(--accent2)', color:'#fff', border:'none', borderRadius:6, fontSize:'0.85rem' }}>
            {saving ? 'Salvando…' : 'Salvar'}
          </button>
          <button onClick={onClose} style={{ flex:1, padding:'8px', background:'var(--bg3)', color:'var(--text)', border:'1px solid var(--border)', borderRadius:6, fontSize:'0.85rem' }}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
          <Link href="/" style={{ color:'var(--text2)', fontSize:'0.85rem' }}>← Voltar</Link>
          <span style={s.title}>Galeria — Todas as categorias</span>
        </div>
        <button style={s.addBtn} onClick={() => { setName(''); setImgFile(null); setModal(true); }}>+ Nova categoria</button>
      </div>

      <p style={{ color:'var(--text2)', fontSize:'0.8rem', marginBottom:'1rem' }}>As primeiras 4 categorias (por ordem) aparecem na página inicial. Use as setas para reordenar.</p>

      <div style={s.grid}>
        {cats.map((cat, i) => (
          <div key={cat.id} style={s.card}>
            {i < 4 && <div style={s.badge}>#{i+1}</div>}
            <Link href={`/galeria/${cat.id}`}>
              <img src={cat.thumbnail_url} alt={cat.name} style={s.img} />
            </Link>
            <div style={s.cardBody}>
              <span style={s.catName}>{cat.name}</span>
              <div style={s.actions}>
                <button style={s.iconBtn} onClick={() => moveUp(cat, i)} title="Mover acima">↑</button>
                <button style={s.iconBtn} onClick={() => moveDown(cat, i)} title="Mover abaixo">↓</button>
                <button style={s.iconBtn} onClick={() => { setEditModal(cat); setName(cat.name); setImgFile(null); }} title="Editar">✎</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modal && <ModalForm title="Nova categoria" onSave={handleAdd} onClose={() => setModal(false)} defaultName="" />}
      {editModal && <ModalForm title={`Editar: ${editModal.name}`} onSave={handleEdit} onClose={() => setEditModal(null)} defaultName={editModal.name} />}
{eventModal && (
  <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:300 }}
       onClick={() => setEventModal(false)}>
    <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:12, padding:'1.5rem', width:340 }}
         onClick={e => e.stopPropagation()}>
      <h3 style={{ color:'var(--accent)', marginBottom:'1rem' }}>Adicionar evento</h3>
      <input style={s.inputStyle} placeholder="Seu nome (criador)" value={evCreator} onChange={e => setEvCreator(e.target.value)} />
      <input style={s.inputStyle} placeholder="Responsável (opcional)" value={evResponsible} onChange={e => setEvResponsible(e.target.value)} />
      <input style={s.inputStyle} placeholder="Título do evento *" value={evForm.title} onChange={e => setEvForm(f=>({...f, title:e.target.value}))} />
      <input style={s.inputStyle} placeholder="Subtítulo (opcional)" value={evForm.subtitle} onChange={e => setEvForm(f=>({...f, subtitle:e.target.value}))} />
      <input style={s.inputStyle} type="date" value={evForm.eventDate} onChange={e => setEvForm(f=>({...f, eventDate:e.target.value}))} />
      <select style={s.inputStyle} value={evForm.type} onChange={e => setEvForm(f=>({...f, type:e.target.value}))}>
        {['Prova','Trabalho','Apresentação','Entrega'].map(t => <option key={t} value={t}>{t}</option>)}
      </select>
      <div style={{ display:'flex', gap:8, marginTop:12 }}>
        <button onClick={handleAddEvent} disabled={evSaving}
                style={{ flex:1, padding:'8px', background:'var(--accent2)', color:'#fff', border:'none', borderRadius:6, fontSize:'0.85rem' }}>
          {evSaving ? 'Salvando…' : 'Salvar'}
        </button>
        <button onClick={() => setEventModal(false)}
                style={{ flex:1, padding:'8px', background:'var(--bg3)', color:'var(--text)', border:'1px solid var(--border)', borderRadius:6, fontSize:'0.85rem' }}>
          Cancelar
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}