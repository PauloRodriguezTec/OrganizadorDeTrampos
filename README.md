# Organizador de Trâmpos

Aplicação full-stack para gerenciar e organizar trâmpos (trabalhos pontuais).

## 📁 Estrutura do Projeto

```
OrganizadorDeTrampos/
├── frontend/                  # Aplicação React com Vite
│   ├── src/
│   │   ├── components/        # Componentes reutilizáveis
│   │   ├── pages/             # Páginas/views da aplicação
│   │   ├── services/          # Serviços e chamadas de API
│   │   ├── styles/            # Estilos CSS
│   │   ├── assets/            # Imagens e arquivos estáticos
│   │   ├── app.jsx            # Componente raiz
│   │   └── main.jsx           # Entrada da aplicação
│   ├── index.html
│   ├── vite.config.js
│   ├── eslint.config.js
│   └── package.json
│
├── backend/                   # API Express.js
│   ├── src/
│   │   ├── database.js        # Persistência SQLite local
│   │   ├── routes/            # Rotas da API
│   │   ├── controllers/       # Lógica das rotas
│   │   └── middleware/        # Middleware customizado
│   ├── server.js              # Arquivo principal do servidor
│   ├── package.json
│   └── .gitignore
│
└── package.json               # Raiz (gerenciar monorepo)
```

## 🚀 Como Executar

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
npm install
npm run dev
```

O backend usa SQLite local, sem precisar instalar ou iniciar outro serviço. Na primeira execução, cria automaticamente `backend/data/organizador.sqlite` com as tabelas e uma chave de sessão persistente.

Requer Node.js 22.13 ou mais recente. Para escolher outro local para o arquivo, crie `backend/.env`:

```env
SQLITE_PATH=./data/organizador.sqlite
```

O frontend usa `http://localhost:5000` por padrão. Para outra URL, defina `VITE_API_URL` no ambiente do Vite.

## 📦 Dependências Principais

### Frontend
- React 19.2.8
- React Router DOM 7.18.3
- Axios 1.20.0
- Recharts 3.10.1 (gráficos)
- Vite 8.2.2

### Backend
- Express 5.2.1
- SQLite nativo do Node.js
- Axios 1.20.0
- CORS
- Body Parser
- PDFKit 0.20.2

## 📝 Convenções

- **Frontend**: Componentes em PascalCase, estilos CSS separados
- **Backend**: Controllers separados e persistência SQLite local
- **Padrão**: MVC (Model-View-Controller)

---

