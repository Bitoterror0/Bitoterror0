window.iniciarPedagogico = function ({ avisar, perguntar, entregar, falar, ler, gravar }) {
  const porId = (id) => document.getElementById(id);
  const chave = "fichas-2026-registros-pedagogicos-v1";
  const tipos = {
    plano: ["Plano de aula", "Descreva objetivos, sequência da aula, recursos de acessibilidade e como avaliar a atividade."],
    agenda: ["Compromisso", "Informe o horário, local ou link de reunião e o que precisa ser preparado."],
    diario: ["Anotação pedagógica", "Registre o que foi trabalhado, o progresso observado e o próximo passo."],
    material: ["Material de aula", "Cole o texto da atividade, a transcrição de um áudio ou a descrição de imagens. Use um título que explique o assunto."],
  };
  const form = porId("ped-form");
  const titulo = porId("ped-titulo");
  const data = porId("ped-data");
  const grupo = porId("ped-grupo");
  const conteudo = porId("ped-conteudo");
  const url = porId("ped-url");
  const concluido = porId("ped-concluido");
  const filtro = porId("ped-filtro");
  const busca = porId("ped-busca");
  const lista = porId("ped-lista");
  const total = porId("ped-total");
  const arquivo = porId("ped-arquivo");
  const dataLegivel = (valor) => valor.split("-").reverse().join("/");
  const semAcento = (valor) => valor.toLocaleLowerCase("pt-BR").normalize("NFD").replace(/\p{M}/gu, "");
  const dataValida = (valor) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false;
    const parsed = new Date(valor + "T00:00:00Z");
    return Number.isFinite(+parsed) && parsed.toISOString().slice(0, 10) === valor;
  };
  const urlValida = (valor) => {
    try {
      const endereco = new URL(valor);
      return endereco.protocol === "https:" && !endereco.username && !endereco.password;
    } catch { return false; }
  };

  function validar(registro) {
    return registro && Object.hasOwn(tipos, registro.tipo)
      && typeof registro.id === "string" && /^[\w-]{1,60}$/.test(registro.id)
      && typeof registro.titulo === "string" && registro.titulo.trim() && registro.titulo.length <= 120
      && typeof registro.conteudo === "string" && registro.conteudo.trim() && registro.conteudo.length <= 12000
      && typeof registro.grupo === "string" && registro.grupo.length <= 80
      && (registro.data ? dataValida(registro.data) : registro.tipo !== "agenda")
      && (registro.url === "" || (typeof registro.url === "string" && registro.url.length <= 2048
        && registro.tipo === "material" && urlValida(registro.url)))
      && Number.isSafeInteger(registro.atualizado) && typeof registro.concluido === "boolean";
  }

  const anteriores = ler(chave);
  let registros = Array.isArray(anteriores) ? anteriores.filter(validar) : [];
  let editando;
  let origem;
  let alterado = false;

  function salvarLista(novos) {
    if (!gravar(chave, novos)) {
      avisar("O navegador não conseguiu guardar os registros. Confira o espaço disponível.", "erro");
      return false;
    }
    registros = novos;
    mostrar();
    return true;
  }

  function botao(rotulo, nome, acao) {
    const controle = document.createElement("button");
    controle.type = "button";
    controle.textContent = rotulo;
    controle.setAttribute("aria-label", nome);
    controle.addEventListener("click", acao);
    return controle;
  }

  async function confirmarFechamento() {
    if (!alterado) return true;
    return perguntar("Descartar mudanças?", "O registro aberto tem alterações pendentes.", [
      {rotulo: "Continuar editando", valor: false, principal: true, sair: true},
      {rotulo: "Descartar alterações", valor: true},
    ]);
  }

  async function abrir(tipo, registro, acionador) {
    if (!(await confirmarFechamento())) return;
    origem = acionador;
    editando = registro || {id: crypto.randomUUID(), tipo};
    alterado = false;
    form.reset();
    for (const campo of form.querySelectorAll("[aria-invalid]")) campo.removeAttribute("aria-invalid");
    titulo.value = registro?.titulo || "";
    data.value = registro?.data || "";
    grupo.value = registro?.grupo || "";
    conteudo.value = registro?.conteudo || "";
    url.value = registro?.url || "";
    concluido.checked = Boolean(registro?.concluido);
    data.required = tipo === "agenda";
    data.labels[0].textContent = tipo === "agenda" ? "Data (obrigatória, AAAA-MM-DD)" : "Data (opcional, AAAA-MM-DD)";
    porId("ped-concluido-campo").hidden = tipo !== "agenda";
    porId("ped-url-campo").hidden = tipo !== "material";
    porId("ped-dica").textContent = tipos[tipo][1];
    porId("ped-editor").textContent = registro ? "Editar: " + tipos[tipo][0] : tipos[tipo][0];
    form.hidden = false;
    porId("ped-editor").focus();
  }

  function fechar(foco) {
    form.hidden = true;
    editando = null;
    alterado = false;
    (foco?.isConnected ? foco : porId("ped-registros")).focus();
  }

  function erro(campo, mensagem) {
    campo.setAttribute("aria-invalid", "true");
    campo.focus();
    avisar(mensagem, "erro");
  }

  form.noValidate = true;
  form.addEventListener("input", (evento) => {
    alterado = true;
    evento.target.removeAttribute("aria-invalid");
  });
  form.addEventListener("submit", (evento) => {
    evento.preventDefault();
    if (!editando) return;
    const {id, tipo} = editando;
    const registro = {id, tipo, titulo: titulo.value.trim(), data: data.value.trim(),
      grupo: grupo.value.trim(), conteudo: conteudo.value.trim(), url: url.value.trim(),
      concluido: concluido.checked, atualizado: Date.now()};
    if (!registro.titulo) return erro(titulo, "Preencha o título.");
    if ((registro.data || tipo === "agenda") && !dataValida(registro.data)) {
      return erro(data, "Informe uma data válida no formato ano, mês e dia. Por exemplo, 2026-11-25.");
    }
    if (!registro.conteudo) return erro(conteudo, "Preencha o conteúdo.");
    if (registro.url && !urlValida(registro.url)) return erro(url, "Informe um link válido que comece com https://.");
    if (!validar(registro)) return avisar("Revise o tamanho dos campos do registro.", "erro");
    if (salvarLista([...registros.filter((item) => item.id !== id), registro])) {
      filtro.value = tipo;
      busca.value = "";
      mostrar();
      fechar(document.getElementById("registro-" + id));
      avisar(tipos[tipo][0] + " salvo: " + registro.titulo + ".");
    }
  });
  porId("ped-cancelar").onclick = async () => {
    if (await confirmarFechamento()) fechar(origem);
  };
  for (const acionador of document.querySelectorAll("[data-novo-registro]")) {
    acionador.onclick = () => abrir(acionador.dataset.novoRegistro, null, acionador);
  }

  function linhas(registro) {
    return [tipos[registro.tipo][0], registro.titulo,
      registro.data && "Data: " + dataLegivel(registro.data),
      registro.grupo && "Turma ou código: " + registro.grupo,
      registro.tipo === "agenda" && (registro.concluido ? "Concluído" : "Pendente"),
      registro.conteudo, registro.url].filter(Boolean);
  }

  function mostrar() {
    const termo = semAcento(busca.value.trim());
    const encontrados = registros.filter((item) => (!filtro.value || filtro.value === item.tipo)
      && semAcento([item.titulo, item.grupo, item.conteudo].join(" ")).includes(termo));
    encontrados.sort((a, b) => filtro.value === "agenda"
      ? Number(a.concluido) - Number(b.concluido) || a.data.localeCompare(b.data) || a.titulo.localeCompare(b.titulo, "pt-BR")
      : b.atualizado - a.atualizado);
    lista.replaceChildren();
    total.textContent = encontrados.length === 1 ? "1 registro encontrado." : encontrados.length + " registros encontrados.";
    for (const item of encontrados) {
      const li = document.createElement("li");
      const h = document.createElement("h4");
      h.textContent = item.titulo;
      h.id = "registro-" + item.id;
      h.tabIndex = -1;
      const meta = document.createElement("p");
      meta.textContent = [
        tipos[item.tipo][0],
        item.data && dataLegivel(item.data),
        item.grupo && "Turma ou código: " + item.grupo,
        item.tipo === "agenda" && (item.concluido ? "Concluído" : "Pendente"),
      ].filter(Boolean).join(" · ");
      const detalhes = document.createElement("details");
      const resumo = document.createElement("summary");
      resumo.textContent = "Ler conteúdo";
      resumo.setAttribute("aria-label", "Ler conteúdo de " + item.titulo);
      const texto = document.createElement("p");
      texto.className = "ped-texto";
      texto.textContent = item.conteudo;
      detalhes.append(resumo, texto);
      if (item.url) {
        const link = document.createElement("a");
        link.href = item.url;
        link.textContent = "Abrir material: " + item.titulo;
        detalhes.append(link);
      }
      const acoes = document.createElement("div");
      acoes.className = "botoes";
      if (falar()) acoes.append(botao("Ouvir", "Ouvir " + item.titulo, () => falar(linhas(item))));
      acoes.append(
        botao("Editar", "Editar " + item.titulo, (ev) => abrir(item.tipo, item, ev.currentTarget)),
        botao("Baixar texto", "Baixar texto de " + item.titulo, async () => {
          try {
            await entregar("registro-pedagogico.txt", new Blob([linhas(item).join("\n\n")], {type:"text/plain;charset=utf-8"}));
            avisar("Download do registro iniciado.");
          } catch { avisar("Não foi possível baixar o registro.", "erro"); }
        }),
        botao("Remover", "Remover " + item.titulo, async () => {
          if (editando?.id === item.id) { avisar("Feche a edição desse registro antes de removê-lo.", "erro"); return; }
          const ok = await perguntar("Remover registro", "Remover " + item.titulo + " deste navegador?", [
            {rotulo: "Manter registro", valor: false, principal: true, sair: true},
            {rotulo: "Remover registro", valor: true},
          ]);
          if (ok && salvarLista(registros.filter((registro) => registro.id !== item.id))) {
            porId("ped-registros").focus();
            avisar("Registro removido.");
          }
        }),
      );
      li.append(h, meta, detalhes, acoes);
      lista.append(li);
    }
  }

  filtro.onchange = mostrar;
  let espera;
  busca.oninput = () => { clearTimeout(espera); espera = setTimeout(mostrar, 220); };
  porId("ped-exportar").onclick = async () => {
    if (!registros.length) { avisar("Ainda não há registros para copiar.", "erro"); return; }
    try {
      const json = JSON.stringify({tipo: "registros-pedagogicos", versao: 1, registros}, null, 2);
      await entregar("copia-registros-pedagogicos.json", new Blob([json], {type: "application/json"}));
      avisar("Download da cópia dos registros iniciado.");
    } catch { avisar("Não foi possível baixar a cópia dos registros.", "erro"); }
  };
  porId("ped-importar").onclick = () => { arquivo.value = ""; arquivo.click(); };
  arquivo.onchange = async () => {
    const selecionado = arquivo.files[0];
    if (!selecionado) return;
    try {
      if (selecionado.size > 10_000_000) throw new Error("cópia acima do limite");
      const dados = JSON.parse(await selecionado.text());
      if (dados?.tipo !== "registros-pedagogicos" || dados.versao !== 1
          || !Array.isArray(dados.registros) || !dados.registros.length || !dados.registros.every(validar)) {
        throw new Error("cópia inválida");
      }
      const ok = await perguntar("Restaurar registros", `A cópia tem ${dados.registros.length} registro(s). Quando houver duas versões do mesmo registro, fica a mais recente.`, [
        {rotulo: "Restaurar registros", valor: true, principal: true},
        {rotulo: "Cancelar restauração", valor: false, sair: true},
      ]);
      if (!ok) return;
      const unidos = new Map(registros.map((item) => [item.id, item]));
      for (const item of dados.registros) {
        if (!unidos.has(item.id) || unidos.get(item.id).atualizado < item.atualizado) unidos.set(item.id, item);
      }
      if (salvarLista([...unidos.values()])) avisar("Registros restaurados.");
    } catch { avisar("A cópia precisa ser um JSON válido dos registros pedagógicos de até 10 MB.", "erro"); }
  };
  document.addEventListener("portal-voz-disponivel", mostrar);
  mostrar();
};
