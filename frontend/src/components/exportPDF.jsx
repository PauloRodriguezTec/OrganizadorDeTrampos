import api from "../services/api";
import "../styles/exportPDF.css";

function ExportPDF({ dados, filtros, total }) {
  const handleExportPDF = async () => {
    if (dados.length === 0) {
      alert("Nenhum dado para exportar!");
      return;
    }

    try {
      const response = await api.get("/api/trabalhos/exportar", {
        params: filtros,
        responseType: "blob"
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `relatorio_trampos_${new Date().toISOString().split("T")[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);

      alert("PDF exportado com sucesso!");
    } catch (error) {
      console.error("Erro ao exportar PDF:", error);
      alert("Erro ao exportar PDF. Verifique se o servidor está rodando.");
      handleExportLocal();
    }
  };

  const handleExportLocal = () => {
    const csv = gerarCSV();
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `relatorio_trampos_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    alert("Relatório exportado como CSV!");
  };

  const gerarCSV = () => {
    let csv = "Data,Local,Técnico,Consumação,Cache,Total\n";
    dados.forEach(d => {
      csv += `"${d.data}","${d.local}","${d.tecnico}",${d.consumacao.toFixed(2)},${d.cache.toFixed(2)},${(d.consumacao + d.cache).toFixed(2)}\n`;
    });
    csv += `\nTOTAL GERAL,,,,,R$ ${total.toFixed(2)}\n`;
    return csv;
  };

  return (
    <div className="export-container">
      <h3>📄 Exportar Dados</h3>

      <div className="export-info">
        <p><strong>Registros a exportar:</strong> {dados.length}</p>
        <p><strong>Total:</strong> R$ {total.toFixed(2)}</p>

        {Object.values(filtros).some(f => f) && (
          <div className="filtros-aplicados">
            <strong>Filtros aplicados:</strong>
            <ul>
              {filtros.tecnico && <li>Técnico: {filtros.tecnico}</li>}
              {filtros.local && <li>Local: {filtros.local}</li>}
              {filtros.dataInicio && <li>Data Início: {filtros.dataInicio}</li>}
              {filtros.dataFim && <li>Data Fim: {filtros.dataFim}</li>}
            </ul>
          </div>
        )}
      </div>

      <div className="export-buttons">
        <button className="btn-pdf" onClick={handleExportPDF}>
          📕 Exportar como PDF
        </button>
        <button className="btn-csv" onClick={handleExportLocal}>
          📊 Exportar como CSV
        </button>
      </div>

      <div className="export-preview">
        <h4>Prévia dos Dados</h4>
        <table className="preview-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Data</th>
              <th>Local</th>
              <th>Técnico</th>
              <th>Consumação</th>
              <th>Cache</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {dados.slice(0, 10).map((d, i) => (
              <tr key={d._id || d.id || i}>
                <td>{i + 1}</td>
                <td>{new Date(d.data).toLocaleDateString("pt-BR")}</td>
                <td>{d.local}</td>
                <td>{d.tecnico}</td>
                <td>R$ {d.consumacao.toFixed(2)}</td>
                <td>R$ {d.cache.toFixed(2)}</td>
                <td>R$ {(d.consumacao + d.cache).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {dados.length > 10 && <p>... e mais {dados.length - 10} registros</p>}
      </div>
    </div>
  );
}

export default ExportPDF;
