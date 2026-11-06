PASSO 3 — Copie o código abaixo usando o botão Copiar do bloco de código.

```javascript
// Configuração fixa do estudante (não pode ser alterada pela página)
const CONFIG_ALUNO = {
  turma: "9B",
  numeroChamada: 1,
  apiUrl: "https://boletim-api.profbt.com.br"
};

// Dados brutos fictícios padrão das disciplinas do 9º Ano
const dadosDisciplinasPadrao = [
  { disciplina: "Língua Portuguesa", tri1: 78, tri2: "8,2", tri3: 8.6, faltas: [2, 2, 1] },
  { disciplina: "Matemática", tri1: 55, tri2: "5,4", tri3: null, faltas: [3, 2, 2] },
  { disciplina: "Ciências", tri1: 84, tri2: 7.9, tri3: "8,3", faltas: [1, 1, 1] },
  { disciplina: "História", tri1: "7,1", tri2: 82, tri3: null, faltas: [1, 2, 1] },
  { disciplina: "Geografia", tri1: 69, tri2: "7,5", tri3: 7.8, faltas: [0, 1, 1] },
  { disciplina: "Língua Inglesa", tri1: 88, tri2: 8.4, tri3: null, faltas: [1, 0, 1] },
  { disciplina: "Arte", tri1: "9,2", tri2: 87, tri3: 9.0, faltas: [1, 1, 0] },
  { disciplina: "Educação Física", tri1: 96, tri2: "9,3", tri3: null, faltas: [0, 1, 0] },
  { disciplina: "Educação Digital", tri1: 91, tri2: 8.9, tri3: "9,4", faltas: [1, 1, 0] },
  { disciplina: "Educação Financeira", tri1: 76, tri2: "7,2", tri3: null, faltas: [1, 1, 1] },
  { disciplina: "Rec. Aprend. Matemática", tri1: 58, tri2: "5,9", tri3: 6.2, faltas: [2, 2, 1] },
  { disciplina: "Leitura Rec. Aprend. Lingua Portuguesa", tri1: 72, tri2: "7,6", tri3: null, faltas: [2, 1, 1] },
  { disciplina: "Pensamento Lógico", tri1: 49, tri2: 5.5, tri3: "5,8", faltas: [2, 2, 2] },
  { disciplina: "Literatura Arte e Movimento", tri1: "8,0", tri2: 84, tri3: null, faltas: [1, 1, 0] },
  { disciplina: "Práticas Experimentais", tri1: 64, tri2: "6,6", tri3: 7.0, faltas: [1, 1, 1] }
];

// Estado da sessão (permanecem somente na memória)
let pinSessao = "";
let dadosAtuais = [];
let modoEdicao = false;

// Instâncias dos Gráficos (Chart.js)
let graficoMedias = null;
let graficoEvolucao = null;
let graficoFaltas = null;

// Função obrigatória para normalizar notas antigas/locais (0 a 10)
function normalizarNota(valor) {
  if (valor === null || valor === undefined || valor === "") {
    return null;
  }

  if (typeof valor === "string") {
    valor = valor.replace(",", ".");
  }

  let numero = Number(valor);

  if (isNaN(numero)) {
    return null;
  }

  if (numero >= 0 && numero <= 10) {
    return numero;
  }

  if (numero > 10 && numero <= 100) {
    return numero / 10;
  }

  return null;
}

// Validação estrita para notas digitadas no modo de edição (apenas 0 a 10 ou vazio)
function validarNotaDigitada(texto) {
  if (texto === null || texto === undefined) return { valida: true, valor: null };
  const limpo = String(texto).trim().replace(",", ".");
  if (limpo === "") return { valida: true, valor: null };

  const num = Number(limpo);
  if (isNaN(num) || num < 0 || num > 10) {
    return { valida: false, valor: null };
  }
  return { valida: true, valor: num };
}

// Validação para faltas digitadas (números inteiros >= 0)
function validarFaltaDigitada(texto) {
  if (texto === null || texto === undefined) return { valida: false, valor: 0 };
  const limpo = String(texto).trim();
  if (limpo === "") return { valida: false, valor: 0 };

  const num = Number(limpo);
  if (isNaN(num) || !Number.isInteger(num) || num < 0) {
    return { valida: false, valor: 0 };
  }
  return { valida: true, valor: num };
}

// Formatação segura de exibição da nota
function formatarExibicao(nota) {
  if (nota === null || nota === undefined) return "—";
  return Number(nota).toFixed(1).replace(".", ",");
}

// Renderização principal da tabela e dos cards de resumo
function renderizarBoletim() {
  const tabelaCorpo = document.getElementById("tabela-corpo");
  tabelaCorpo.textContent = ""; // Limpeza segura

  let somaMediasGerais = 0;
  let qtdDisciplinasComMedia = 0;
  let totalFaltasGeral = 0;
  let totalBomDesempenho = 0;
  let totalAtencao = 0;

  dadosAtuais.forEach((item, index) => {
    // Trata array de faltas com segurança
    const faltasArray = Array.isArray(item.faltas) ? item.faltas : [0, 0, 0];
    const f1 = faltasArray[0] ?? 0;
    const f2 = faltasArray[1] ?? 0;
    const f3 = faltasArray[2] ?? 0;

    let n1, n2, n3;

    if (modoEdicao) {
      // No modo edição pega valores brutos
      n1 = item.tri1;
      n2 = item.tri2;
      n3 = item.tri3;
    } else {
      // No modo de visualização aplica normalização para exibir
      n1 = normalizarNota(item.tri1);
      n2 = normalizarNota(item.tri2);
      n3 = normalizarNota(item.tri3);
    }

    const notasValidas = [
      normalizarNota(item.tri1),
      normalizarNota(item.tri2),
      normalizarNota(item.tri3)
    ].filter((n) => n !== null);

    let media = null;
    let situacao = "Nota ainda não disponível";
    let classeStatus = "status-indisponivel";

    if (notasValidas.length > 0) {
      const soma = notasValidas.reduce((acc, curr) => acc + curr, 0);
      media = soma / notasValidas.length;
      somaMediasGerais += media;
      qtdDisciplinasComMedia++;

      if (media >= 6.0) {
        situacao = "Bom desempenho";
        classeStatus = "status-bom";
        totalBomDesempenho++;
      } else {
        situacao = "Atenção";
        classeStatus = "status-atencao";
        totalAtencao++;
      }
    }

    const somaFaltas = Number(f1) + Number(f2) + Number(f3);
    totalFaltasGeral += somaFaltas;

    const tr = document.createElement("tr");

    // Coluna Nome da Disciplina (DOM Seguro)
    const tdNome = document.createElement("td");
    const strongNome = document.createElement("strong");
    strongNome.textContent = item.disciplina || "";
    tdNome.appendChild(strongNome);
    tr.appendChild(tdNome);

    if (modoEdicao) {
      // Colunas Editáveis (Inputs)
      const criarInput = (val, tipo, campo, subIndice = null) => {
        const td = document.createElement("td");
        const input = document.createElement("input");
        input.type = "text";
        input.className = "input-edicao";
        input.value = val !== null && val !== undefined ? val : "";
        input.dataset.index = index;
        input.dataset.tipo = tipo;
        input.dataset.campo = campo;
        if (subIndice !== null) input.dataset.subIndice = subIndice;
        td.appendChild(input);
        return td;
      };

      tr.appendChild(criarInput(item.tri1, "nota", "tri1"));
      tr.appendChild(criarInput(item.tri2, "nota", "tri2"));
      tr.appendChild(criarInput(item.tri3, "nota", "tri3"));

      // Coluna Média (Apenas leitura durante a edição)
      const tdMedia = document.createElement("td");
      const strongMedia = document.createElement("strong");
      strongMedia.textContent = formatarExibicao(media);
      tdMedia.appendChild(strongMedia);
      tr.appendChild(tdMedia);

      // Faltas editáveis por trimestre (exibidas agrupadas para edição simples)
      const tdFaltasEdit = document.createElement("td");
      const inF1 = document.createElement("input");
      inF1.className = "input-edicao";
      inF1.value = f1;
      inF1.title = "Faltas 1º Tri";
      inF1.dataset.index = index;
      inF1.dataset.tipo = "falta";
      inF1.dataset.subIndice = 0;

      const inF2 = document.createElement("input");
      inF2.className = "input-edicao";
      inF2.value = f2;
      inF2.title = "Faltas 2º Tri";
      inF2.dataset.index = index;
      inF2.dataset.tipo = "falta";
      inF2.dataset.subIndice = 1;

      const inF3 = document.createElement("input");
      inF3.className = "input-edicao";
      inF3.value = f3;
      inF3.title = "Faltas 3º Tri";
      inF3.dataset.index = index;
      inF3.dataset.tipo = "falta";
      inF3.dataset.subIndice = 2;

      tdFaltasEdit.appendChild(inF1);
      tdFaltasEdit.appendChild(document.createTextNode(" "));
      tdFaltasEdit.appendChild(inF2);
      tdFaltasEdit.appendChild(document.createTextNode(" "));
      tdFaltasEdit.appendChild(inF3);
      tr.appendChild(tdFaltasEdit);

    } else {
      // Colunas de Visualização Padrão
      const tdN1 = document.createElement("td");
      tdN1.textContent = formatarExibicao(n1);
      tr.appendChild(tdN1);

      const tdN2 = document.createElement("td");
      tdN2.textContent = formatarExibicao(n2);
      tr.appendChild(tdN2);

      const tdN3 = document.createElement("td");
      tdN3.textContent = formatarExibicao(n3);
      tr.appendChild(tdN3);

      const tdMedia = document.createElement("td");
      const strongMedia = document.createElement("strong");
      strongMedia.textContent = formatarExibicao(media);
      tdMedia.appendChild(strongMedia);
      tr.appendChild(tdMedia);

      const tdFaltas = document.createElement("td");
      tdFaltas.textContent = String(somaFaltas);
      tr.appendChild(tdFaltas);
    }

    // Coluna Situação
    const tdSituacao = document.createElement("td");
    tdSituacao.className = classeStatus;
    tdSituacao.textContent = situacao;
    tr.appendChild(tdSituacao);

    tabelaCorpo.appendChild(tr);
  });

  // Atualização dos Cards de Resumo
  const mediaGeralCalculada = qtdDisciplinasComMedia > 0 
    ? (somaMediasGerais / qtdDisciplinasComMedia).toFixed(1).replace(".", ",") 
    : "—";

  document.getElementById("card-media-valor").textContent = mediaGeralCalculada;
  document.getElementById("card-faltas-valor").textContent = String(totalFaltasGeral);
  document.getElementById("card-bom-valor").textContent = String(totalBomDesempenho);
  document.getElementById("card-atencao-valor").textContent = String(totalAtencao);

  // Atualiza os gráficos do boletim após preencher a tabela e cards
  atualizarGraficos();
}

// -------------------------------------------------------------
// FUNÇÕES EXCLUSIVAS PARA RENDERIZAÇÃO DOS GRÁFICOS (SOMENTE LEITURA)
// -------------------------------------------------------------

function atualizarGraficoMedias() {
  const canvas = document.getElementById("graficoMediasDisciplinas");
  if (!canvas) return;

  if (graficoMedias) {
    graficoMedias.destroy();
  }

  const rotulos = [];
  const valoresMedias = [];

  dadosAtuais.forEach((item) => {
    rotulos.push(item.disciplina || "");
    const n1 = normalizarNota(item.tri1);
    const n2 = normalizarNota(item.tri2);
    const n3 = normalizarNota(item.tri3);

    const notasValidas = [n1, n2, n3].filter((n) => n !== null);
    if (notasValidas.length > 0) {
      const soma = notasValidas.reduce((acc, curr) => acc + curr, 0);
      valoresMedias.push(Number((soma / notasValidas.length).toFixed(1)));
    } else {
      valoresMedias.push(null);
    }
  });

  const ctx = canvas.getContext("2d");
  graficoMedias = new Chart(ctx, {
    type: "bar",
    data: {
      labels: rotulos,
      datasets: [
        {
          label: "Média",
          data: valoresMedias,
          backgroundColor: "#6c5ce7",
          borderRadius: 4
        }
      ]
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          min: 0,
          max: 10,
          ticks: { stepSize: 2 }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function (context) {
              const val = context.raw;
              if (val === null || val === undefined) return " Média: —";
              return ` Média: ${String(val).replace(".", ",")}`;
            }
          }
        }
      }
    }
  });
}

function atualizarGraficoEvolucao() {
  const canvas = document.getElementById("graficoEvolucaoTrimestres");
  if (!canvas) return;

  if (graficoEvolucao) {
    graficoEvolucao.destroy();
  }

  let somaT1 = 0, qtdT1 = 0;
  let somaT2 = 0, qtdT2 = 0;
  let somaT3 = 0, qtdT3 = 0;

  dadosAtuais.forEach((item) => {
    const n1 = normalizarNota(item.tri1);
    const n2 = normalizarNota(item.tri2);
    const n3 = normalizarNota(item.tri3);

    if (n1 !== null) { somaT1 += n1; qtdT1++; }
    if (n2 !== null) { somaT2 += n2; qtdT2++; }
    if (n3 !== null) { somaT3 += n3; qtdT3++; }
  });

  const m1 = qtdT1 > 0 ? Number((somaT1 / qtdT1).toFixed(1)) : null;
  const m2 = qtdT2 > 0 ? Number((somaT2 / qtdT2).toFixed(1)) : null;
  const m3 = qtdT3 > 0 ? Number((somaT3 / qtdT3).toFixed(1)) : null;

  const ctx = canvas.getContext("2d");
  graficoEvolucao = new Chart(ctx, {
    type: "line",
    data: {
      labels: ["1º Tri", "2º Tri", "3º Tri"],
      datasets: [
        {
          label: "Média Geral",
          data: [m1, m2, m3],
          borderColor: "#0984e3",
          backgroundColor: "rgba(9, 132, 227, 0.1)",
          borderWidth: 3,
          fill: true,
          tension: 0.2,
          pointRadius: 5,
          pointBackgroundColor: "#0984e3"
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          min: 0,
          max: 10,
          ticks: { stepSize: 2 }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function (context) {
              const val = context.raw;
              if (val === null || val === undefined) return " Média: —";
              return ` Média: ${String(val).replace(".", ",")}`;
            }
          }
        }
      }
    }
  });
}

function atualizarGraficoFaltas() {
  const canvas = document.getElementById("graficoFaltasTrimestres");
  if (!canvas) return;

  if (graficoFaltas) {
    graficoFaltas.destroy();
  }

  let totalF1 = 0;
  let totalF2 = 0;
  let totalF3 = 0;

  dadosAtuais.forEach((item) => {
    const faltasArray = Array.isArray(item.faltas) ? item.faltas : [0, 0, 0];
    totalF1 += Number(faltasArray[0] ?? 0);
    totalF2 += Number(faltasArray[1] ?? 0);
    totalF3 += Number(faltasArray[2] ?? 0);
  });

  // Cálculo interno do risco acumulado (Referência interna de 350 faltas)
  const totalAcumuladoFaltas = totalF1 + totalF2 + totalF3;
  const cardFaltas = document.getElementById("card-grafico-faltas");
  const estadoFaltas = document.getElementById("estadoFaltas");

  if (totalAcumuladoFaltas >= 350) {
    if (cardFaltas) cardFaltas.classList.add("card-perigo");
    if (estadoFaltas) estadoFaltas.classList.remove("oculto");
  } else {
    if (cardFaltas) cardFaltas.classList.remove("card-perigo");
    if (estadoFaltas) estadoFaltas.classList.add("oculto");
  }

  const ctx = canvas.getContext("2d");
  graficoFaltas = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["1º Tri", "2º Tri", "3º Tri"],
      datasets: [
        {
          label: "Faltas",
          data: [totalF1, totalF2, totalF3],
          backgroundColor: "#d63031",
          borderRadius: 4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: { precision: 0 }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function (context) {
              const val = context.raw ?? 0;
              return ` ${val} faltas`;
            }
          }
        }
      }
    }
  });
}

function atualizarGraficos() {
  atualizarGraficoMedias();
  atualizarGraficoEvolucao();
  atualizarGraficoFaltas();
}

// -------------------------------------------------------------
// EVENTOS E FLUXO PRINCIPAL DA APLICAÇÃO (NÚCLEO PROTEGIDO)
// -------------------------------------------------------------

// Evento de Login (Abrir Boletim)
document.getElementById("form-login").addEventListener("submit", async function (e) {
  e.preventDefault();
  const inputPin = document.getElementById("input-pin");
  const msgLogin = document.getElementById("mensagem-login");
  const pinDigitado = inputPin.value.trim();

  if (!pinDigitado) return;

  msgLogin.textContent = "Conectando...";
  msgLogin.className = "mensagem-status";

  try {
    const resposta = await fetch(`${CONFIG_ALUNO.apiUrl}/api/v1/boletins/abrir`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        turma: CONFIG_ALUNO.turma,
        numero_chamada: CONFIG_ALUNO.numeroChamada,
        pin: pinDigitado
      })
    });

    if (resposta.status === 401) {
      msgLogin.textContent = "Turma, chamada ou PIN inválidos.";
      msgLogin.className = "mensagem-status erro";
      return;
    }

    if (resposta.status === 429) {
      msgLogin.textContent = "Muitas tentativas. Aguarde um minuto e tente novamente.";
      msgLogin.className = "mensagem-status erro";
      return;
    }

    if (!resposta.ok) {
      msgLogin.textContent = "Não foi possível conectar ao servidor. Tente novamente.";
      msgLogin.className = "mensagem-status erro";
      return;
    }

    const resultado = await resposta.json();

    // Regra: DADOS DA API > DADOS LOCAIS
    if (resultado.dados && Array.isArray(resultado.dados.disciplinas)) {
      dadosAtuais = resultado.dados.disciplinas;
    } else {
      // Caso dados seja null (novo ou sem dados salvos), usa dados locais padrão
      dadosAtuais = JSON.parse(JSON.stringify(dadosDisciplinasPadrao));
    }

    // Guarda o PIN apenas na memória da sessão
    pinSessao = pinDigitado;
    inputPin.value = ""; // Limpa a caixa de texto do PIN por segurança

    // Exibe o conteúdo do boletim e oculta o formulário de login
    document.getElementById("area-login").classList.add("oculto");
    document.getElementById("conteudo-boletim").classList.remove("oculto");
    
    renderizarBoletim();

  } catch (erro) {
    msgLogin.textContent = "Não foi possível conectar ao servidor. Tente novamente.";
    msgLogin.className = "mensagem-status erro";
  }
});

// Alternar Modo Edição
document.getElementById("btn-alternar-edicao").addEventListener("click", function () {
  modoEdicao = !modoEdicao;
  const btnSalvar = document.getElementById("btn-salvar");
  const msgSalvar = document.getElementById("mensagem-salvar");
  msgSalvar.textContent = "";

  if (modoEdicao) {
    this.textContent = "Cancelar edição";
    btnSalvar.classList.remove("oculto");
  } else {
    this.textContent = "Alterar dados";
    btnSalvar.classList.add("oculto");
  }
  renderizarBoletim();
});

// Evento de Salvar Alterações
document.getElementById("btn-salvar").addEventListener("click", async function () {
  const msgSalvar = document.getElementById("mensagem-salvar");
  msgSalvar.textContent = "";
  msgSalvar.className = "mensagem-status";

  let temErro = false;
  const novosDados = JSON.parse(JSON.stringify(dadosAtuais));

  // Seleciona todos os campos editáveis na tabela
  const inputs = document.querySelectorAll(".input-edicao");
  inputs.forEach((inEl) => inEl.classList.remove("invalido"));

  inputs.forEach((inEl) => {
    const idx = Number(inEl.dataset.index);
    const tipo = inEl.dataset.tipo;
    const val = inEl.value;

    if (tipo === "nota") {
      const campo = inEl.dataset.campo;
      const res = validarNotaDigitada(val);
      if (!res.valida) {
        inEl.classList.add("invalido");
        temErro = true;
      } else {
        novosDados[idx][campo] = res.valor;
      }
    } else if (tipo === "falta") {
      const subIdx = Number(inEl.dataset.subIndice);
      const res = validarFaltaDigitada(val);
      if (!res.valida) {
        inEl.classList.add("invalido");
        temErro = true;
      } else {
        if (!Array.isArray(novosDados[idx].faltas)) {
          novosDados[idx].faltas = [0, 0, 0];
        }
        novosDados[idx].faltas[subIdx] = res.valor;
      }
    }
  });

  if (temErro) {
    msgSalvar.textContent = "Corrija os campos destacados em vermelho antes de salvar.";
    msgSalvar.className = "mensagem-status erro";
    return;
  }

  msgSalvar.textContent = "Salvando...";

  try {
    const resposta = await fetch(`${CONFIG_ALUNO.apiUrl}/api/v1/boletins/salvar`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        turma: CONFIG_ALUNO.turma,
        numero_chamada: CONFIG_ALUNO.numeroChamada,
        pin: pinSessao,
        dados: {
          disciplinas: novosDados
        }
      })
    });

    if (!resposta.ok) {
      msgSalvar.textContent = "Erro ao salvar dados. Tente novamente.";
      msgSalvar.className = "mensagem-status erro";
      return;
    }

    // Atualiza estado e interface após sucesso
    dadosAtuais = novosDados;
    modoEdicao = false;
    document.getElementById("btn-alternar-edicao").textContent = "Alterar dados";
    document.getElementById("btn-salvar").classList.add("oculto");

    msgSalvar.textContent = "Dados salvos com sucesso.";
    msgSalvar.className = "mensagem-status sucesso";

    renderizarBoletim();

  } catch (erro) {
    msgSalvar.textContent = "Erro de conexão ao salvar. Tente novamente.";
    msgSalvar.className = "mensagem-status erro";
  }
});

```