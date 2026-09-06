# @coffeemail/node

SDK oficial do **CoffeeMail** para Node.js e TypeScript.

Oferece suporte fortemente tipado, ergonômico e completo a 100% dos recursos da API de Produto do CoffeeMail, com localização nativa em **Português do Brasil** e suporte a **ESM e CommonJS**.

---

## 📦 Instalação

```bash
# via pnpm
pnpm add @coffeemail/node

# via npm
npm install @coffeemail/node

# via yarn
yarn add @coffeemail/node
```

---

## 🚀 Início Rápido (Quickstart)

```typescript
import { CoffeeMail } from '@coffeemail/node';

// 1. Inicialize o cliente com a sua API Key (ou defina COFFEEMAIL_API_KEY no ambiente)
const coffeemail = new CoffeeMail('cm_live_sua_chave_aqui', {
  locale: 'pt-BR', // 'pt-BR' (padrão) ou 'en'
});

// 2. Envie um e-mail transacional
const { data, error } = await coffeemail.emails.send({
  from: 'contato@seudominio.com.br',
  to: ['cliente@gmail.com'],
  subject: 'Confirmação do Pedido #123',
  html: '<h1>Obrigado pela sua compra!</h1><p>Seu pedido está em processamento.</p>',
});

if (error) {
  console.error(`Erro ao enviar [${error.code}]:`, error.message);
} else {
  console.log('E-mail enviado com sucesso! ID:', data.id);
}
```

---

## 🛡️ Retorno Seguro `{ data, error }`

Assim como bibliotecas modernas (ex: Supabase e Resend), o SDK do CoffeeMail retorna um objeto com `data` e `error`. Isso evita a necessidade obrigatória de blocos `try/catch` para capturar falhas esperadas da API:

```typescript
const { data, error } = await coffeemail.emails.get('eml_123');

if (error) {
  // Erro fortemente tipado (ValidationError, NotFoundError, RateLimitError, etc.)
  console.error(error.status, error.message);
  return;
}

console.log(data.status); // 'delivered', 'bounced', etc.
```

---

## 📚 Recursos Disponíveis

### 1. E-mails (`coffeemail.emails`)

* **`send(payload)`**: Envia um e-mail transacional único.
* **`sendBatch(items)`**: Envia múltiplos e-mails em lote.
* **`get(id)`**: Consulta detalhes e status de um e-mail.
* **`list(query)`**: Lista o histórico com paginação e filtros.
* **`getEvents(id)`**: Linha do tempo de entrega (timeline de eventos).
* **`cancel(id)`**: Cancela o envio de um e-mail agendado (`scheduled`).
* **`resend(id)`**: Reenvia uma mensagem existente.

### 2. Domínios (`coffeemail.domains`)

* **`create({ name })`**: Registra um novo domínio e gera registros DNS (SPF, DKIM, DMARC).
* **`list()`**: Lista os domínios cadastrados na organização.
* **`get(id)`**: Retorna as entradas DNS para configuração no seu provedor de nomes.
* **`verify(id)`**: Dispara a validação ativa dos registros DNS nos servidores globais.
* **`delete(id)`**: Remove o domínio.
* **`getHealth(id)`**: Diagnóstico de reputação e entregabilidade.

### 3. Webhooks (`coffeemail.webhooks`)

* **`create(payload)`**: Registra um novo endpoint para escutar eventos.
* **`list()`**: Lista endpoints configurados.
* **`delete(id)`**: Remove um webhook.
* **`verifySignature(options)`**: Método utilitário local para validar assinaturas criptográficas **HMAC SHA-256** no seu próprio backend, prevenindo ataques de temporização e requisições forjadas:

```typescript
import { Webhooks } from '@coffeemail/node';

// Em uma rota Fastify / Express / Next.js API Route:
const isValid = Webhooks.verifySignature({
  payload: req.rawBody,
  signature: req.headers['x-coffeemail-signature'],
  secret: 'whsec_seu_segredo',
});
```

### 4. Templates, Audiências e Campanhas

* **`coffeemail.templates`**: Criação, listagem e pré-visualização de modelos com variáveis dinâmicas.
* **`coffeemail.audiences`**: Gestão de listas de contatos segmentadas.
* **`coffeemail.audiences.contacts`**: Criação e remoção de contatos por audiência.
* **`coffeemail.broadcasts`**: Criação e disparo de campanhas em massa com headers RFC 8058.
* **`coffeemail.suppressions`**: Consulta e gerenciamento de lista de supressão (bounces e descadastros).
* **`coffeemail.stats`**: Visão geral de métricas e taxas de entrega (`deliveryRate`, `bounceRate`).

---

## 🌐 Internacionalização e Idiomas

Ao instanciar com `locale: 'pt-BR'`, o SDK:
1. Envia automaticamente `Accept-Language: pt-BR` para a API, recebendo mensagens de validação traduzidas.
2. Emite mensagens de erro locais e timeouts em Português do Brasil.
3. Disponibiliza documentação **TSDoc** em português com exemplos de código diretamente no autocompletar da sua IDE.

---

## 📄 Licença

Software proprietário da **CoffeeMail**. O uso é permitido somente a clientes
autorizados da plataforma, conforme termos comerciais. Consulte `LICENSE` na
raiz deste pacote para os termos completos ou entre em contato com
<licensing@coffeemail.com>.
