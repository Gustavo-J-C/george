# Aura — Plataforma de Gestão Educacional Gamificada

Sistema web para professores gerenciarem o engajamento de alunos por meio de um sistema de pontos chamado **Aura**. Professores atribuem ou removem pontos com base no comportamento dos alunos; os alunos sobem ou descem no ranking da turma.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 16 (App Router) |
| Linguagem | TypeScript 5 |
| Estilo | Tailwind CSS 4 |
| Banco de dados | SQLite via Prisma 5 |
| Autenticação | JWT (`jose`) em cookie httpOnly |
| Runtime | Node.js |

---

## Pré-requisitos

- Node.js 18+
- npm 9+

---

## Instalação

```bash
# 1. Clonar o repositório
git clone https://github.com/Gustavo-J-C/george.git
cd george/aura

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp .env.example .env
# Edite .env com suas configurações (veja seção abaixo)

# 4. Criar e migrar o banco de dados
npx prisma migrate dev

# 5. Popular com dados de exemplo
npm run seed

# 6. Iniciar o servidor de desenvolvimento
npm run dev
```

Acesse `http://localhost:3000`.

---

## Variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="sua-chave-secreta-aqui"
```

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | Caminho para o arquivo SQLite |
| `JWT_SECRET` | Segredo para assinar os tokens JWT (use uma string longa e aleatória em produção) |

---

## Usuários de exemplo (seed)

Após rodar `npm run seed`:

| Usuário | Papel | Senha |
|---|---|---|
| `admin` | Administrador | *(sem senha — MVP)* |
| `prof.carlos` | Professor | *(sem senha — MVP)* |
| `aluno.001` … `aluno.014` | Aluno | *(sem senha — MVP)* |

> O login é feito apenas com o nome de usuário (sem senha) no MVP.

---

## Estrutura de pastas

```
aura/
├── prisma/
│   ├── schema.prisma       # Modelos do banco de dados
│   └── seed.ts             # Dados iniciais
├── src/
│   ├── app/
│   │   ├── (dashboard)/    # Páginas autenticadas
│   │   │   ├── home/       # Dashboard principal
│   │   │   ├── students/   # Lista de alunos + modal de Aura
│   │   │   ├── ranking/    # Ranking gamificado
│   │   │   └── admin/      # Gestão de escolas, turmas e usuários
│   │   ├── login/          # Tela de login
│   │   └── api/            # Rotas da API REST
│   ├── components/
│   │   ├── AuraModal.tsx   # Modal de gerenciamento de Aura
│   │   ├── Sidebar.tsx     # Navegação lateral responsiva
│   │   ├── Skeleton.tsx    # Componentes de loading skeleton
│   │   └── Toast.tsx       # Notificações toast
│   ├── lib/
│   │   ├── auth.ts         # JWT: signToken, verifyToken, getSession
│   │   └── prisma.ts       # Singleton do Prisma Client
│   └── proxy.ts            # Middleware de autenticação (Next.js 16)
└── .env                    # Variáveis de ambiente (não versionado)
```

---

## Modelo de dados

```
School (Escola)
  └── Class (Turma)
       └── User (Usuário) — papel: admin | professor | student
            └── AuraEvent (Evento de Aura)
                  delta: Int    (positivo = ganhou, negativo = perdeu)
                  reason: String
```

---

## API

Todas as rotas exigem sessão autenticada (cookie `aura_token`), exceto `/api/auth/login`.

| Método | Rota | Descrição | Roles |
|---|---|---|---|
| POST | `/api/auth/login` | Login por username | — |
| POST | `/api/auth/logout` | Logout | todos |
| GET | `/api/students` | Lista alunos (filtros: `classId`, `search`) | todos |
| GET | `/api/ranking` | Ranking por Aura (filtro: `classId`) | todos |
| GET/POST | `/api/aura` | Histórico / aplicar Aura | GET: todos · POST: professor+ |
| GET/POST | `/api/schools` | Lista / criar escola | admin |
| PUT/DELETE | `/api/schools/[id]` | Editar / deletar escola | admin |
| GET/POST | `/api/classes` | Lista / criar turma | admin+ |
| PUT/DELETE | `/api/classes/[id]` | Editar / deletar turma | admin+ |
| GET/POST | `/api/users` | Lista / criar usuário | admin |
| PUT/DELETE | `/api/users/[id]` | Editar / deletar usuário | admin |
| POST | `/api/users/import` | Importar alunos via CSV | admin |

### Formato do CSV de importação

```csv
fullName,username,role,classId
João Silva,joao.silva,student,<id-da-turma>
Maria Souza,maria.souza,student,<id-da-turma>
```

---

## Papéis e permissões

| Papel | Pode fazer |
|---|---|
| `student` | Apenas visualizar (sem acesso ao painel) |
| `professor` | Aplicar/remover Aura, ver alunos e ranking |
| `admin` | Tudo acima + gerenciar escolas, turmas e usuários |

---

## Sistema de Aura (níveis)

| Pontuação | Nível |
|---|---|
| ≥ 50 | Lendário |
| 20 – 49 | Destaque |
| 0 – 19 | Regular |
| < 0 | Em risco |

---

## Scripts disponíveis

```bash
npm run dev      # Servidor de desenvolvimento (Turbopack)
npm run build    # Build de produção
npm run start    # Servidor de produção
npm run seed     # Popular banco com dados de exemplo
npm run lint     # Verificar erros de lint
```

---

## Deploy

1. Defina `DATABASE_URL` e `JWT_SECRET` nas variáveis de ambiente do servidor.
2. Execute `npx prisma migrate deploy` para aplicar as migrations.
3. Execute `npm run build && npm run start`.

> Para produção, considere substituir o SQLite por PostgreSQL ou MySQL atualizando o `provider` no `schema.prisma` e a `DATABASE_URL`.
