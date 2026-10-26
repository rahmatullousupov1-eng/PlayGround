/* Invictus 3.0 — product layer
 * UX, medical knowledge, local-first social interactions and backend-ready auth.
 */
(function(){
  const K={profile:'invictus_v3_profile',posts:'invictus_v3_posts',likes:'invictus_v3_likes',comments:'invictus_v3_comments'};
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const uid=()=>crypto?.randomUUID?crypto.randomUUID():'v3-'+Date.now()+'-'+Math.random().toString(36).slice(2);
  const read=(k,f)=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(f))}catch{return f}};
  const write=(k,v)=>localStorage.setItem(k,JSON.stringify(v));

  const medical=[
    ['Анатомия','Строение человеческого тела','Органы, системы органов, топографическая и клиническая анатомия.'],
    ['Гистология','Микроскопическое строение тканей','Клетки, ткани, органы и основы эмбриогенеза.'],
    ['Физиология','Функции организма','Гомеостаз, нервная, эндокринная, сердечно-сосудистая и дыхательная системы.'],
    ['Биохимия','Молекулярные процессы','Белки, ферменты, углеводы, липиды, нуклеотиды и энергетический обмен.'],
    ['Микробиология','Микроорганизмы и иммунитет','Бактерии, вирусы, грибы, простейшие и основы иммунопрофилактики.'],
    ['Патология','Механизмы болезни','Повреждение, воспаление, нарушения кровообращения, некроз и опухолевый рост.'],
    ['Фармакология','Лекарственные средства','Механизмы действия, показания, нежелательные реакции и взаимодействия.'],
    ['Внутренние болезни','Клиническая медицина','Синдромы, диагностика, дифференциальный подход и основы лечения.'],
    ['Хирургия','Оперативная и неотложная помощь','Асептика, хирургические заболевания, травма и послеоперационное ведение.'],
    ['Педиатрия','Медицина детского возраста','Возрастная физиология, распространённые заболевания и профилактика.'],
    ['Акушерство и гинекология','Женское здоровье','Физиология беременности, родов и основные заболевания репродуктивной системы.'],
    ['Неврология','Нервная система','Неврологический осмотр, синдромы, поражения ЦНС и периферической нервной системы.']
  ];

  const V3={
    profile:read(K.profile,{name:'Пользователь',username:'',bio:'Студент-медик',avatar:'🎓'}),
    init(){
      this.mountMedical(); this.mountHome(); this.mountProfileTools(); this.mountAuth();
      window.addEventListener('storage',()=>this.refresh());
      console.log('✓ Invictus 3.0 product layer initialized');
    },
    mountHome(){
      const grid=document.getElementById('home-quick-actions'); if(!grid)return;
      const old=grid.innerHTML;
      grid.innerHTML=old+`<div class="v3-quick-row">
        <button class="v3-action" onclick="navigationManager.goTo('medical')"><b>🩺</b><span>Энциклопедия</span><small>12 направлений</small></button>
        <button class="v3-action" onclick="navigationManager.goTo('notes')"><b>📝</b><span>Конспекты</span><small>Личная база</small></button>
        <button class="v3-action" onclick="V3.openAssistant()"><b>🤖</b><span>Учебный помощник</span><small>Объяснить тему</small></button>
      </div>`;
    },
    mountMedical(){
      const original=window.medicalModule;
      if(!original || original.__v3Wrapped)return;
      const self=this; const oldShow=original.show?.bind(original);
      original.__v3Wrapped=true;
      original.show=function(){const s=document.getElementById('medical-screen');if(s)s.style.display='block';self.renderMedical();};
      original.hide=original.hide||function(){const s=document.getElementById('medical-screen');if(s)s.style.display='none';};
    },
    renderMedical(filter=''){
      const root=document.getElementById('medical-content');if(!root)return;
      const q=filter.trim().toLowerCase(); const rows=medical.filter(x=>!q||x.join(' ').toLowerCase().includes(q));
      root.innerHTML=`<div class="v3-medical-head"><div><span class="v3-eyebrow">INVICТUS KNOWLEDGE</span><h1>🩺 Медицинская энциклопедия</h1><p>Структурированная база для обучения. Материалы предназначены для учебных целей и не заменяют клинические рекомендации.</p></div></div>
      <div class="v3-med-search"><input value="${esc(filter)}" placeholder="Поиск: физиология, инсулин, анатомия..." oninput="V3.renderMedical(this.value)"></div>
      <div class="v3-subject-grid">${rows.map((x,i)=>`<article class="v3-subject" onclick="V3.openTopic(${i},'${encodeURIComponent(x[0])}')"><div class="v3-subject-icon">${['🫀','🔬','🧠','⚗️','🦠','🧬','💊','🩺','🏥','🧒','🤰','🧠'][i]||'📚'}</div><h3>${esc(x[0])}</h3><p>${esc(x[1])}</p><span>${esc(x[2])}</span></article>`).join('')||'<div class="v3-empty">Ничего не найдено.</div>'}</div>`;
    },
    openTopic(i){
      const x=medical[i]; if(!x)return; const root=document.getElementById('medical-content');
      root.innerHTML=`<button class="back-btn" onclick="V3.renderMedical()">← Все разделы</button><article class="v3-topic"><span class="v3-eyebrow">МЕДИЦИНА</span><h1>${esc(x[0])}</h1><h2>${esc(x[1])}</h2><p>${esc(x[2])}</p><div class="v3-topic-grid"><div><b>Что изучать</b><ul><li>Основные определения и термины</li><li>Нормальная структура и функция</li><li>Патологические изменения</li><li>Клиническое значение</li></ul></div><div><b>Инструменты</b><button onclick="navigationManager.goTo('tests')">🧪 Пройти тесты</button><button onclick="navigationManager.goTo('notes')">📝 Создать конспект</button></div></div><div class="v3-disclaimer">Учебный материал. Для диагностики и лечения используйте актуальные клинические рекомендации и консультацию специалиста.</div></article>`;
    },
    mountProfileTools(){
      const inject=()=>{const root=document.getElementById('profile-content');if(!root||root.querySelector('.v3-profile-card'))return;root.insertAdjacentHTML('afterbegin',`<div class="v3-profile-card"><div class="v3-avatar">${esc(this.profile.avatar||'🎓')}</div><div><b>${esc(this.profile.name)}</b><span>${esc(this.profile.username?('@'+this.profile.username):'Гостевой профиль')}</span><small>${esc(this.profile.bio||'Студент-медик')}</small></div><button onclick="V3.openProfileEditor()">Изменить</button></div><div class="v3-profile-links"><button onclick="navigationManager.goTo('notes')">📝 Мои конспекты</button><button onclick="V3.openAssistant()">🤖 Учебный помощник</button><button onclick="V3.openAuth()">🔐 Аккаунт</button></div>`)};
      setTimeout(inject,100); setInterval(inject,1200);
    },
    mountAuth(){
      if(document.getElementById('v3-auth-modal'))return;
      document.body.insertAdjacentHTML('beforeend',`<div id="v3-auth-modal" class="v3-modal" hidden><div class="v3-modal-box"><button class="v3-x" onclick="V3.closeModals()">×</button><div class="v3-auth-icon">🔐</div><h2>Аккаунт Invictus</h2><p>Локальный профиль работает сразу. Supabase можно подключить позже для синхронизации между устройствами.</p><input id="v3-name" placeholder="Ваше имя"><input id="v3-username" placeholder="username"><button class="v3-primary" onclick="V3.saveProfile()">Сохранить профиль</button><button class="v3-secondary" onclick="V3.closeModals()">Продолжить как гость</button></div></div>`);
      document.body.insertAdjacentHTML('beforeend',`<div id="v3-assistant-modal" class="v3-modal" hidden><div class="v3-modal-box"><button class="v3-x" onclick="V3.closeModals()">×</button><span class="v3-eyebrow">STUDY ASSISTANT</span><h2>🤖 Учебный помощник</h2><textarea id="v3-question" rows="5" placeholder="Например: объясни потенциал действия простыми словами"></textarea><button class="v3-primary" onclick="V3.answer()">Объяснить</button><div id="v3-answer" class="v3-answer">Введите вопрос — здесь будет учебное объяснение.</div><small>Это учебный инструмент, а не медицинский диагностический сервис.</small></div></div>`);
    },
    openAuth(){const m=document.getElementById('v3-auth-modal');m.hidden=false;document.getElementById('v3-name').value=this.profile.name==='Пользователь'?'':this.profile.name;document.getElementById('v3-username').value=this.profile.username||'';},
    openProfileEditor(){this.openAuth();},
    openAssistant(){document.getElementById('v3-assistant-modal').hidden=false;},
    closeModals(){document.querySelectorAll('.v3-modal').forEach(x=>x.hidden=true);},
    saveProfile(){const name=document.getElementById('v3-name').value.trim()||'Пользователь';const username=document.getElementById('v3-username').value.trim().replace(/[^a-zA-Z0-9_]/g,'').slice(0,24);this.profile={...this.profile,name,username,bio:this.profile.bio||'Студент-медик'};write(K.profile,this.profile);this.closeModals();this.refresh();showTempMessage('✅ Профиль сохранён');},
    answer(){const q=(document.getElementById('v3-question').value||'').trim();const out=document.getElementById('v3-answer');if(!q){out.textContent='Напишите вопрос.';return;}const low=q.toLowerCase();let a='Разберём тему по шагам: определение → механизм → клиническое значение → ключевые термины. Для точного ответа добавьте предмет или конкретный термин.';if(low.includes('потенциал'))a='Потенциал действия — быстрое изменение мембранного потенциала возбудимой клетки. Сначала открываются Na⁺-каналы и возникает деполяризация, затем Na⁺-каналы инактивируются, K⁺-каналы обеспечивают реполяризацию. После этого возможен период гиперполяризации.';else if(low.includes('инсулин'))a='Инсулин — пептидный гормон β-клеток поджелудочной железы. Он способствует поступлению глюкозы в чувствительные ткани, стимулирует синтез гликогена и липидов и подавляет процессы, повышающие глюкозу крови.';else if(low.includes('гомеостаз'))a='Гомеостаз — поддержание относительного постоянства внутренней среды. Большинство систем работает по принципу отрицательной обратной связи: отклонение параметра запускает ответ, уменьшающий это отклонение.';out.textContent=a;},
    refresh(){const n=document.querySelector('.v3-profile-card b');if(n)n.textContent=this.profile.name;const u=document.querySelector('.v3-profile-card span');if(u)u.textContent=this.profile.username?'@'+this.profile.username:'Гостевой профиль';}
  };
  window.V3=V3;
  document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>V3.init(),250));
})();
