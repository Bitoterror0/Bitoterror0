(() => {
  "use strict";

  const maxBytes = 10_000_000;
  const maxXmlBytes = 2_000_000;
  const xml = (value) => String(value ?? "").replace(/[<>&"']/g, (c) =>
    ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" })[c]);
  const declaration = '<?xml version="1.0" encoding="UTF-8"?>';
  const zip = () => new window.JSZip();
  const blob = (data, type) => new Blob([data], { type });

  async function xlsx(headers, rows) {
    const book = zip();
    const sheetNs = "http://schemas.openxmlformats.org/spreadsheetml/2006/main";
    const officeNs = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";
    const packageNs = "http://schemas.openxmlformats.org/package/2006/relationships";
    book.file("[Content_Types].xml", declaration +
      '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
      '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
      '<Default Extension="xml" ContentType="application/xml"/>' +
      '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' +
      '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>');
    book.file("_rels/.rels", declaration + `<Relationships xmlns="${packageNs}"><Relationship Id="rId1" Type="${officeNs}/officeDocument" Target="xl/workbook.xml"/></Relationships>`);
    book.file("xl/workbook.xml", declaration + `<workbook xmlns="${sheetNs}" xmlns:r="${officeNs}"><sheets><sheet name="Fichas" sheetId="1" r:id="rId1"/></sheets></workbook>`);
    book.file("xl/_rels/workbook.xml.rels", declaration + `<Relationships xmlns="${packageNs}"><Relationship Id="rId1" Type="${officeNs}/worksheet" Target="worksheets/sheet1.xml"/></Relationships>`);
    const cells = [headers, ...rows].map((row, i) =>
      `<row r="${i + 1}">${row.map((value, j) =>
        `<c r="${String.fromCharCode(65 + j)}${i + 1}" t="inlineStr"><is><t xml:space="preserve">${xml(value)}</t></is></c>`).join("")}</row>`);
    book.file("xl/worksheets/sheet1.xml", declaration + `<worksheet xmlns="${sheetNs}"><cols><col min="1" max="${headers.length}" width="26" customWidth="1"/></cols><sheetData>${cells.join("")}</sheetData></worksheet>`);
    return book.generateAsync({type: "blob", mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", compression: "DEFLATE"});
  }

  async function odt(headers, rows) {
    const mime = "application/vnd.oasis.opendocument.text";
    const doc = zip();
    doc.file("mimetype", mime, {compression: "STORE"});
    doc.file("META-INF/manifest.xml", declaration +
      '<manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0" manifest:version="1.2">' +
      `<manifest:file-entry manifest:full-path="/" manifest:media-type="${mime}"/>` +
      '<manifest:file-entry manifest:full-path="content.xml" manifest:media-type="text/xml"/></manifest:manifest>');
    const content = rows.map((row) => `<text:h text:outline-level="2">${xml(row[0])}</text:h>` +
      headers.slice(1).map((header, i) => `<text:p>${xml(header)}: ${xml(row[i + 1] || "—")}</text:p>`).join("")).join("");
    doc.file("content.xml", declaration +
      '<office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0" office:version="1.2">' +
      `<office:body><office:text><text:h text:outline-level="1">Fichas de Avaliação 2026</text:h>${content}</office:text></office:body></office:document-content>`);
    return doc.generateAsync({type: "blob", mimeType: mime, compression: "DEFLATE"});
  }

  function csv(headers, rows) {
    const quoted = (value) => {
      const text = String(value);
      const safe = /^[\s\uFEFF]*[=+\-@]|^[\t\r\n]/u.test(text) ? "'" + text : text;
      return '"' + safe.replaceAll('"', '""') + '"';
    };
    return blob("\uFEFF" + [headers, ...rows].map((row) => row.map(quoted).join(";")).join("\r\n"), "text/csv;charset=utf-8");
  }

  const plain = (headers, rows) => blob("Fichas de Avaliação 2026\r\n\r\n" + rows.map((row) =>
    headers.map((header, i) => `${header}: ${row[i] || "—"}`).join("\r\n")).join("\r\n\r\n"), "text/plain;charset=utf-8");

  function html(headers, rows) {
    return '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Fichas de Avaliação 2026</title>' +
      '<style>body{font:1.1rem/1.5 system-ui;max-width:54rem;margin:2rem auto;padding:0 1rem}dt{font-weight:700}dd{margin:0 0 .6rem;white-space:pre-wrap}@media print{section+section{break-before:page}dt{break-after:avoid}}</style>' +
      '</head><body><main><h1>Fichas de Avaliação 2026</h1>' +
      rows.map((row) => `<section><h2>${xml(row[0])}</h2><dl>${headers.slice(1).map((header, i) =>
        `<dt>${xml(header)}</dt><dd>${xml(row[i + 1] || "—")}</dd>`).join("")}</dl></section>`).join("") +
      '</main></body></html>';
  }

  function imprimir(headers, rows) {
    const frame = document.createElement("iframe");
    frame.title = "Visualização para imprimir ou salvar em PDF";
    frame.style.cssText = "position:fixed;width:1px;height:1px;border:0;left:-100px";
    frame.addEventListener("load", () => {
      const janela = frame.contentWindow;
      janela.addEventListener("afterprint", () => frame.remove(), {once: true});
      janela.focus();
      janela.print();
    }, {once: true});
    frame.srcdoc = html(headers, rows);
    document.body.append(frame);
  }

  let dbPromise;
  function abrirBanco() {
    if (!dbPromise) {
      dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open("fichas-avaliacao-2026-documentos", 1);
        request.onupgradeneeded = () => request.result.createObjectStore("documentos", {keyPath: "id"});
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      }).catch((error) => { dbPromise = undefined; throw error; });
    }
    return dbPromise;
  }

  async function documentos(mode, action) {
    const db = await abrirBanco();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction("documentos", mode);
      const request = action(transaction.objectStore("documentos"));
      transaction.oncomplete = () => resolve(request.result);
      transaction.onabort = () => reject(transaction.error);
      transaction.onerror = () => reject(transaction.error);
    });
  }

  const extension = (file) => file.name.split(".").at(-1).toLowerCase();
  const textos = new Set(["txt", "csv", "tsv", "md", "log"]);
  const compactados = {docx: "word/document.xml", odt: "content.xml"};
  const podeLer = (file) => textos.has(extension(file)) || Object.hasOwn(compactados, extension(file));

  async function lerTexto(file) {
    const ext = extension(file);
    if (textos.has(ext)) {
      const content = await file.text();
      if (content.includes("\0")) throw new Error("texto inválido");
      return content.trim();
    }
    const archive = await window.JSZip.loadAsync(new Uint8Array(await file.arrayBuffer()));
    const entry = archive.file(compactados[ext]);
    if (!entry || !Number.isSafeInteger(entry._data?.uncompressedSize) || entry._data.uncompressedSize > maxXmlBytes) throw new Error("documento inválido");
    const content = new DOMParser().parseFromString(await entry.async("string"), "application/xml");
    if (content.querySelector("parsererror")) throw new Error("XML inválido");
    if (ext === "odt") {
      const namespace = "urn:oasis:names:tc:opendocument:xmlns:text:1.0";
      return Array.from(content.getElementsByTagNameNS(namespace, "*"))
        .filter((part) => part.localName === "p" || part.localName === "h")
        .map((part) => part.textContent).join("\n").trim();
    }
    const namespace = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
    return Array.from(content.getElementsByTagNameNS(namespace, "p"), (p) =>
      Array.from(p.getElementsByTagNameNS(namespace, "t"), (part) => part.textContent).join(""),
    ).join("\n").trim();
  }

  window.FichasDocumentos = {
    maxBytes, xlsx, odt, csv, plain, imprimir, podeLer, lerTexto,
    html: (headers, rows) => blob(html(headers, rows), "text/html;charset=utf-8"),
    listar: () => documentos("readonly", (store) => store.getAll()),
    guardar: (file) => documentos("readwrite", (store) => store.add({id: crypto.randomUUID(), file})),
    excluir: (id) => documentos("readwrite", (store) => store.delete(id)),
  };
})();
