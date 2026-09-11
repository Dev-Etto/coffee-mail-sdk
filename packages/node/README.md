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
* **`get(id)` / `update(id, payload)`**: Consulta e atualiza um webhook.
* **`toggle(id, { status })`**: Ativa ou pausa um webhook.
* **`rotateSecret(id)`**: Gera um novo segredo de assinatura HMAC.
* **`listDeliveries(id, query)`**: Lista as tentativas de entrega de eventos.
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

* **`coffeemail.templates`**: Criação, atualização, listagem, remoção, pré-visualização (`preview`), formatação (`format`), renderização sanitizada (`testRender`) e templates iniciais prontos (`listStarters`/`getStarter`).
* **`coffeemail.audiences`**: Criação, atualização, listagem e remoção de audiências.
* **`coffeemail.audiences.contacts`**: Criação, atualização, listagem, remoção e inserção em lote (`bulkAdd`) de contatos por audiência.
* **`coffeemail.broadcasts`**: Criação e disparo de campanhas em massa com headers RFC 8058.
* **`coffeemail.suppressions`**: Criação, consulta, listagem, remoção e reativação (`reactivate`) de supressões (bounces, complaints e descadastros).
* **`coffeemail.stats`**: `get(query)` retorna totais do período (`totalSent`, `totalDelivered`, `totalBounced`, `totalFailed`) e uma série histórica agrupada por dia/semana/mês.

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
