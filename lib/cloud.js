/* Invictus Cloud Layer
 * Backend-ready REST adapter with a local fallback.
 * Configure window.InvictusCloud.configure({url, anonKey}) after deployment.
 */
(function(){
  const KEY='invictus_cloud_config_v1';
  const Cloud={
    config:{url:'',anonKey:''},
    init(){try{const saved=JSON.parse(localStorage.getItem(KEY)||'{}');this.config={...this.config,...saved};}catch(e){};return this;},
    configure(cfg={}){this.config={url:String(cfg.url||'').replace(/\/$/,''),anonKey:String(cfg.anonKey||'')};localStorage.setItem(KEY,JSON.stringify(this.config));return this;},
    isReady(){return Boolean(this.config.url&&this.config.anonKey);},
    headers(token){return {apikey:this.config.anonKey,Authorization:'Bearer '+(token||this.config.anonKey),'Content-Type':'application/json',Prefer:'return=representation'};},
    async query(table,{method='GET',body=null,query='',token=''}={}){
      if(!this.isReady()) throw new Error('Cloud backend is not configured');
      const res=await fetch(`${this.config.url}/rest/v1/${table}${query}`,{method,headers:this.headers(token),body:body==null?undefined:JSON.stringify(body)});
      const text=await res.text();let data=null;try{data=text?JSON.parse(text):null}catch(e){data=text}
      if(!res.ok) throw new Error((data&&data.message)||`HTTP ${res.status}`);
      return data;
    },
    async listPosts(token){return this.query('posts',{token,query:'?select=*&order=created_at.desc&limit=50'});},
    async createPost(post,token){return this.query('posts',{method:'POST',body:post,token});},
    async toggleLike(postId,userId,token){return this.query('post_likes',{method:'POST',body:{post_id:postId,user_id:userId},token});},
    async listNotes(userId,token){return this.query('notes',{token,query:`?select=*&user_id=eq.${encodeURIComponent(userId)}&order=updated_at.desc`});},
    async saveNote(note,token){return this.query('notes',{method:'POST',body:note,token});}
  };
  window.InvictusCloud=Cloud.init();
})();
