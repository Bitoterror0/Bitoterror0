window.iniciarScanner = function ({avisar, abrirNoLeitor, falar, parar}) {
  const $ = (id) => document.getElementById("scanner-" + id);
  const video = $("video");
  const modo = $("modo");
  const status = $("status");
  const texto = $("texto");
  const resultado = $("resultado");
  const link = $("link");
  const abrir = $("abrir");
  const fechar = $("fechar");
  const capturar = $("capturar");
  const processar = $("processar");
  const ouvir = $("ouvir");
  const exemplos = {
    qr: "data:image/png;base64,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",
    ocr: "data:image/png;base64,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",
  };
  let stream, timer, camera = 0, ocupado = false, leitor, falando = false;
  const scripts = new Map();

  function carregar(url, integridade, global) {
    if (window[global]) return Promise.resolve(window[global]);
    if (!scripts.has(url)) {
      const promessa = new Promise((resolve, reject) => {
        const s = document.createElement("script");
        s.src = url;
        s.integrity = integridade;
        s.crossOrigin = "anonymous";
        s.onload = () => window[global] ? resolve(window[global]) : reject(new Error("biblioteca indisponível"));
        s.onerror = () => { s.remove(); reject(new Error("falha ao carregar biblioteca")); };
        document.head.append(s);
      }).catch((e) => { scripts.delete(url); throw e; });
      scripts.set(url, promessa);
    }
    return scripts.get(url);
  }

  const qr = () => carregar("https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js", "sha384-b5Ya4Bq3qCyz39m2ISh+4DxjAIljdeFwK/BsXLuj9gugaNwAcj/ia15fxNZL9Nlx", "jsQR");
  const ocr = () => carregar("https://cdn.jsdelivr.net/npm/tesseract.js@6.0.1/dist/tesseract.min.js", "sha384-r1ru3tcf6FhnCFR4B7pIFG+BhFF9LlFtz/P1y4pblWn3AGs9y3lBx5SKLNf4+rED", "Tesseract");

  function desligar() {
    camera++;
    clearTimeout(timer);
    stream?.getTracks().forEach((track) => track.stop());
    stream = undefined;
    video.srcObject = null;
    video.hidden = true;
    fechar.hidden = true;
    capturar.hidden = true;
    abrir.disabled = ocupado;
  }

  function canvasImagem(imagem, largura, altura, limite) {
    if (!largura || !altura) throw new Error("imagem vazia");
    const escala = Math.min(1, limite / Math.max(largura, altura));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(largura * escala));
    canvas.height = Math.max(1, Math.round(altura * escala));
    const contexto = canvas.getContext("2d", {willReadFrequently: true});
    contexto.fillStyle = "#fff";
    contexto.fillRect(0, 0, canvas.width, canvas.height);
    contexto.drawImage(imagem, 0, 0, canvas.width, canvas.height);
    return canvas;
  }

  function decodificar(canvas, biblioteca) {
    const pixels = canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height);
    return biblioteca(pixels.data, pixels.width, pixels.height, {inversionAttempts: "attemptBoth"})?.data || "";
  }

  function mostrarLink() {
    link.hidden = true;
    link.removeAttribute("href");
    if (resultado.dataset.tipo !== "qr") return;
    try {
      const url = new URL(texto.value.trim());
      if (!["https:", "http:"].includes(url.protocol) || url.username || url.password) return;
      link.href = url.href;
      link.textContent = "Abrir endereço do QR Code: " + url.hostname;
      link.hidden = false;
    } catch {}
  }

  function mostrar(valor, tipo) {
    resultado.dataset.tipo = tipo;
    texto.value = valor;
    $("resultado-dica").textContent = tipo === "qr"
      ? "Confira o conteúdo e o endereço antes de abrir. O portal só abre o endereço se você escolher o link."
      : "Revise a leitura antes de usar o texto. O reconhecimento pode trocar letras, números ou a ordem das linhas.";
    resultado.hidden = false;
    mostrarLink();
    $("titulo").focus();
    status.textContent = tipo === "qr" ? "QR Code lido. O resultado está disponível." : "Texto reconhecido. O resultado está disponível para revisão.";
  }
  texto.oninput = mostrarLink;

  async function reconhecer(canvas) {
    const Tesseract = await ocr();
    if (!leitor) {
      leitor = Tesseract.createWorker("por", 1, {
        workerPath: "https://cdn.jsdelivr.net/npm/tesseract.js@6.0.1/dist/worker.min.js",
        corePath: "https://cdn.jsdelivr.net/npm/tesseract.js-core@6.0.0",
        langPath: "https://cdn.jsdelivr.net/npm/@tesseract.js-data/por@1.0.0/4.0.0_best_int",
      }).catch((erro) => { leitor = undefined; throw erro; });
    }
    const worker = await leitor;
    const {data} = await worker.recognize(canvas);
    return data.text.trim();
  }

  async function ler(tarefa, tipo) {
    if (ocupado) return;
    ocupado = true;
    if (falando) parar();
    resultado.hidden = true;
    desligar();
    const controles = [abrir, processar, modo, $("exemplo-qr"), $("exemplo-ocr")];
    const origem = document.activeElement;
    controles.forEach((controle) => { controle.disabled = true; });
    status.textContent = tipo === "qr" ? "Procurando o QR Code na imagem." : "Reconhecendo o texto. A primeira leitura pode demorar.";
    try {
      const canvas = await tarefa();
      const valor = tipo === "qr" ? decodificar(canvas, await qr()) : await reconhecer(canvas);
      if (valor) mostrar(valor, tipo);
      else status.textContent = tipo === "qr"
        ? "Nenhum QR Code encontrado. Tente incluir o código inteiro, com luz uniforme e sem reflexo."
        : "Nenhum texto reconhecido. Tente uma foto mais nítida e com a página inteira.";
    } catch {
      status.textContent = "Não foi possível ler a imagem. Confira o formato e a conexão com a internet e tente novamente.";
    } finally {
      ocupado = false;
      controles.forEach((controle) => { controle.disabled = false; });
      if (resultado.hidden && (document.activeElement === document.body || document.activeElement === origem)) {
        (origem?.hidden ? abrir : origem)?.focus();
      }
    }
  }

  modo.onchange = () => {
    desligar();
    resultado.hidden = true;
    $("dica").textContent = modo.value === "qr"
      ? "Para QR Code, a câmera procura automaticamente. Aponte para o código inteiro e aproxime ou afaste devagar. Um aviso informa quando o código for lido."
      : "Para texto impresso, coloque a folha em uma superfície plana e bem iluminada. Segure o celular acima da folha, paralelo a ela, e acione Capturar foto e reconhecer texto. Você também pode usar uma foto já tirada.";
    status.textContent = "Modo selecionado: " + modo.selectedOptions[0].textContent + ".";
  };

  abrir.onclick = async () => {
    if (ocupado || abrir.disabled) return;
    if (!navigator.mediaDevices?.getUserMedia) {
      status.textContent = "A câmera ao vivo está indisponível neste navegador. Use Escolher imagem ou tirar foto pelo celular.";
      $("foto").focus();
      return;
    }
    const atual = ++camera;
    const tipo = modo.value;
    abrir.disabled = true;
    fechar.hidden = false;
    status.textContent = "Aguardando permissão para usar a câmera.";
    try {
      const fonte = await navigator.mediaDevices.getUserMedia({video: {facingMode: {ideal: "environment"}}, audio: false});
      if (atual !== camera) { fonte.getTracks().forEach((track) => track.stop()); return; }
      stream = fonte;
      video.srcObject = fonte;
      video.hidden = false;
      await video.play();
      if (atual !== camera) return;
      capturar.hidden = tipo !== "ocr";
      (tipo === "ocr" ? capturar : fechar).focus();
      status.textContent = tipo === "qr" ? "Câmera ligada. Aponte para o QR Code." : "Câmera ligada. Posicione a folha e acione Capturar foto e reconhecer texto.";
      if (tipo !== "qr") return;
      const biblioteca = await qr();
      const buscar = () => {
        if (atual !== camera) return;
        try {
          const valor = video.videoWidth && decodificar(canvasImagem(video, video.videoWidth, video.videoHeight, 1000), biblioteca);
          if (valor) { desligar(); mostrar(valor, "qr"); return; }
          timer = setTimeout(buscar, 300);
        } catch {
          desligar();
          status.textContent = "A leitura pela câmera foi interrompida. Tente selecionar uma foto.";
          $("foto").focus();
        }
      };
      buscar();
    } catch {
      if (atual !== camera) return;
      desligar();
      status.textContent = "Não foi possível iniciar a câmera. Confira a permissão ou escolha uma foto.";
      $("foto").focus();
    }
  };
  fechar.onclick = () => { desligar(); abrir.focus(); status.textContent = "Câmera desligada."; };
  capturar.onclick = () => {
    if (!stream || !video.videoWidth) { status.textContent = "Aguarde a câmera preparar a imagem."; return; }
    let canvas;
    try { canvas = canvasImagem(video, video.videoWidth, video.videoHeight, 2600); }
    catch { status.textContent = "Não foi possível capturar a foto. Tente de novo."; return; }
    ler(() => canvas, "ocr");
  };
  processar.onclick = () => {
    const foto = $("foto").files[0];
    if (!foto || foto.size > 10_000_000) {
      status.textContent = foto ? "A imagem excede o limite de 10 MB." : "Escolha uma imagem antes de iniciar a leitura.";
      $("foto").focus();
      return;
    }
    const tipo = modo.value;
    ler(async () => {
      const url = URL.createObjectURL(foto);
      try { return await carregarImagem(url, tipo); }
      finally { URL.revokeObjectURL(url); }
    }, tipo);
  };
  async function carregarImagem(url, tipo) {
    const imagem = new Image();
    imagem.src = url;
    await imagem.decode();
    return canvasImagem(imagem, imagem.naturalWidth, imagem.naturalHeight, tipo === "qr" ? 1600 : 2600);
  }
  for (const tipo of ["qr", "ocr"]) {
    $("exemplo-" + tipo).onclick = () => {
      if (ocupado) return;
      modo.value = tipo;
      modo.onchange();
      ler(() => carregarImagem(exemplos[tipo], tipo), tipo);
    };
  }
  ouvir.onclick = async () => {
    if (falando) { parar(); return; }
    const partes = texto.value.trim().match(/[\s\S]{1,220}(?:\s|$)|[\s\S]{1,220}/g);
    if (!partes) { texto.focus(); status.textContent = "O conteúdo está vazio."; return; }
    falando = true;
    ouvir.textContent = "Parar leitura do resultado";
    try {
      if (await falar(partes) === false) avisar("A voz está indisponível. O resultado está no campo Conteúdo reconhecido.", "erro");
    } finally {
      falando = false;
      ouvir.textContent = "Ouvir resultado";
    }
  };
  $("enviar").onclick = () => {
    if (!texto.value.trim()) { texto.focus(); status.textContent = "O conteúdo está vazio."; return; }
    abrirNoLeitor(resultado.dataset.tipo === "qr" ? "Conteúdo do QR Code" : "Texto da imagem", texto.value);
  };
  window.addEventListener("pagehide", desligar);
};
