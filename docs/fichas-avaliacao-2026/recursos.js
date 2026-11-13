window.iniciarRecursos = function ({ avisar, entregar, falar, parar }) {
  const $ = (id) => document.getElementById(id);
  const titulo = $("leitor-titulo");
  const texto = $("leitor-texto");
  const ouvir = $("leitor-ouvir");
  const catalogo = [
    {tipo:"cotidiano", nome:"Seeing AI", traducao:"Inteligência artificial que enxerga", origem:"Estados Unidos · Microsoft", idioma:"Aplicativo disponível em português brasileiro.", descricao:"Usa a câmera para ajudar a ler textos e descrever o que está ao redor. Em uma atividade, experimente com embalagens ou materiais de demonstração.", url:"https://play.google.com/store/apps/details?hl=pt_BR&id=com.microsoft.seeingai", link:"Ver Seeing AI no Google Play"},
    {tipo:"cotidiano", nome:"Be My Eyes", traducao:"Seja meus olhos", origem:"Projeto internacional", idioma:"Site em português brasileiro. A ajuda de voluntários pode ser solicitada no idioma escolhido.", descricao:"Conecta a pessoa a voluntários por vídeo para tarefas visuais, como localizar um controle ou identificar um objeto.", url:"https://www.bemyeyes.com/?lang=pt-br", link:"Abrir site oficial do Be My Eyes"},
    {tipo:"livros", nome:"Dorinateca", origem:"Brasil · Fundação Dorina Nowill para Cegos", idioma:"Site em português brasileiro.", descricao:"Biblioteca digital e indicações de leitores de livros acessíveis. Consulte as condições de acesso e o formato disponível para o título.", url:"https://dorinateca.org.br/recursos-de-acessibilidade", link:"Abrir recursos de leitura da Dorinateca"},
    {tipo:"livros", nome:"Thorium Reader", traducao:"Leitor Thorium", origem:"França · EDRLab, com guia do Consórcio DAISY", idioma:"Guia indicado em inglês.", descricao:"Leitor para computador que abre EPUB, DAISY e PDF. O guia explica ajustes de contraste, tamanho do texto e leitura em voz alta.", url:"https://daisy.org/guidance/info-help/guidance-training/reading-systems/thorium-epub-reader-quick-start-guide/", link:"Abrir guia do Leitor Thorium, em inglês"},
    {tipo:"ensino", nome:"Teacher-created resource library", traducao:"Biblioteca de recursos criados por professores", origem:"Estados Unidos · Perkins School for the Blind", idioma:"Página e materiais de referência em inglês.", descricao:"Coleção de materiais de sala de aula para estudantes cegos e com baixa visão. Procure ideias de atividades e adapte os exemplos ao português brasileiro.", url:"https://www.perkins.org/paths-to-technology/teacher-created-resource-library/", link:"Abrir biblioteca de professores da Perkins, em inglês"},
    {tipo:"ensino", nome:"RNIB Personal Transcription Portal", traducao:"Portal de transcrição pessoal do RNIB", origem:"Reino Unido · RNIB", idioma:"Página em inglês. Use como referência para preparar materiais.", descricao:"Mostra como a instituição adapta materiais para braile, fonte ampliada e áudio. Combine com a turma o formato mais útil para cada atividade.", url:"https://personaltranscription.rnib.org.uk/Information/AboutService", link:"Abrir referência de transcrição do RNIB, em inglês"},
    {tipo:"ensino", nome:"Ace by DAISY", traducao:"Ace do Consórcio DAISY, verificador de EPUB", origem:"Consórcio internacional DAISY", idioma:"Documentação indicada em inglês.", descricao:"Ferramenta gratuita que aponta problemas de acessibilidade em livros EPUB. Depois da verificação, confira a ordem da leitura e as descrições com um leitor de tela.", url:"https://kb.daisy.org/publishing/docs/epub/validation/ace.html", link:"Abrir documentação do Ace by DAISY, em inglês"},
  ];
  const escape = (s) => s.replace(/[&<>]/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;"})[c]);
  let emLeitura = false;
  let versao = 0;

  function validarTexto() {
    if (texto.value.trim()) return true;
    texto.focus();
    avisar("Insira o texto do material primeiro.", "erro");
    return false;
  }

  async function ouvirPartes(partes, botao) {
    if (emLeitura && emLeitura === botao) { parar(); return; }
    if (emLeitura) parar();
    const atual = ++versao;
    const original = botao.textContent;
    const rotulo = botao.getAttribute("aria-label");
    emLeitura = botao;
    botao.textContent = "Parar leitura";
    if (rotulo) botao.setAttribute("aria-label", "Parar leitura do recurso");
    try {
      const resultado = await falar(partes);
      if (resultado === false) avisar("A leitura em voz alta está indisponível. O conteúdo está disponível por escrito.", "erro");
    } finally {
      botao.textContent = original;
      if (rotulo) botao.setAttribute("aria-label", rotulo);
      if (atual === versao) emLeitura = false;
    }
  }

  ouvir.onclick = () => {
    if (emLeitura === ouvir) { parar(); return; }
    if (!validarTexto()) return;
    const partes = texto.value.trim().match(/[\s\S]{1,220}(?:\s|$)|[\s\S]{1,220}/g);
    ouvirPartes([titulo.value.trim(), ...partes].filter(Boolean), ouvir);
  };

  async function baixar(formato) {
    if (!validarTexto()) return;
    const nome = titulo.value.trim() || "Material de aula";
    const conteudo = texto.value.trim();
    const html = '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>' +
      escape(nome) + '</title><style>body{font:1.15rem/1.6 system-ui;max-width:52rem;margin:2rem auto;padding:0 1rem;overflow-wrap:anywhere}p{white-space:pre-wrap}</style></head><body><main><h1>' +
      escape(nome) + '</h1>' + conteudo.split(/\n\s*\n/).map(p => '<p>' + escape(p) + '</p>').join("") + '</main></body></html>';
    try {
      await entregar("material-de-aula." + formato, new Blob([formato === "html" ? html : nome + "\n\n" + conteudo],
        {type: formato === "html" ? "text/html;charset=utf-8" : "text/plain;charset=utf-8"}));
      avisar("Download do material iniciado.");
    } catch { avisar("Não foi possível baixar o material.", "erro"); }
  }
  $("leitor-baixar-txt").onclick = () => baixar("txt");
  $("leitor-baixar-html").onclick = () => baixar("html");

  function mostrar() {
    const filtro = $("catalogo-filtro").value;
    const itens = catalogo.filter((item) => !filtro || item.tipo === filtro);
    $("catalogo-total").textContent = itens.length + (itens.length === 1 ? " referência encontrada." : " referências encontradas.");
    const lista = $("catalogo-lista");
    lista.replaceChildren();
    for (const item of itens) {
      const li = document.createElement("li");
      const h = document.createElement("h3");
      const original = document.createElement("span");
      original.textContent = item.nome;
      if (item.traducao) original.lang = "en";
      h.append(original);
      if (item.traducao) h.append(" — " + item.traducao);
      const meta = document.createElement("p");
      meta.className = "suave";
      meta.textContent = item.origem + ". " + item.idioma;
      const descricao = document.createElement("p");
      descricao.textContent = item.descricao;
      const link = document.createElement("a");
      link.href = item.url;
      link.textContent = item.link;
      const botao = document.createElement("button");
      botao.type = "button";
      botao.textContent = "Ouvir sobre o recurso";
      botao.setAttribute("aria-label", "Ouvir sobre " + (item.traducao || item.nome));
      botao.onclick = () => ouvirPartes([
        item.idioma,
        ...(item.traducao ? ["Nome original em inglês.", {text:item.nome, language:"en-US"}, item.traducao] : [item.nome]),
        item.descricao,
      ], botao);
      li.append(h, meta, descricao, link, botao);
      lista.append(li);
    }
  }
  $("catalogo-filtro").onchange = mostrar;
  mostrar();

  return function abrirDocumento(nome, conteudo) {
    titulo.value = nome.slice(0, titulo.maxLength);
    texto.value = conteudo.slice(0, texto.maxLength);
    $("t-leitor").focus();
    avisar(conteudo.length > texto.maxLength
      ? "O leitor recebeu os primeiros 24 mil caracteres. O arquivo original continua guardado."
      : "Documento aberto no leitor. Use Ouvir material ou escolha um formato para baixar.");
  };
};
