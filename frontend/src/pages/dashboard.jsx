import { useState, useEffect } from "react";
import { calcularTotais, filtrarCompleto } from "../services/dataService";
import api from "../services/api";
import Table from "../components/table";
import Chart from "../components/chart";
import Filters from "../components/filters";
import FormCadastro from "../components/formCadastro";
import ExportPDF from "../components/exportPDF";
import "../styles/dashboard.css";

function Dashboard({ usuario, onSair }) {
  const [dados, setDados] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [abaSelecionada, setAbaSelecionada] = useState("tabela");
  const [filtros, setFiltros] = useState({ tecnico: "", local: "", dataInicio: "", dataFim: "" });

  const filtrosDados = filtrarCompleto(filtros, dados);
  const total = calcularTotais(filtrosDados);

  useEffect(() => {
    api.get("/api/trabalhos")
      .then(({ data }) => setDados(data))
      .catch(() => setErro("Não foi possível carregar seus trabalhos."))
      .finally(() => setCarregando(false));
  }, []);

  const handleFiltrar = (novosFiltros) => {
    setFiltros(novosFiltros);
  };

  const handleLimparFiltros = () => {
    setFiltros({ tecnico: "", local: "", dataInicio: "", dataFim: "" });
  };

  const handleAdicionarTrabalho = async (novoTrabalho) => {
    try {
      const { data } = await api.post("/api/trabalhos", novoTrabalho);
      setDados((atuais) => [data, ...atuais]);
      alert("Trabalho adicionado com sucesso!");
    } catch (error) {
      alert(error.response?.data?.error || "Não foi possível salvar o trabalho.");
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="dashboard-heading">
          <div>
            <h1>🏢 Sistema de Gerenciamento de Trâmpos</h1>
            <p>Olá, {usuario.nome}</p>
          </div>
          <button type="button" className="logout-button" onClick={onSair}>Sair</button>
        </div>
        <p className="total-info">Total Geral: <strong>R$ {total.toFixed(2)}</strong></p>
      </header>

      {erro && <p role="alert" className="dashboard-error">{erro}</p>}
      {carregando && <p className="dashboard-loading">Carregando seus trabalhos...</p>}

      <nav className="tabs">
        <button 
          className={`tab ${abaSelecionada === "tabela" ? "ativo" : ""}`}
          onClick={() => setAbaSelecionada("tabela")}
        >
          📊 Tabela
        </button>
        <button 
          className={`tab ${abaSelecionada === "graficos" ? "ativo" : ""}`}
          onClick={() => setAbaSelecionada("graficos")}
        >
          📈 Gráficos
        </button>
        <button 
          className={`tab ${abaSelecionada === "adicionar" ? "ativo" : ""}`}
          onClick={() => setAbaSelecionada("adicionar")}
        >
          ➕ Adicionar Trabalho
        </button>
        <button 
          className={`tab ${abaSelecionada === "exportar" ? "ativo" : ""}`}
          onClick={() => setAbaSelecionada("exportar")}
        >
          📄 Exportar PDF
        </button>
      </nav>

      {abaSelecionada === "tabela" && (
        <section className="aba-content">
          <Filters dados={dados} onFiltrar={handleFiltrar} onLimpar={handleLimparFiltros} />
          <Table dados={filtrosDados} total={total} />
        </section>
      )}

      {abaSelecionada === "graficos" && (
        <section className="aba-content">
          <Filters dados={dados} onFiltrar={handleFiltrar} onLimpar={handleLimparFiltros} />
          <Chart dados={filtrosDados} total={total} />
        </section>
      )}

      {abaSelecionada === "adicionar" && (
        <section className="aba-content">
          <FormCadastro onAdicionar={handleAdicionarTrabalho} />
        </section>
      )}

      {abaSelecionada === "exportar" && (
        <section className="aba-content">
          <ExportPDF dados={filtrosDados} filtros={filtros} total={total} />
        </section>
      )}
    </div>
  );
}

export default Dashboard;