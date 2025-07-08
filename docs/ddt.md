# **Documento de Desenho Técnico (DDT): Orquestrador de Leitura**

#### 1\. Visão Geral da Arquitetura

A aplicação será construída sobre uma arquitetura hexagonal (ou de "Ports and Adapters"), promovendo um núcleo de lógica de negócio desacoplado de serviços externos e frameworks. O objetivo principal é a **extensibilidade** e **testabilidade**.

O núcleo da aplicação (`core`) não saberá se está lidando com o Medium, Pocket ou uma API de terceiros. Ele se comunicará através de **Interfaces (Contratos)**. A implementação específica para cada serviço (Medium, etc.) será um **"Adapter"** que implementa essa interface. A Injeção de Dependência será usada para fornecer a implementação correta em tempo de execução.

#### 2\. Princípios de Design

* **SOLID:** A arquitetura seguirá os princípios SOLID.

  * **S (Single Responsibility):** Cada classe terá uma única responsabilidade (ex: uma classe para orquestrar o `export`, outra para implementar o provedor do Medium).
  * **O (Open/Closed):** O sistema será **aberto para extensão** (adicionar novos provedores como Pocket) mas **fechado para modificação** (não será necessário alterar o núcleo da aplicação para adicionar um provedor).
  * **L (Liskov Substitution):** Qualquer implementação de provedor (`MediumProvider`, `PocketProvider`) poderá ser substituída por outra sem quebrar o sistema.
  * **I (Interface Segregation):** Interfaces serão específicas para o que o cliente precisa.
  * **D (Dependency Inversion):** O núcleo da aplicação dependerá de abstrações (interfaces), não de implementações concretas.

* **Injeção de Dependência (DI):** Para desacoplar os componentes, as dependências (como serviços de provedor, logger, cliente de e-mail) serão "injetadas" nos construtores das classes, em vez de serem instanciadas dentro delas.

* **Padrão de Projeto: Strategy/Adapter:** Usaremos este padrão para os provedores. Teremos uma interface `IProvider` e cada serviço (Medium, Instapaper) será uma estratégia/adapter diferente que implementa essa interface.

#### 3\. Estrutura de Diretórios (Revisada para Extensibilidade)

```
.
├── src/
│   ├── core/                  # Lógica de negócio agnóstica
│   │   ├── use-cases/
│   │   │   ├── TagArticlesUseCase.ts
│   │   │   └── ExportArticlesUseCase.ts
│   │   └── entities/
│   │       └── Article.ts
│   ├── providers/             # Adapters para serviços externos
│   │   ├── IProvider.ts       # O CONTRATO PRINCIPAL
│   │   └── medium/
│   │       └── MediumProvider.ts  # Implementação para o Medium
│   │   └── pocket/
│   │       └── PocketProvider.ts  # Futura implementação
│   ├── services/              # Serviços de infraestrutura genéricos
│   │   ├── IEmailService.ts
│   │   ├── INlpService.ts     # Interface para o LLM (NLP)
│   │   ├── NlpService.ts
│   │   └── NodemailerEmailService.ts
│   ├── cli/                   # Lógica da linha de comando (Yargs)
│   │   ├── commands/
│   │   │   ├── TagCommand.ts
│   │   │   └── ExportCommand.ts
│   │   └── index.ts
│   └── container.ts           # Configuração do container de DI
├── ...
```

#### 4\. Definição de Interfaces (Contratos)

Este é o coração da arquitetura extensível.

```typescript
// src/providers/IProvider.ts

// Entidade de Artigo genérica
export interface IArticle {
  id: string;
  url: string;
  title: string;
  content?: string; // Conteúdo HTML ou Markdown
  tags?: string[];
}

// Contrato que todo provedor DEVE seguir
export interface IProvider {
  // Autentica no serviço
  login(): Promise<void>;

  // Retorna a lista de artigos salvos
  getReadingList(): Promise<IArticle[]>;

  // Retorna o conteúdo completo de um artigo específico
  getArticleContent(articleUrl: string): Promise<string>;

  // Remove um artigo da lista do serviço
  removeFromList(articleId: string): Promise<void>;
}
```

```typescript
// src/services/INlpService.ts

export interface INlpService {
  generateTags(text: string): Promise<string[]>;
  generateSummary(text: string): Promise<string>;
}
```

#### 5\. Diagrama de Classes Simplificado

* `ExportCommand` depende de `ExportArticlesUseCase`.
* `ExportArticlesUseCase` depende de `IProvider`, `INlpService` e `IEmailService` (injetados no construtor).
* `MediumProvider` implementa `IProvider`.
* O Container de DI (`container.ts`) é responsável por instanciar `MediumProvider` e injetá-lo no `ExportArticlesUseCase` quando o comando é executado com `--provider=medium`.

#### 6\. Injeção de Dependência (DI) na Prática

Para um projeto vitrine, você pode usar um container de DI como o **`tsyringe`** ou **`InversifyJS`**.

**Exemplo com `tsyringe`:**

```typescript
// src/core/use-cases/ExportArticlesUseCase.ts
import { injectable, inject } from "tsyringe";
import { IProvider } from "../../providers/IProvider";
import { INlpService } from "../../services/INlpService";

@injectable()
export class ExportArticlesUseCase {
  constructor(
    @inject("Provider") private provider: IProvider,
    @inject("NlpService") private nlpService: INlpService
  ) {}

  async execute(theme: string, count: number): Promise<void> {
    // 1. Pega artigos do provider (agora é genérico!)
    const articles = await this.provider.getReadingList();

    // ... toda a lógica de filtrar, processar, etc.
    // Usando this.nlpService.generateSummary() e assim por diante.
  }
}
```

No ponto de entrada da aplicação, você configuraria qual implementação concreta usar.

```typescript
// src/cli/index.ts
import "reflect-metadata";
import { container } from "tsyringe";
import { MediumProvider } from "../providers/medium/MediumProvider";
import { NlpService } from "../services/NlpService";

// Registra as implementações
container.register("Provider", { useClass: MediumProvider });
container.register("NlpService", { useClass: NlpService });

// Agora, quando você resolver um UseCase, ele virá com as dependências corretas
const exportUseCase = container.resolve(ExportArticlesUseCase);
```