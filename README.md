# CoffeeMail SDKs Monorepo

Monorepo oficial dos SDKs da plataforma **CoffeeMail**, gerenciado via **Turborepo** e **pnpm workspaces**.

Centraliza o desenvolvimento, compilação, testes, versionamento e publicação dos SDKs de integração com a API de Produto do CoffeeMail para diferentes linguagens e ecossistemas.

---

## 📦 Pacotes e SDKs

| Pacote                 | Linguagem / Plataforma | Diretório                                                                              | Status  | Versão npm                                                                                                          |
| :--------------------- | :--------------------- | :------------------------------------------------------------------------------------- | :------ | :------------------------------------------------------------------------------------------------------------------ |
| **`@coffeemail/node`** | Node.js & TypeScript   | [`packages/node`](file:///Users/joaoneto/Developer/SaaS/coffee-mail-sdk/packages/node) | Estável | [![npm version](https://img.shields.io/npm/v/@coffeemail/node.svg)](https://www.npmjs.com/package/@coffeemail/node) |

---

## 🏗️ Estrutura do Repositório

```text
coffee-mail-sdk/
├── packages/
│   └── node/              # SDK oficial para Node.js / TypeScript (@coffeemail/node)
│       ├── src/           # Recursos (emails, domains, webhooks, templates, etc.)
│       ├── package.json   # Metadados e versão do pacote Node
│       ├── README.md      # Documentação específica do SDK Node
│       └── tsup.config.ts # Bundler dual ESM / CJS
├── examples/              # Projetos de exemplo e guias práticos de uso
├── .github/workflows/     # Workflows de CI/CD para validação e publicação
├── pnpm-workspace.yaml    # Definição dos workspaces pnpm
├── turbo.json             # Pipeline de tarefas orquestrado pelo Turborepo
└── package.json           # Scripts globais do monorepo
```

---

## 🚀 Como Começar (Desenvolvimento)

### Pré-requisitos

- **Node.js** >= 20
- **pnpm** >= 9 (recomendado `pnpm@11.26.0`)

### Instalação

```bash
pnpm install
```

### Comandos Globais (Turborepo)

O Turborepo executa as tarefas em paralelo aproveitando cache local e ordenação topológica de dependências:

- **Build de todos os pacotes**:
  ```bash
  pnpm run build
  ```
- **Execução de testes em todos os pacotes**:
  ```bash
  pnpm run test
  ```
- **Checagem de tipos estrita (Typecheck)**:
  ```bash
  pnpm run typecheck
  ```
- **Formatação de código**:
  ```bash
  pnpm run format
  ```
- **Limpeza de artefatos de build**:
  ```bash
  pnpm run clean
  ```

---

## 🎯 Scripts Direcionados por Pacote

Para atuar diretamente em um pacote específico a partir da raiz:

- **Build do SDK Node**:
  ```bash
  pnpm run build:node
  ```
- **Publicação do SDK Node no npm**:
  ```bash
  pnpm run publish:node
  ```

---

## 🚢 Pipeline de Release e CI/CD

Cada SDK neste monorepo possui seu próprio ciclo de vida e versionamento semântico (`semver`):

1. Atualize a versão no `package.json` do pacote correspondente (ex: [`packages/node/package.json`](file:///Users/joaoneto/Developer/SaaS/coffee-mail-sdk/packages/node/package.json)).
2. Atualize o `package.json` da raiz para refletir o estado do repositório.
3. Commit e tag no formato `<pacote>-v<versao>` (ex: `node-v0.1.3`):
   ```bash
   git commit -am "chore(release): bump @coffeemail/node to 0.1.3"
   git push origin main
   git tag node-v0.1.3
   git push origin node-v0.1.3
   ```
4. O workflow do GitHub Actions em [`.github/workflows/publish.yml`](file:///Users/joaoneto/Developer/SaaS/coffee-mail-sdk/.github/workflows/publish.yml) valida lint, tipos, executa os testes unitários e publica o pacote com proveniência (`--provenance`) no **npm**.

---

## 📄 Licença

Software proprietário da **CoffeeMail**. Consulte [`LICENSE`](file:///Users/joaoneto/Developer/SaaS/coffee-mail-sdk/LICENSE) na raiz do repositório para os termos de uso.
