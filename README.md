# Serviço de Tradução Distribuído

[Repositório GitHub](https://github.com/LuizPagliari/tradutor)

Este projeto implementa um serviço de tradução distribuído utilizando Node.js, arquitetura Domain-Driven Design (DDD), e integração com a Google Cloud Translation API. Ele é composto por dois serviços principais: uma API e um serviço worker, que se comunicam através de uma fila de mensagens (RabbitMQ) e persistem dados em um banco de dados PostgreSQL.

## Arquitetura

- **API (`translation-api`):** Responsável por receber requisições de tradução, gerenciar a fila de mensagens e fornecer endpoints para consulta de idiomas e status de traduções.
- **Worker (`translation-worker`):** Processa as requisições de tradução da fila de mensagens, interage com a Google Cloud Translation API para realizar as traduções e atualiza o status no banco de dados.
- **RabbitMQ:** Fila de mensagens utilizada para a comunicação assíncrona entre a API e o Worker.
- **PostgreSQL:** Banco de dados relacional para persistir informações sobre as requisições de tradução.
- **Google Cloud Translation API:** Serviço externo utilizado para realizar as traduções.

## Pré-requisitos

Para rodar esta aplicação, você precisará ter o Docker e o Docker Compose instalados em sua máquina.

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Configuração

### 1. Credenciais da Google Cloud Translation API

1.  **Crie uma Conta de Serviço no Google Cloud:**
    *   Vá para o [Console do Google Cloud](https://console.cloud.google.com/).
    *   Selecione o projeto que você está usando ou crie um novo.
    *   Navegue até **IAM e administrador** > **Contas de serviço**.
    *   Crie uma nova conta de serviço.
    *   **Importante:** Atribua a ela o papel `Usuário da API Cloud Translation` (Cloud Translation API User).
    *   Gere uma nova chave JSON para esta conta de serviço.

2.  **Salve o arquivo de credenciais:**
    *   Renomeie o arquivo JSON baixado para `google-credentials.json`.
    *   Coloque este arquivo dentro do diretório `packages/translation-worker/config/`.
    *   **Adicione `packages/translation-worker/config/google-credentials.json` ao seu `.gitignore`** para evitar que suas credenciais sejam versionadas.

### 2. Variáveis de Ambiente (`.env`)

Crie um arquivo `.env` em cada um dos seguintes diretórios com as variáveis de ambiente necessárias:

#### `packages/translation-api/.env`

```
PORT=3001
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=translation_service
RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672
TRANSLATION_EXCHANGE=translation_exchange
TRANSLATION_QUEUE=translation_queue
TRANSLATION_ROUTING_KEY=translation.request
GOOGLE_CLOUD_PROJECT=YOUR_GOOGLE_CLOUD_PROJECT_ID # Ex: sacola-f2d93
```

#### `packages/translation-worker/.env`

```
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=translation_service
RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672
TRANSLATION_EXCHANGE=translation_exchange
TRANSLATION_QUEUE=translation_queue
TRANSLATION_ROUTING_KEY=translation.request
GOOGLE_CLOUD_PROJECT=YOUR_GOOGLE_CLOUD_PROJECT_ID # Ex: sacola-f2d93
```
**Certifique-se de substituir `YOUR_GOOGLE_CLOUD_PROJECT_ID` pelo ID real do seu projeto Google Cloud.**

## Como Rodar a Aplicação

1.  **Navegue até a raiz do projeto:**
    ```bash
    cd /caminho/para/serviço-tradução
    ```

2.  **Limpe e construa os contêineres Docker:**
    É recomendável limpar quaisquer volumes e imagens antigas para garantir um ambiente fresco:
    ```bash
    docker-compose down -v --rmi all
    docker-compose up --build -d
    ```
    Este comando irá:
    *   Remover contêineres, volumes e imagens Docker anteriores.
    *   Construir as imagens Docker para a API e o Worker.
    *   Iniciar os contêineres para PostgreSQL, RabbitMQ, translation-api e translation-worker.

3.  **Verifique o status dos contêineres (opcional):**
    ```bash
    docker-compose ps
    ```
    Todos os serviços devem estar no status `Up` e `(healthy)` (se aplicável).

## Endpoints da API

A API estará disponível em `http://localhost:3001`.

-   **GET /api/languages**
    *   Retorna a lista de idiomas suportados pela Google Cloud Translation API.
    *   Exemplo de resposta:
        ```json
        [
            {
                "code": "en",
                "name": "English",
                "supportSource": true,
                "supportTarget": true
            },
            {
                "code": "es",
                "name": "Spanish",
                "supportSource": true,
                "supportTarget": true
            }
        ]
        ```

-   **POST /api/translations**
    *   Cria uma nova requisição de tradução e a envia para a fila.
    *   **Corpo da Requisição (JSON):**
        ```json
        {
            "originalText": "Hello World",
            "sourceLanguage": "en",
            "targetLanguage": "pt"
        }
        ```
    *   **Exemplo de Resposta (202 Accepted):**
        ```json
        {
            "requestId": "uuid-da-requisicao",
            "status": "processing"
        }
        ```

-   **GET /api/translations/{requestId}**
    *   Consulta o status e o resultado de uma requisição de tradução específica.
    *   **Exemplo de Resposta:**
        ```json
        {
            "id": "uuid-da-requisicao",
            "originalText": "Hello World",
            "translatedText": "Olá Mundo",
            "sourceLanguage": "en",
            "targetLanguage": "pt",
            "status": "completed",
            "error": null,
            "createdAt": "2023-01-01T10:00:00Z",
            "updatedAt": "2023-01-01T10:00:05Z"
        }
        ```
        Ou, em caso de erro:
        ```json
        {
            "id": "uuid-da-requisicao",
            "originalText": "Hello World",
            "translatedText": null,
            "sourceLanguage": "en",
            "targetLanguage": "pt",
            "status": "failed",
            "error": "Translation failed: [mensagem de erro]",
            "createdAt": "2023-01-01T10:00:00Z",
            "updatedAt": "2023-01-01T10:00:05Z"
        }
        ```

## Observações

-   **DDD:** A aplicação segue princípios de Domain-Driven Design, com domínios, repositórios e serviços bem definidos.
-   **TypeORM:** Utilizado para a persistência de dados no PostgreSQL, com esquemas definidos para as entidades.
-   **RabbitMQ:** Gerencia a comunicação assíncrona para processamento de traduções, garantindo escalabilidade e resiliência.