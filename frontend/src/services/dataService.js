export function filtrarPorTecnico(dados, nome) {
  return dados.filter((dado) => dado.tecnico.toLowerCase().includes(nome.toLowerCase()));
}

export function filtrarPorLocal(dados, local) {
  return dados.filter((dado) => dado.local.toLowerCase().includes(local.toLowerCase()));
}

export function filtrarPorData(dados, dataInicio, dataFim) {
  return dados.filter((dado) => dado.data >= dataInicio && dado.data <= dataFim);
}

export function filtrarCompleto(filtros, dados) {
  let resultado = [...dados];
  
  if (filtros.tecnico) {
    resultado = resultado.filter(d => d.tecnico.toLowerCase().includes(filtros.tecnico.toLowerCase()));
  }
  
  if (filtros.local) {
    resultado = resultado.filter(d => d.local.toLowerCase().includes(filtros.local.toLowerCase()));
  }
  
  if (filtros.dataInicio && filtros.dataFim) {
    resultado = resultado.filter(d => d.data >= filtros.dataInicio && d.data <= filtros.dataFim);
  }
  
  return resultado;
}

export function calcularTotais(dados = []) {
  return dados.reduce((total, dado) => total + dado.consumacao + dado.cache, 0);
}

export function calcularPorTecnico(dados = []) {
  return dados.reduce((acc, item) => {
    if (!acc[item.tecnico]) {
      acc[item.tecnico] = { tecnico: item.tecnico, total: 0, consumacao: 0, cache: 0, count: 0 };
    }
    acc[item.tecnico].total += item.consumacao + item.cache;
    acc[item.tecnico].consumacao += item.consumacao;
    acc[item.tecnico].cache += item.cache;
    acc[item.tecnico].count += 1;
    return acc;
  }, {});
}

export function calcularPorLocal(dados = []) {
  return dados.reduce((acc, item) => {
    if (!acc[item.local]) {
      acc[item.local] = { local: item.local, total: 0, consumacao: 0, cache: 0, count: 0 };
    }
    acc[item.local].total += item.consumacao + item.cache;
    acc[item.local].consumacao += item.consumacao;
    acc[item.local].cache += item.cache;
    acc[item.local].count += 1;
    return acc;
  }, {});
}

export function obterTecnicos(dados = []) {
  return [...new Set(dados.map((dado) => dado.tecnico))];
}

export function obterLocais(dados = []) {
  return [...new Set(dados.map((dado) => dado.local))];
}
