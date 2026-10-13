import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { calcularPorTecnico, calcularPorLocal } from "../services/dataService";
import "../styles/chart.css";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7c7c", "#8dd1e1", "#d084d0"];

function Chart({ dados }) {
  const porTecnico = Object.values(calcularPorTecnico(dados));
  const porLocal = Object.values(calcularPorLocal(dados));

  const dataConsumo = porTecnico.map(t => ({
    name: t.tecnico,
    consumacao: t.consumacao,
    cache: t.cache
  }));

  const dataTecnico = porTecnico.map(t => ({
    name: t.tecnico,
    value: t.total
  }));

  const dataLocal = porLocal.map(l => ({
    name: l.local,
    value: l.total
  }));

  return (
    <div className="charts-container">
      <h3>📊 Análise de Dados</h3>

      {/* Gráfico de Consumação por Técnico */}
      <div className="chart-box">
        <h4>Consumação vs Cache por Técnico</h4>
        {dados.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dataConsumo}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => `R$ ${value.toFixed(2)}`} />
              <Legend />
              <Bar dataKey="consumacao" fill="#8884d8" name="Consumação" />
              <Bar dataKey="cache" fill="#82ca9d" name="Cache" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p>Sem dados para exibir</p>
        )}
      </div>

      {/* Gráfico de Distribuição por Técnico (Pizza) */}
      <div className="chart-box">
        <h4>Distribuição Total por Técnico</h4>
        {dados.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dataTecnico}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: R$ ${value.toFixed(2)}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {dataTecnico.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `R$ ${value.toFixed(2)}`} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p>Sem dados para exibir</p>
        )}
      </div>

      {/* Gráfico de Distribuição por Local (Pizza) */}
      <div className="chart-box">
        <h4>Distribuição Total por Local</h4>
        {dados.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dataLocal}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: R$ ${value.toFixed(2)}`}
                outerRadius={100}
                fill="#82ca9d"
                dataKey="value"
              >
                {dataLocal.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `R$ ${value.toFixed(2)}`} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p>Sem dados para exibir</p>
        )}
      </div>

      {/* Resumo */}
      <div className="summary-section">
        <h4>📌 Resumo por Técnico</h4>
        <div className="summary-grid">
          {porTecnico.map((t, i) => (
            <div key={i} className="summary-card">
              <strong>{t.tecnico}</strong>
              <p>Trabalhos: {t.count}</p>
              <p>Consumação: R$ {t.consumacao.toFixed(2)}</p>
              <p>Cache: R$ {t.cache.toFixed(2)}</p>
              <p className="total-card">Total: R$ {t.total.toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Chart;