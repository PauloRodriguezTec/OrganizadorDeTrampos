import "../styles/table.css";

function Table({ dados, total, onVisualizar, onEditar, onExcluir }) {
  const consumacaoTotal = dados.reduce((acc, d) => acc + d.consumacao, 0);
  const cacheTotal = dados.reduce((acc, d) => acc + d.cache, 0);

  return (
    <div className="table-container">
      <h3>📋 Registro de Trâmpos</h3>
      
      <div className="summary-cards">
        <div className="card">
          <span>Total Registros</span>
          <strong>{dados.length}</strong>
        </div>
        <div className="card">
          <span>Total Consumação</span>
          <strong>R$ {consumacaoTotal.toFixed(2)}</strong>
        </div>
        <div className="card">
          <span>Total Cache</span>
          <strong>R$ {cacheTotal.toFixed(2)}</strong>
        </div>
        <div className="card total">
          <span>Total Geral</span>
          <strong>R$ {total.toFixed(2)}</strong>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Data</th>
              <th>Local</th>
              <th>Técnico</th>
              <th>Consumação</th>
              <th>Cache</th>
              <th>Total</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {dados.map((d, i) => (
              <tr key={d._id || d.id || i}>
                <td>{i + 1}</td>
                <td>{new Date(d.data).toLocaleDateString("pt-BR")}</td>
                <td>{d.local}</td>
                <td><span className="badge">{d.tecnico}</span></td>
                <td>R$ {d.consumacao.toFixed(2)}</td>
                <td>R$ {d.cache.toFixed(2)}</td>
                <td className="total">R$ {(d.consumacao + d.cache).toFixed(2)}</td>
                <td className="row-actions">
                  <button type="button" onClick={() => onVisualizar(d)}>Detalhes</button>
                  <button type="button" onClick={() => onEditar(d)}>Editar</button>
                  <button type="button" className="delete-action" onClick={() => onExcluir(d)}>Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {dados.length === 0 && (
        <div className="no-data">
          <p>ℹ️ Nenhum registro encontrado com os filtros aplicados.</p>
        </div>
      )}
    </div>
  );
}

export default Table;