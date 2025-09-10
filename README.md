<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://raw.githubusercontent.com/Nyffi/mvg-game/refs/heads/main/public/bleize-dark.png" width="320" alt="Nest Logo" /></a>
</p>

Um jogo de **Blackjack (21)** feito com **Next.js**.  
O projeto possui tanto a interface do jogo quanto endpoints de API para lidar com lógica, saldo e compras dentro da aplicação.

---

## 🚀 Como rodar localmente

### Pré-requisitos

- Node.js >= 18
- npm, yarn, pnpm ou bun
- https://github.com/Nyffi/mvg-backend

### Passos

## Clone o repositório

git clone https://github.com/Nyffi/mvg-game.git
cd mvg-game

## Instale as dependências

```bash
npm install
```

### ou

```bash
yarn
```

### ou

```bash
pnpm install
```

### ou

```bash
bun install
```

# Configure as variáveis de ambiente

```bash
cp .env.example .env.local
```

# Rode o servidor de desenvolvimento

npm run dev

Acesse o app em http://localhost:3000

.

# ⚙️ Variáveis de Ambiente

Exemplo de arquivo .env.example:

```
# Chave usada para assinar/verificar JWTs
JWT_SECRET=changeme123

# URL de conexão com o banco de dados (se usado)
MONGODB_URI=mongodb+srv://...

# Seed usada para embaralhar as cartas
BLACKJACK_SEED=insira-seed-embaralho-blackjack

# Link para o servidor de autenticação
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Copie este arquivo para .env.local e ajuste os valores conforme sua configuração.

# 📡 Endpoints principais

A API do jogo está disponível em rotas /api/:

```
Endpoint	    Método	 Descrição
/api/game/start	    POST	 Inicia uma nova rodada de Blackjack
/api/game/hit	    POST	 Pede uma nova carta
/api/game/stand	    POST	 Finaliza a jogada do jogador, dealer joga
/api/game/check     GET          Verifica se já existe um jogo em andamento
/api/game/reward    POST         Credita o usuário com uma quantia de TKN
/api/balance	    GET	         Retorna saldo atual do jogador
/api/auth           POST         Salva o JWT nos cookies
/api/auth/logout    POST         Apaga o cookie de autenticação
```

    ⚠️ Os endpoints podem mudar conforme a evolução do projeto.
    Consulte o código em /app/api/ para a lista completa.

# 🔗 Integração entre sistemas

#### Frontend (Next.js App Router)

Responsável pela interface do jogo. Renderiza páginas e componentes interativos (cartas, botões de ações, resultado da partida).

#### Backend (Next.js API Routes)

Fornece os endpoints /api/\* que gerenciam lógica do jogo, saldo e produtos.
As chamadas são feitas diretamente pelo frontend via fetch.

#### MongoDB

Depois de configurado (MONGODB_URI), armazena:

- Usuários
- Histórico de partidas
- Saldo/creditação
- Nonce

#### Auth Server (Nest.js, [Nyffi/mvg-backend](https://github.com/Nyffi/mvg-game))

Responsável por autenticar o usuário via login social (Google) e gerar um token JWT.

# 🏗️ Decisões Técnicas de Arquitetura

#### Next.js App Router

Unifica frontend e backend no mesmo projeto.

#### API Routes

Escolhidas para simplificar a comunicação, sem necessidade de backend separado.

#### TypeScript

Garante tipagem estática, reduzindo bugs em lógica de jogo.

#### JWT + cookies

Permite que o usuário faça login uma vez e multiplos sites possam reaproveitar o token, permitindo SSO.

#### Banco de dados (MongoDB)

Era mais rápido de configurar, mais fácil de criar sistema de logs, e também por sua simplicidade.

#### Auth Server

Inicialmente, a autenticação seria no próprio Next, mas o Next tem uma forma muito única de montar um JWT, de forma que só ele conseguiria descodificar depois, impedindo a implementação de SSO.

# ⚠️ Limitações conhecidas

#### Persistência de dados limitada

Sem banco configurado, o jogo não funciona.

#### Necessidade do servidor de autenticação (Nyffi/mvg-backend)

Se o servidor Nest.js não estiver de pé, não será possível autenticar um usuário.

#### Regras do Blackjack simplificadas

Não há suporte para split, double down ou insurance, e o jogador não tem um oponente.

#### Interface básica

Foco inicial em funcionalidade, com UI ainda simples.

#### Sem autenticação avançada

Não há cadastro completo de usuários, só é possivel logar com Google.

#### Escalabilidade

Por estar acoplado ao Next.js API Routes, pode não escalar bem em uso massivo (solução seria separar backend dedicado).
