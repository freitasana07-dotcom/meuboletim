// Dados brutos fictícios das disciplinas do 9º Ano
const dadosDisciplinas = [
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

// Função obrigatória para normalizar notas para a escala de 0 a 10
function normalizarNota(valor) {
  // Trata notas ausentes
  if (valor === null || valor === undefined || valor === "") {
    return null;
  }

  // Converte vírgula para ponto se for string
  if (typeof valor === "string") {
    valor = valor.replace(",", ".");
  }

  let numero = Number(valor);

  // Trata valores que não são números válidos
  if (isNaN(numero)) {
    return null;
  }

  // Se a nota estiver entre 0 e 10
  if (numero >= 0 && numero <= 10) {
    return numero;
  }

  // Se estiver entre 10 e 100, divide por 10 (ex: 82 vira 8.2)
  if (numero > 10 && numero <= 100) {
    return numero / 10;
  }

  // Se estiver fora dessas regras, ignora (inválido)
  return null;
}

// Função para formatar exibição da nota na tabela
function formatarExibicao(nota) {
  if (nota === null) return "—";
  return nota.toFixed(1).replace(".", ",");
}

// Inicialização do processamento do boletim
function renderizarBoletim() {
  const tabelaCorpo = document.getElementById("tabela-corpo");
  tabelaCorpo.innerHTML = "";

  let somaMediasGerais = 0;
  let qtdDisciplinasComMedia = 0;
  let totalFaltasGeral = 0;
  let totalBomDesempenho = 0;
  let totalAtencao = 0;

  // Percorre cada uma das 15 disciplinas
  dadosDisciplinas.forEach((item) => {
    // Normaliza notas dos 3 trimestres
    const n1 = normalizarNota(item.tri1);
    const n2 = normalizarNota(item.tri2);
    const n3 = normalizarNota(item.tri3);

    // Calcula a média somente com notas válidas
    const notasValidas = [n1, n2, n3].filter((n) => n !== null);
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

    // Soma as faltas da disciplina
    const somaFaltas = item.faltas.reduce((acc, curr) => acc + curr, 0);
    totalFaltasGeral += somaFaltas;

    // Cria a linha da tabela dinamicamente
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${item.disciplina}</strong></td>
      <td>${formatarExibicao(n1)}</td>
      <td>${formatarExibicao(n2)}</td>
      <td>${formatarExibicao(n3)}</td>
      <td><strong>${formatarExibicao(media)}</strong></td>
      <td>${somaFaltas}</td>
      <td class="${classeStatus}">${situacao}</td>
    `;
    tabelaCorpo.appendChild(tr);
  });

  // Atualiza os Cards de Resumo no topo da página
  const mediaGeralCalculada = qtdDisciplinasComMedia > 0 
    ? (somaMediasGerais / qtdDisciplinasComMedia).toFixed(1).replace(".", ",") 
    : "—";

  document.getElementById("card-media-valor").innerText = mediaGeralCalculada;
  document.getElementById("card-faltas-valor").innerText = totalFaltasGeral;
  document.getElementById("card-bom-valor").innerText = totalBomDesempenho;
  document.getElementById("card-atencao-valor").innerText = totalAtencao;

  /* 
    NOTA: O valor de frequência exibido no HTML (92%) é APENAS DEMONSTRATIVO/FICTÍCIO
    nesta primeira etapa do projeto e será tratado dinamicamente no futuro.
  */
}

// Executa a renderização ao carregar a página
renderizarBoletim();