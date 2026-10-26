// ============================================
// Supabase Auth Integration (Optional Provider)
// ============================================
// Activate by setting appData.authProvider = 'supabase' and
// appData.supabaseUrl + appData.supabaseAnonKey in dev mode.
// Falls back to local auth when provider is 'none' or Supabase is unreachable.

const SupabaseAuthProvider = {
    isActive: false,
    session: null,

    init: function(appData) {
        const sp = appData.syncSettings || {};
        if (sp.provider === 'supabase' && sp.supabaseUrl && sp.supabaseAnonKey) {
            this.isActive = true;
            this.baseUrl = sp.supabaseUrl.replace(/\/+$/, '');
            this.anonKey = sp.supabaseAnonKey;
        }
    },

    _headers: function() {
        return {
            apikey: this.anonKey,
            Authorization: 'Bearer ' + (this.session?.access_token || this.anonKey),
            'Content-Type': 'application/json'
        };
    },

    signUp: async function(email, password, metadata) {
        if (!this.isActive) return { error: 'Supabase auth not configured' };
        try {
            const resp = await fetch(this.baseUrl + '/auth/v1/signup', {
                method: 'POST',
                headers: { apikey: this.anonKey, 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, data: metadata || {} })
            });
            const data = await resp.json();
            if (data.access_token) {
                this.session = data;
            }
            return data;
        } catch(e) { return { error: e.message }; }
    },

    signIn: async function(email, password) {
        if (!this.isActive) return { error: 'Supabase auth not configured' };
        try {
            const resp = await fetch(this.baseUrl + '/auth/v1/token?grant_type=password', {
                method: 'POST',
                headers: { apikey: this.anonKey, 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await resp.json();
            if (data.access_token) {
                this.session = data;
                localStorage.setItem('supabase_session', JSON.stringify(data));
            }
            return data;
        } catch(e) { return { error: e.message }; }
    },

    signOut: async function() {
        this.session = null;
        localStorage.removeItem('supabase_session');
    },

    restoreSession: function() {
        try {
            const saved = localStorage.getItem('supabase_session');
            if (saved) this.session = JSON.parse(saved);
        } catch(e) {}
    },

    getUser: function() {
        return this.session?.user || null;
    }
};

window.SupabaseAuthProvider = SupabaseAuthProvider;
