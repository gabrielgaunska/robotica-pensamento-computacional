import { createClient } from '@supabase/supabase-js';
import './style.css';

const env = import.meta.env;
const configured = Boolean(env.VITE_SUPABASE_URL && env.VITE_SUPABASE_ANON_KEY);
const supabase = configured ? createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY) : null;
const app = document.querySelector('#app');

const starter = {
  id: 'starter',
  title: 'Comunicação Sonora com micro:bit',
  unit: 'Unidade 28',
  duration: '2 horas',
  summary: 'Explore os recursos de áudio do micro:bit, use o microfone para detectar sons e crie projetos interativos com a matriz de LEDs.',
  materials: [
    'Placas micro:bit (com cabo USB ou bateria)',
    'Computadores com acesso à internet',
    'Acessar a plataforma MakeCode (makecode.microbit.org)'
  ],
  steps: [
    { title: 'Vamos explorar o som!', text: 'A audição é um de nossos cinco sentidos e o som nos permite reconhecer coisas como um alarme de incêndio, um trovão e conseguimos nos comunicar pela fala.\n\nVamos explorar um pouquinho mais sobre o som usando a tecnologia do micro:bit!\n\nVamos conhecer o microfone e o alto-falante presente no micro:bit e como podemos criar projetos com eles?', image_url: '' },
    { title: 'Microfone e alto-falante', text: 'O microfone pode captar o som ao seu redor, como a voz de seus amigos ou uma música, além de permitir criar sua própria música. Já o alto-falante pode reproduzir sons para podermos escutá-los. Esses recursos podem adicionar sons aos seus projetos no micro:bit.', image_url: '' },
    { title: 'Conhecendo o nível de som', text: 'Vamos voltar à aba Input para explorar o bloco de comando sound level (nível de som) do micro:bit!', image_url: '' },
    { title: 'O que é sound level?', text: 'O bloco sound level mede o nível de som do ambiente pelo microfone integrado no micro:bit. Ele retorna um valor numérico que representa a intensidade do som detectado, de 0 (nenhum som) até 255 (muito alto).\n\nO evento de som alto ou silencioso pode ser usado para ativar uma ação quando determinado nível de som é detectado.', image_url: '' },
    { title: 'Desafio: acenda os LEDs com uma palma', text: 'Faça um programa em que todos os LEDs do micro:bit se acendam quando uma palma for batida perto dele (som alto) e todos os LEDs fiquem apagados quando estiver silencioso.\n\nUse os blocos adequados para responder à intensidade do som.', image_url: '' },
    { title: 'Vamos além!', text: 'Vamos aplicar nossos conhecimentos em situações mais complexas! Teste o projeto, observe os resultados e pense em outras maneiras de usar o som como entrada.', image_url: '' },
    { title: 'Desafio: chapéu seletor de Hogwarts', text: 'Na série Harry Potter, o Chapéu Seletor determina a qual das quatro casas cada aluno pertence: Grifinória, Lufa-Lufa, Corvinal e Sonserina.', image_url: '' },
    { title: 'Programe o Chapéu Seletor', text: 'Escreva um programa para o micro:bit atuar como o Chapéu Seletor. Sempre que um aluno agitar o micro:bit, uma mensagem deverá aparecer no display de LEDs informando a qual casa ele pertence.', image_url: '' },
    { title: 'Sugestão de código', text: 'Crie uma sequência que reconheça o gesto de agitar e escolha uma das quatro casas. Teste o programa e compartilhe sua solução com a turma.', image_url: '' },
    { title: 'Parabéns, inventores!', text: 'Atividade concluída! Feito com criatividade, dedicação e muita tecnologia. Agora, experimente modificar o projeto e inventar novas possibilidades.', image_url: '' }
  ],
  published: true
};

let activities = [];
let currentActivity = null;
let currentStep = 0;
let editingId = null;
let draftSteps = [];
let currentUser = null;
let isAdmin = false;

const esc = (value = '') => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const multiline = value => esc(value).replace(/\n/g, '<br>');
const notice = (message, type = 'info') => {
  const node = document.querySelector('#notice');
  if (!node) return;
  node.textContent = message;
  node.className = `notice ${type}`;
  node.hidden = false;
  window.setTimeout(() => { if (node) node.hidden = true; }, 5000);
};
const goTop = () => {
  requestAnimationFrame(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  });
};

