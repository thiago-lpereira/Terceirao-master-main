'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { use } from 'react';

export default function CategoriaPage({ params }) {
  const { id } = use(params);
  const [images, setImages] = useState([]);
  const [catName, setCatName] = useState('');
  const [modal, setModal] = useState(false);
  const [subtitle, setSubtitle] = useState('');
  const [imgFile, setImgFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchImages = async () => {
    const [cats, imgs] = await Promise.all([
      fetch('/api/categorias').then(r=>r.json()),
      fetch(`/api/categorias/${id}/images`).then(r=>r.json()),
    ]);
    const cat = cats.find(c => c.id == id);
    if (cat) setCatName(cat.name);
    setImages(imgs);
  };
  useEffect(() => { fetchImages(); }, [id]);

  const handleAdd = async () => {
    if (!imgFile) return;
    setSaving(true);
    const fd = new FormData(); fd.append('file', imgFile);
    const up = await fetch('/api/upload', { method:'POST', body:fd });
    const { url } = await up.json();
    await fetch(`/api/categorias/${id}/images`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ imageUrl: url, subtitle }),
    });
    setModal(false); setSubtitle(''); setImgFile(null);
    setSaving(false); fetchImages();
  };

  const handleDelete = async (imageId) => {
    if (!confirm('Deletar esta imagem?')) return;
    await fetch(`/api/categorias/${id}/images`, {
      method:'DELETE', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ imageId }),
    });
    fetchImages();
  };

  const s = {
    page: { background:'var(--bg)', minHeight:'100vh', padding:'2rem', color:'var(--text)', fontFamily:'system-ui,sans-serif' },
    header: { display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'2rem' },
    title: { fontSize:'1.5rem', fontWeight:700, color:'var(--accent)' },
    grid: { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:'0.75rem' },
    card: { background:'var(--card-bg)', border:'1px solid var(--border)', borderRadius:8, overflow:'hidden' },
    img: { width:'100%', aspectRatio:'4/3', objectFit:'cover', display:'block' },
    cardFooter: { padding:'0.5rem 0.6rem', display:'flex', alignItems:'center', justifyContent:'space-between' },
    sub: { fontSize:'0.78rem', color:'var(--text2)' },
    delBtn: { background:'none', border:'none', color:'#ef4444', cursor:'pointer', fontSize:'0.8rem' },
    addBtn: { padding:'8px 18px', background:'var(--accent2)', color:'#fff', border:'none', borderRadius:7, fontSize:'0.85rem', cursor:'pointer', display:'block', margin:'2rem auto 0' },
    inputStyle: { width:'100%', padding:'7px 10px', marginBottom:8, background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:6, color:'var(--text)', fontSize:'0.85rem' },
  };

  return (
    <div style={s.page}>
      <div style={s.header}>
        <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
          <Link href="/galeria" style={{ color:'var(--text2)', fontSize:'0.85rem' }}>← Galeria</Link>
          <span style={s.title}>{catName}</span>
        </div>
        <button style={s.addBtn} onClick={() => { setSubtitle(''); setImgFile(null); setModal(true); }}>+ Adicionar imagem</button>
      </div>

      <div style={s.grid}>
        {images.map(img => (
          <div key={img.id} style={s.card}>
            <img src={img.image_url} alt={img.subtitle || ''} style={s.img} />
            <div style={s.cardFooter}>
              <span style={s.sub}>{img.subtitle || <em style={{ color:'var(--border)' }}>sem legenda</em>}</span>
              <button style={s.delBtn} onClick={() => handleDelete(img.id)}>✕</button>
            </div>
          </div>
        ))}
      </div>

      {images.length === 0 && <p style={{ color:'var(--text2)', textAlign:'center', marginTop:'3rem' }}>Nenhuma imagem ainda.</p>}

      {modal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:300 }}
             onClick={() => setModal(false)}>
          <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:12, padding:'1.5rem', width:320 }}
               onClick={e=>e.stopPropagation()}>
            <h3 style={{ color:'var(--accent)', marginBottom:'1rem' }}>Adicionar imagem</h3>
            <input style={s.inputStyle} placeholder="Legenda (opcional)" value={subtitle} onChange={e=>setSubtitle(e.target.value)} />
            <div style={{ marginBottom:8 }}>
              <label style={{ fontSize:'0.8rem', color:'var(--text2)', display:'block', marginBottom:4 }}>Imagem *</label>
              <input type="file" accept="image/*" onChange={e=>setImgFile(e.target.files[0])} style={{ color:'var(--text)', fontSize:'0.8rem' }}/>
            </div>
            <div style={{ display:'flex', gap:8, marginTop:12 }}>
              <button onClick={handleAdd} disabled={saving} style={{ flex:1, padding:'8px', background:'var(--accent2)', color:'#fff', border:'none', borderRadius:6, fontSize:'0.85rem' }}>
                {saving ? 'Enviando…' : 'Salvar'}
              </button>
              <button onClick={() => setModal(false)} style={{ flex:1, padding:'8px', background:'var(--bg3)', color:'var(--text)', border:'1px solid var(--border)', borderRadius:6, fontSize:'0.85rem' }}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}