import { useState } from "react";
import "../styles/formCadastro.css";

function FormCadastro({ onAdicionar }) {
  const [formData, setFormData] = useState({
    data: new Date().toISOString().split("T")[0],
    local: "",
    tecnico: "",
    consumacao: "",
    cache: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "consumacao" || name === "cache") {
      setFormData({
        ...formData,
        [name]: value === "" ? "" : Number(value)
      });
      return;
    }

    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.data || !formData.local || !formData.tecnico || formData.consumacao === "" || formData.cache === "") {
      alert("Por favor, preencha todos os campos!");
      return;
    }

    onAdicionar(formData);

    setFormData({
      data: new Date().toISOString().split("T")[0],
      local: "",
      tecnico: "",
      consumacao: "",
      cache: ""
    });
  };

  return (
    <div className="form-container">
      <h3>➕ Adicionar Novo Trâmpo</h3>
      <form onSubmit={handleSubmit} className="cadastro-form">
        <div className="form-group">
          <label htmlFor="data">Data:</label>
          <input
            id="data"
            type="date"
            name="data"
            value={formData.data}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="tecnico">Técnico:</label>
          <input
            id="tecnico"
            type="text"
            name="tecnico"
            value={formData.tecnico}
            onChange={handleChange}
            placeholder="Nome da pessoa técnica"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="local">Local:</label>
          <input
            id="local"
            type="text"
            name="local"
            value={formData.local}
            onChange={handleChange}
            placeholder="Nome do local"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="consumacao">Consumação (R$):</label>
          <input
            id="consumacao"
            type="number"
            name="consumacao"
            placeholder="0.00"
            step="0.01"
            min="0"
            value={formData.consumacao}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="cache">Cache (R$):</label>
          <input
            id="cache"
            type="number"
            name="cache"
            placeholder="0.00"
            step="0.01"
            min="0"
            value={formData.cache}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-submit">✅ Adicionar</button>
        </div>
      </form>
    </div>
  );
}

export default FormCadastro;