function header() {
  return `<header class="topbar"><a class="brand" href="#" data-action="home"><span class="brand-icon">🤖</span><span>Robótica e Pensamento<br class="brand-break"> Computacional na Prática</span></a><nav><button class="nav-link" data-action="home">Início</button>${isAdmin ? '<button class="nav-link" data-action="admin">Painel do professor</button><button class="nav-link" data-action="logout">Sair</button>' : '<button class="nav-link" data-action="login">Área do professor</button>'}</nav></header>`;
}
function footer() {
  return `<footer><p>© 2026 Robótica e Pensamento Computacional na Prática</p><p class="made">Feito com muito carinho pelo professor Gabriel para os alunos dos quartos e quintos anos e demais turmas participantes. 💙</p></footer>`;
}
function shell(content) {
  app.innerHTML = `${header()}<main>${content}</main>${footer()}<div id="notice" class="notice" hidden></div>`;
}
function homeView() {
  const cards = activities.filter(a => a.published).map(a => `
    <button class="activity-card" data-action="open-activity" data-id="${esc(a.id)}">
      <div class="card-art"><span class="art-chip">${esc(a.unit || 'Robótica')}</span><span class="art-emoji">🤖</span><span class="art-circuit">✳</span></div>
      <div class="card-body"><div class="card-meta">${esc(a.duration || 'Atividade prática')}</div><h2>${esc(a.title)}</h2><p>${esc(a.summary || 'Uma atividade prática para aprender, explorar e inventar.')}</p><span class="read-more">Ver atividade <span aria-hidden="true">→</span></span></div>
    </button>`).join('');
  shell(`<section class="hero"><div class="hero-copy"><span class="eyebrow">APRENDER • CRIAR • EXPERIMENTAR</span><h1>Projetos de Robótica Práticos e Divertidos! 🛠️⚡</h1><p>Atividades educativas passo a passo, pensadas para inspirar crianças e jovens inventores.</p><a class="primary-btn" href="https://makecode.microbit.org/" target="_blank" rel="noopener noreferrer">Abrir MakeCode micro:bit ↗</a></div><div class="hero-illustration" aria-hidden="true"><span class="orbit orbit-one"></span><span class="orbit orbit-two"></span><div class="robot-face">🤖</div><div class="float-chip chip-one">0101</div><div class="float-chip chip-two">micro:bit</div><span class="spark spark-one">✦</span><span class="spark spark-two">⚡</span></div></section>
  <section class="catalog"><div class="section-heading"><div><span class="eyebrow">NOSSO LABORATÓRIO</span><h2>Escolha sua próxima aventura</h2><p>Aprenda no seu ritmo e experimente cada etapa.</p></div><span class="count">${activities.filter(a=>a.published).length} atividade(s)</span></div>
  <label class="searchbox"><span>⌕</span><input id="search" type="search" placeholder="Pesquisar por atividade, unidade ou material..." autocomplete="off"></label>
  <div id="activity-grid" class="activity-grid">${cards || '<div class="empty-state"><span>🚀</span><h3>Novas aventuras em breve!</h3><p>As atividades publicadas pelo professor aparecerão aqui.</p></div>'}</div></section>`);
}
function filteredCards(query) {
  const grid = document.querySelector('#activity-grid');
  if (!grid) return;
  const q = query.toLowerCase();
  const list = activities.filter(a => a.published && [a.title,a.unit,a.summary,(a.materials||[]).join(' ')].join(' ').toLowerCase().includes(q));
  grid.innerHTML = list.length ? list.map(a=>`<button class="activity-card" data-action="open-activity" data-id="${esc(a.id)}"><div class="card-art"><span class="art-chip">${esc(a.unit||'Robótica')}</span><span class="art-emoji">🤖</span><span class="art-circuit">✳</span></div><div class="card-body"><div class="card-meta">${esc(a.duration||'Atividade prática')}</div><h2>${esc(a.title)}</h2><p>${esc(a.summary||'Uma atividade prática para aprender, explorar e inventar.')}</p><span class="read-more">Ver atividade →</span></div></button>`).join('') : '<div class="empty-state"><h3>Nenhuma atividade encontrada</h3><p>Tente pesquisar com outras palavras.</p></div>';
}
function activityView(activity) {
  currentActivity = activity;
  currentStep = 0;
  const steps = activity.steps || [];
  shell(`<button class="back-link" data-action="home">← Voltar para as atividades</button><section class="lesson-intro"><div class="lesson-badges"><span class="pill">${esc(activity.unit||'Atividade')}</span><span class="pill">◷ ${esc(activity.duration||'No seu ritmo')}</span></div><h1>${esc(activity.title)}</h1><p>${esc(activity.summary||'Atividade prática de robótica e pensamento computacional.')}</p></section>
  <section class="materials"><h2>🧰 Materiais necessários</h2><ul>${(activity.materials||[]).map(m=>`<li>${esc(m)}</li>`).join('') || '<li>Confira os materiais indicados pelo professor.</li>'}</ul><a class="secondary-btn" href="https://makecode.microbit.org/" target="_blank" rel="noopener noreferrer">Abrir MakeCode micro:bit ↗</a></section>
  <section class="steps-section"><div class="section-heading"><div><span class="eyebrow">MÃO NA MASSA</span><h2>Passo a passo ilustrado</h2></div><span class="count">${steps.length} etapas</span></div><div id="step-content"></div></section>`);
  renderStep();
}
function renderStep() {
  const host = document.querySelector('#step-content');
  if (!host || !currentActivity) return;
  const steps = currentActivity.steps || [];
  if (!steps.length) { host.innerHTML = '<div class="empty-state">Esta atividade ainda não tem etapas.</div>'; return; }
  const s = steps[currentStep];
  host.innerHTML = `<article class="step-card"><div class="step-top"><span class="step-number">ETAPA ${currentStep+1}</span><span class="step-position">${currentStep+1} de ${steps.length}</span></div><h3>${esc(s.title||`Etapa ${currentStep+1}`)}</h3><div class="step-image-wrap">${s.image_url ? `<img class="step-image" src="${esc(s.image_url)}" alt="Imagem da etapa ${currentStep+1}" loading="eager">` : `<div class="image-placeholder"><span>🧩</span><p>Imagem desta etapa</p><small>O professor pode adicionar uma imagem ilustrativa no painel.</small></div>`}</div><div class="step-text">${multiline(s.text||'')}</div><div class="step-controls"><button class="secondary-btn" data-action="prev-step" ${currentStep===0?'disabled':''}>← Etapa anterior</button><button class="primary-btn" data-action="next-step">${currentStep===steps.length-1?'Concluir atividade':'Próxima etapa →'}</button></div></article><div class="step-dots">${steps.map((_,i)=>`<button aria-label="Ir para etapa ${i+1}" class="step-dot ${i===currentStep?'active':''}" data-action="goto-step" data-step="${i}"></button>`).join('')}</div>`;
}
function loginView() {
  shell(`<section class="auth-wrap"><div class="auth-card"><div class="auth-icon">🔐</div><span class="eyebrow">ACESSO RESTRITO</span><h1>Área do professor</h1><p>Entre com a conta autorizada para criar e publicar atividades.</p><form id="login-form"><label>E-mail<input type="email" name="email" autocomplete="username" required placeholder="professor@escola.com"></label><label>Senha<input type="password" name="password" autocomplete="current-password" required placeholder="Sua senha"></label><button class="primary-btn full" type="submit">Entrar no painel</button><p class="form-help">A conta do professor deve ser criada no painel do Supabase. O cadastro público fica desativado.</p></form></div></section>`);
}
function adminView() {
  const rows = activities.map(a=>`<article class="admin-activity"><div><span class="pill">${esc(a.unit||'Atividade')}</span><h3>${esc(a.title)}</h3><p>${(a.steps||[]).length} etapa(s) · ${a.published?'Publicada':'Rascunho'}</p></div><div class="admin-actions"><button class="secondary-btn compact" data-action="edit" data-id="${esc(a.id)}">Editar</button><button class="secondary-btn compact" data-action="toggle-publish" data-id="${esc(a.id)}">${a.published?'Despublicar':'Publicar'}</button><button class="danger-btn compact" data-action="delete" data-id="${esc(a.id)}">Excluir</button></div></article>`).join('');
  shell(`<section class="admin-head"><div><span class="eyebrow">ESPAÇO DO EDUCADOR</span><h1>Painel do professor</h1><p>Crie atividades, ilustre cada etapa e compartilhe com seus alunos.</p></div><button class="primary-btn" data-action="new">＋ Nova atividade</button></section><div class="admin-note">💡 Dica: use imagens nítidas e grandes. Elas serão exibidas em largura ampla para facilitar a leitura nos Chromebooks.</div><section class="admin-list"><h2>Suas atividades</h2>${rows||'<div class="empty-state">Nenhuma atividade cadastrada.</div>'}</section><div id="editor"></div>`);
}
function editorView(activity = null) {
  editingId = activity?.id || null;
  draftSteps = (activity?.steps || [{title:'',text:'',image_url:''}]).map(s => ({...s}));
  const isNew = !activity;
  const editor = document.querySelector('#editor');
  editor.innerHTML = `<section class="editor-card" id="activity-editor"><div class="editor-head"><div><span class="eyebrow">${isNew?'CRIAR CONTEÚDO':'EDITAR CONTEÚDO'}</span><h2>${isNew?'Nova atividade':'Editar atividade'}</h2></div><button class="icon-btn" data-action="close-editor" aria-label="Fechar">✕</button></div>
  <form id="activity-form"><div class="form-grid"><label>Título da atividade<input name="title" required maxlength="140" value="${esc(activity?.title||'')}"></label><label>Unidade<input name="unit" value="${esc(activity?.unit||'')}" placeholder="Ex.: Unidade 28"></label><label>Duração<input name="duration" value="${esc(activity?.duration||'')} " placeholder="Ex.: 2 horas"></label><label class="span-2">Descrição curta<textarea name="summary" rows="3" required>${esc(activity?.summary||'')}</textarea></label><label class="span-2">Materiais necessários (um por linha)<textarea name="materials" rows="4">${esc(Array.isArray(activity?.materials) ? activity.materials.join('\n') : (activity?.materials || ''))}</textarea></label></div><div class="editor-steps-head"><div><h3>Passo a passo ilustrado</h3><p>Adicione quantas etapas precisar. Cada etapa pode ter sua própria imagem.</p></div><button type="button" class="secondary-btn" data-action="add-step">＋ Adicionar passo</button></div><div id="draft-steps">${draftSteps.map((s,i)=>stepEditor(s,i)).join('')}</div><div class="form-actions"><button type="button" class="secondary-btn" data-action="close-editor">Cancelar</button><button type="submit" class="primary-btn">${isNew?'Salvar atividade':'Salvar alterações'}</button></div></form></section>`;
  editor.scrollIntoView({behavior:'smooth',block:'start'});
}
function stepEditor(step, i) {
  return `<article class="draft-step" data-index="${i}"><div class="draft-step-head"><h4>Etapa ${i+1}</h4><button type="button" class="text-danger" data-action="remove-step" data-step="${i}" ${draftSteps.length===1?'disabled':''}>Remover etapa</button></div><label>Título da etapa<input data-field="title" data-step="${i}" value="${esc(step.title||'')}" required placeholder="Ex.: Conhecendo o microfone"></label><label>Instruções<textarea data-field="text" data-step="${i}" rows="4" required placeholder="Explique o que o aluno deve fazer...">${esc(step.text||'')}</textarea></label><label>Imagem grande da etapa<input type="file" accept="image/*" data-image-step="${i}"><small>Prefira JPG, PNG ou WebP. Tamanho recomendado: até 8 MB.</small></label><div class="image-preview" id="preview-${i}">${step.image_url?`<img src="${esc(step.image_url)}" alt="Prévia da imagem da etapa ${i+1}">`:'<span>Nenhuma imagem selecionada</span>'}</div><input type="hidden" data-field="image_url" data-step="${i}" value="${esc(step.image_url||'')}"></article>`;
}
function syncDraftFromDOM() {
  document.querySelectorAll('[data-field]').forEach(el => {
    const i = Number(el.dataset.step);
    if (draftSteps[i]) draftSteps[i][el.dataset.field] = el.value;
  });
}
async function loadActivities() {
  if (!configured) { activities = [starter]; return; }
  const { data, error } = await supabase.from('activities').select('*').order('created_at', {ascending:false});
  if (error) { console.error(error); activities = [starter]; return; }
  activities = data || [];
  // A atividade inicial é um exemplo local até ser importada/publicada pelo professor.
  if (!activities.some(a => a.title === starter.title)) activities.unshift(starter);
}
async function checkAdmin() {
  if (!configured) return;
  const {data:{session}} = await supabase.auth.getSession();
  currentUser = session?.user || null;
  isAdmin = false;
  if (currentUser) {
    const {data} = await supabase.from('profiles').select('role').eq('id', currentUser.id).maybeSingle();
    isAdmin = data?.role === 'admin';
  }
}
async function refresh(view = 'home') {
  if (configured) await checkAdmin();
  await loadActivities();
  if (view === 'admin' && isAdmin) adminView();
  else if (view === 'login') loginView();
  else homeView();
}
function showConfiguration() {
  shell(`<section class="setup-warning"><span class="warning-icon">⚙️</span><h1>Quase pronto!</h1><p>O site já está montado, mas precisa ser conectado ao Supabase para ativar o login, salvar atividades e armazenar imagens permanentemente.</p><ol><li>Crie um projeto no Supabase.</li><li>Execute o arquivo <code>supabase/schema.sql</code> no SQL Editor.</li><li>Copie <code>.env.example</code> para <code>.env</code> e preencha a URL e a chave publicável.</li><li>Crie a conta do professor e marque o perfil como <code>admin</code>, conforme o README.</li></ol><p>Enquanto isso, a atividade de exemplo aparece como demonstração local. As alterações não serão salvas permanentemente.</p></section>`);
}
app.addEventListener('input', e => {
  if (e.target.id === 'search') filteredCards(e.target.value);
  if (e.target.matches('[data-field]')) {
    const i = Number(e.target.dataset.step);
    if (draftSteps[i]) draftSteps[i][e.target.dataset.field] = e.target.value;
  }
});
app.addEventListener('change', async e => {
  const input = e.target;
  if (!input.matches('[data-image-step]') || !input.files?.[0]) return;
  syncDraftFromDOM();
  const i = Number(input.dataset.imageStep);
  const file = input.files[0];
  if (!file.type.startsWith('image/')) return notice('Escolha um arquivo de imagem.', 'error');
  if (file.size > 8 * 1024 * 1024) return notice('A imagem deve ter até 8 MB.', 'error');
  const preview = document.querySelector(`#preview-${i}`);
  if (preview) preview.innerHTML = `<img src="${URL.createObjectURL(file)}" alt="Prévia da imagem selecionada">`;
  draftSteps[i].file = file;
  notice('Imagem selecionada. Ela será enviada ao salvar a atividade.');
});
app.addEventListener('submit', async e => {
  e.preventDefault();
  if (e.target.id === 'login-form') {
    if (!configured) return showConfiguration();
    const form = new FormData(e.target);
    const {error} = await supabase.auth.signInWithPassword({email:form.get('email'),password:form.get('password')});
    if (error) return notice('Não foi possível entrar. Confira o e-mail e a senha.', 'error');
    await checkAdmin();
    if (!isAdmin) { await supabase.auth.signOut(); currentUser=null; return notice('Esta conta não tem permissão de professor.', 'error'); }
    await refresh('admin'); notice('Login realizado com sucesso.', 'success');
  }
  if (e.target.id === 'activity-form') {
    if (!configured || !isAdmin) return notice('Conecte o Supabase e entre como professor para salvar.', 'error');
    syncDraftFromDOM();
    const form = new FormData(e.target);
    const title = String(form.get('title')||'').trim();
    const payload = {title,unit:String(form.get('unit')||'').trim(),duration:String(form.get('duration')||'').trim(),summary:String(form.get('summary')||'').trim(),materials:String(form.get('materials')||'').split('\n').map(s=>s.trim()).filter(Boolean),steps:[],published:false,created_by:currentUser.id};
    for (let i=0;i<draftSteps.length;i++) {
      const s = draftSteps[i];
      if (s.file) {
        const safeName = s.file.name.replace(/[^a-zA-Z0-9._-]/g,'_');
        const path = `${currentUser.id}/${crypto.randomUUID()}-${safeName}`;
        const {error:uploadError} = await supabase.storage.from('activity-images').upload(path,s.file,{upsert:false,contentType:s.file.type});
        if (uploadError) return notice(`Erro ao enviar imagem da etapa ${i+1}: ${uploadError.message}`, 'error');
        const {data:publicData} = supabase.storage.from('activity-images').getPublicUrl(path);
        s.image_url = publicData.publicUrl;
      }
      payload.steps.push({title:s.title,text:s.text,image_url:s.image_url||''});
    }
    let result;
    if (editingId) result = await supabase.from('activities').update({...payload,updated_at:new Date().toISOString()}).eq('id',editingId).select().single();
    else result = await supabase.from('activities').insert(payload).select().single();
    if (result.error) return notice(`Não foi possível salvar: ${result.error.message}`, 'error');
    await refresh('admin'); notice('Atividade salva como rascunho. Publique quando estiver pronta.', 'success'); goTop();
  }
});
app.addEventListener('click', async e => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const action = btn.dataset.action;
  if (action === 'home') { await refresh('home'); goTop(); }
  if (action === 'login') { if (!configured) return showConfiguration(); loginView(); }
  if (action === 'admin') { if (!isAdmin) return loginView(); await refresh('admin'); goTop(); }
  if (action === 'logout') { if (supabase) await supabase.auth.signOut(); currentUser=null; isAdmin=false; await refresh('home'); notice('Você saiu do painel.'); }
  if (action === 'open-activity') { const a=activities.find(x=>String(x.id)===btn.dataset.id); if(a) activityView(a); goTop(); }
  if (action === 'prev-step' && currentStep>0) { currentStep--; renderStep(); }
  if (action === 'next-step' && currentActivity) { if(currentStep < currentActivity.steps.length-1) {currentStep++;renderStep();} else {notice('Parabéns! Você concluiu esta atividade.','success');} }
  if (action === 'goto-step') { currentStep=Number(btn.dataset.step);renderStep(); }
  if (action === 'new') editorView();
  if (action === 'edit') { const a=activities.find(x=>String(x.id)===btn.dataset.id); if(a && a.id!=='starter') editorView(a); else notice('A atividade de demonstração precisa ser importada para o banco antes de editar.', 'info'); }
  if (action === 'close-editor') { const editor=document.querySelector('#editor'); if(editor) editor.innerHTML=''; }
  if (action === 'add-step') { syncDraftFromDOM(); draftSteps.push({title:'',text:'',image_url:''}); editorView({id:editingId, ...(document.querySelector('#activity-form') ? Object.fromEntries(new FormData(document.querySelector('#activity-form'))) : {}), steps:draftSteps}); }
  if (action === 'remove-step') { syncDraftFromDOM(); if(draftSteps.length>1){draftSteps.splice(Number(btn.dataset.step),1); editorView({id:editingId,...(document.querySelector('#activity-form')?Object.fromEntries(new FormData(document.querySelector('#activity-form'))):{}),steps:draftSteps});} }
  if (action === 'toggle-publish') {
    if (!isAdmin || !configured) return;
    const a=activities.find(x=>String(x.id)===btn.dataset.id); if(!a || a.id==='starter') return notice('Importe a atividade de demonstração para o banco antes de publicar.', 'info');
    const {error}=await supabase.from('activities').update({published:!a.published,updated_at:new Date().toISOString()}).eq('id',a.id);
    if(error) notice(error.message,'error'); else {await refresh('admin');notice(a.published?'Atividade despublicada.':'Atividade publicada!','success');}
  }
  if (action === 'delete') {
    if(!isAdmin || !configured) return;
    const a=activities.find(x=>String(x.id)===btn.dataset.id); if(!a || a.id==='starter') return notice('Importe a atividade de demonstração para o banco antes de excluir.', 'info');
    if(!confirm(`Excluir a atividade "${a.title}"? Essa ação não pode ser desfeita.`)) return;
    const {error}=await supabase.from('activities').delete().eq('id',a.id);
    if(error) notice(error.message,'error'); else {await refresh('admin');notice('Atividade excluída.','success');}
  }
});
(async () => {
  if (!configured) { activities=[starter]; homeView(); return; }
  await refresh('home');
  supabase.auth.onAuthStateChange(() => { setTimeout(async()=>{await checkAdmin();},0); });
})();