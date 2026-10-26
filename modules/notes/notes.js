const notesModule={
 KEY:'invictus_notes_v1',notes:[],editingId:null,
 init(){try{this.notes=JSON.parse(localStorage.getItem(this.KEY)||'[]');if(!Array.isArray(this.notes))this.notes=[];}catch(e){this.notes=[];}},
 save(){localStorage.setItem(this.KEY,JSON.stringify(this.notes));},
 show(){const s=document.getElementById('notes-screen');if(!s)return;s.style.display='block';this.render();},
 hide(){const s=document.getElementById('notes-screen');if(s)s.style.display='none';},
 render(){const root=document.getElementById('notes-content');if(!root)return;root.innerHTML=`<div class="notes-head"><div><span class="eyebrow">Личная база</span><h1>📝 Мои конспекты</h1><p>Сохраняйте определения, идеи и учебные заметки в одном месте.</p></div><button class="notes-new" onclick="notesModule.newNote()">＋ Новая</button></div><div class="notes-layout"><form class="note-editor" onsubmit="event.preventDefault();notesModule.submit()"><input id="note-title" placeholder="Название" maxlength="120" required><textarea id="note-body" placeholder="Текст заметки..." rows="12" required></textarea><div class="note-actions"><button type="button" class="ghost-btn" onclick="notesModule.cancel()">Очистить</button><button class="primary-btn" type="submit">Сохранить</button></div></form><div class="notes-list">${this.notes.length?this.notes.map(n=>`<article class="note-card" onclick="notesModule.edit('${n.id}')"><h3>${this.esc(n.title)}</h3><p>${this.esc(n.body).slice(0,240)}</p><time>${new Date(n.updatedAt).toLocaleString('ru-RU')}</time></article>`).join(''):'<div class="notes-empty">Пока нет заметок. Создайте первый конспект.</div>'}</div></div>`;if(this.editingId)this.fill(this.editingId);},
 newNote(){this.editingId=null;this.render();document.getElementById('note-title').focus();},
 edit(id){this.editingId=id;this.render();},
 fill(id){const n=this.notes.find(x=>x.id===id);if(n){document.getElementById('note-title').value=n.title;document.getElementById('note-body').value=n.body;}},
 submit(){const title=document.getElementById('note-title').value.trim(),body=document.getElementById('note-body').value.trim();if(!title||!body)return;const now=new Date().toISOString();if(this.editingId){const n=this.notes.find(x=>x.id===this.editingId);if(n){n.title=title;n.body=body;n.updatedAt=now;}}else this.notes.unshift({id:(crypto.randomUUID?crypto.randomUUID():String(Date.now())),title,body,createdAt:now,updatedAt:now});this.save();this.render();showTempMessage('✅ Конспект сохранён');},
 cancel(){this.editingId=null;this.render();},
 esc(v){return String(v||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
};
window.notesModule=notesModule;
document.addEventListener('DOMContentLoaded',()=>notesModule.init());
