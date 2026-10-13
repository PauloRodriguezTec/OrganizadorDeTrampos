import { useState } from "react";
import { obterTecnicos, obterLocais } from "../services/dataService";
import "../styles/filters.css";

function Filters({ dados, onFiltrar, onLimpar }) {
  const [tecnico, setTecnico] = useState("");
  const [local, setLocal] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  const tecnicos = obterTecnicos(dados);
  const locais = obterLocais(dados);

  const handleFiltrar = () => {
    onFiltrar({ tecnico, local, dataInicio, dataFim });
  };

  const handleLimpar = () => {
    setTecnico("");
    setLocal("");
    setDataInicio("");
    setDataFim("");
    onLimpar();
  };

  return (
    <div className="filters-container">
      <h3>🔍 Filtrar Dados</h3>
      <div className="filters-grid">
        <div className="filter-group">
          <label htmlFor="tecnico">Técnico:</label>
          <select 
            id="tecnico"
            value={tecnico}
            onChange={(e) => setTecnico(e.target.value)}
          >
            <option value="">Todos</option>
            {tecnicos.map((t, i) => (
              <option key={i} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="local">Local:</label>
          <select 
            id="local"
            value={local}
            onChange={(e) => setLocal(e.target.value)}
          >
            <option value="">Todos</option>
            {locais.map((l, i) => (
              <option key={i} value={l}>{l}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="dataInicio">Data Início:</label>
          <input 
            id="dataInicio"
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="dataFim">Data Fim:</label>
          <input 
            id="dataFim"
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
          />
        </div>
      </div>

      <div className="filter-buttons">
        <button className="btn-filtrar" onClick={handleFiltrar}>🔍 Filtrar</button>
        <button className="btn-limpar" onClick={handleLimpar}>🔄 Limpar Filtros</button>
      </div>
    </div>
  );
}

export default Filters;
