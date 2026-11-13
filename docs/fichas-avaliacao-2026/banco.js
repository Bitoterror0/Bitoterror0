(() => {
  const config = window.FICHAS_BANCO;
  if (!config?.url || !config.chavePublicavel) return;
  const url = new URL(config.url);
  if (url.protocol !== "https:" || !url.hostname.endsWith(".supabase.co")
      || url.username || url.password || url.port || url.search || url.hash
      || url.pathname !== "/" || !config.chavePublicavel.startsWith("sb_publishable_")) {
    throw new Error("Configuração pública do banco inválida.");
  }

  const tabela = "fichas_avaliacao_2026";
  let cliente;
  async function conectar() {
    if (cliente) return cliente;
    if (!window.supabase) {
      await new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.110.0/dist/umd/supabase.js";
        script.integrity = "sha384-3wY11tldQ5+yWqAvmTN4XtQvnjoTva0cV15O/O/O5NTtp0ivVopSzLOzsVXWZse9";
        script.crossOrigin = "anonymous";
        script.onload = resolve;
        script.onerror = reject;
        document.head.append(script);
      });
    }
    cliente = window.supabase.createClient(url.origin, config.chavePublicavel, {
      auth: {
        persistSession: true,
        storage: window.sessionStorage,
        storageKey: "fichas-avaliacao-2026-auth",
        detectSessionInUrl: false,
      },
    });
    return cliente;
  }

  function resultado({ data, error }) {
    if (error) throw error;
    return data;
  }

  window.FichasBanco = {
    async sessao() {
      const db = await conectar();
      return resultado(await db.auth.getSession()).session;
    },
    async entrar(email, password) {
      const db = await conectar();
      return resultado(await db.auth.signInWithPassword({ email, password })).session;
    },
    async sair() {
      const db = await conectar();
      resultado(await db.auth.signOut({ scope: "local" }));
    },
    async listar() {
      const db = await conectar();
      const todas = [];
      let ultimo = "";
      while (true) {
        const lote = resultado(await db.from(tabela)
          .select("id,dados,versao").gt("id", ultimo).order("id").limit(200));
        todas.push(...lote);
        if (lote.length < 200) return todas;
        ultimo = lote.at(-1).id;
      }
    },
    async salvar(ficha, versao, substituir) {
      const db = await conectar();
      if (substituir) {
        return resultado(await db.rpc("substituir_fichas_2026", {
          ficha,
          versao_atual: versao,
          apagar_id: substituir.id,
          apagar_versao: substituir.versao,
        }));
      }
      const query = versao
        ? db.from(tabela).update({ dados: ficha, versao: crypto.randomUUID() })
          .eq("id", ficha.id).eq("versao", versao)
        : db.from(tabela).insert({ id: ficha.id, dados: ficha });
      const registro = resultado(await query.select("versao").maybeSingle());
      if (!registro) throw new Error("conflito");
      return registro.versao;
    },
    async apagar(id, versao) {
      const db = await conectar();
      const resposta = await db.from(tabela).delete().eq("id", id).eq("versao", versao)
        .select("id").maybeSingle();
      if (!resultado(resposta)) throw new Error("conflito");
    },
  };
})();
