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
  const [trabalhoSelecionado, setTrabalhoSelecionado] = useState(null);
  const [trabalhoEmEdicao, setTrabalhoEmEdicao] = useState(null);

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
      return true;
    } catch (error) {
      alert(error.response?.data?.error || "Não foi possível salvar o trabalho.");
      return false;
    }
  };

  const handleSalvarEdicao = async (trabalhoAtualizado) => {
    try {
      const { data } = await api.put(`/api/trabalhos/${trabalhoEmEdicao.id}`, trabalhoAtualizado);
      setDados((atuais) => atuais.map((trabalho) => (
        trabalho.id === data.id ? data : trabalho
      )));
      setTrabalhoEmEdicao(null);
      alert("Trabalho atualizado com sucesso!");
      return true;
    } catch (error) {
      alert(error.response?.data?.error || "Não foi possível atualizar o trabalho.");
      return false;
    }
  };

  const handleExcluirTrabalho = async (trabalho) => {
    if (!window.confirm(`Deseja realmente excluir o trabalho de ${trabalho.local}?`)) return;

    try {
      await api.delete(`/api/trabalhos/${trabalho.id}`);
      setDados((atuais) => atuais.filter((item) => item.id !== trabalho.id));
      if (trabalhoSelecionado?.id === trabalho.id) setTrabalhoSelecionado(null);
      if (trabalhoEmEdicao?.id === trabalho.id) setTrabalhoEmEdicao(null);
      alert("Trabalho excluído com sucesso!");
    } catch (error) {
      alert(error.response?.data?.error || "Não foi possível excluir o trabalho.");
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
          <Table
            dados={filtrosDados}
            total={total}
            onVisualizar={setTrabalhoSelecionado}
            onEditar={setTrabalhoEmEdicao}
            onExcluir={handleExcluirTrabalho}
          />
          {trabalhoEmEdicao && (
            <section className="edit-section">
              <FormCadastro
                key={trabalhoEmEdicao.id}
                trabalho={trabalhoEmEdicao}
                onSalvar={handleSalvarEdicao}
                onCancelar={() => setTrabalhoEmEdicao(null)}
              />
            </section>
          )}
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

      {trabalhoSelecionado && (
        <div className="detail-backdrop" onClick={() => setTrabalhoSelecionado(null)}>
          <section
            className="detail-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="detail-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="detail-heading">
              <h2 id="detail-title">Detalhes do trampo</h2>
              <button type="button" aria-label="Fechar detalhes" onClick={() => setTrabalhoSelecionado(null)}>×</button>
            </div>
            <dl className="detail-list">
              <div><dt>Data</dt><dd>{new Date(`${trabalhoSelecionado.data}T00:00:00`).toLocaleDateString("pt-BR")}</dd></div>
              <div><dt>Local</dt><dd>{trabalhoSelecionado.local}</dd></div>
              <div><dt>Técnico</dt><dd>{trabalhoSelecionado.tecnico}</dd></div>
              <div><dt>Consumação</dt><dd>R$ {trabalhoSelecionado.consumacao.toFixed(2)}</dd></div>
              <div><dt>Cachê</dt><dd>R$ {trabalhoSelecionado.cache.toFixed(2)}</dd></div>
              <div><dt>Total</dt><dd>R$ {(trabalhoSelecionado.consumacao + trabalhoSelecionado.cache).toFixed(2)}</dd></div>
            </dl>
            <div className="detail-actions">
              <button type="button" onClick={() => {
                setTrabalhoEmEdicao(trabalhoSelecionado);
                setTrabalhoSelecionado(null);
              }}>Editar registro</button>
              <button type="button" className="delete-action" onClick={() => handleExcluirTrabalho(trabalhoSelecionado)}>
                Excluir registro
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default Dashboard;