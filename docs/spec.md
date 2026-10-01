# Pomodoro com cena ilustrada — Design

Data: 2026-09-30
Status: aprovado em conversa, aguardando revisão do documento

## 1. Objetivo

Web app que cronometra blocos de foco e de descanso seguindo o Método Pomodoro, apresentado dentro de uma cena ilustrada e animada (quarto aconchegante com um ursinho trabalhando), em estilo cartoon de contornos grossos.

## 2. Escopo

### Versão 1 (este documento)
- Timer Pomodoro com três modos: foco, pausa curta, pausa longa.
- Tempos e número de ciclos configuráveis.
- Alertas sonoros e notificação do navegador ao fim de cada bloco.
- Nome da atividade em andamento.
- Cena SVG original animada, que reage ao modo, ao tempo decorrido e à reta final.

### Fora do escopo (futuro)
- Histórico e estatísticas.
- PWA (instalação e uso offline).
- Contas, sincronização entre dispositivos.

## 3. Tecnologia

- HTML + CSS + JavaScript puro (ES modules), sem build e sem dependências.
- Cena desenhada em SVG inline; animações em CSS keyframes, controladas por classes.
- Som gerado com Web Audio API (sem arquivos de áudio).
- Persistência em `localStorage`.
- Roda abrindo `index.html` via um servidor estático simples (ES modules não carregam por `file://` em todos os navegadores).

## 4. Tela

Tela única, orientação paisagem, responsiva até largura de celular (~375px; em retrato a cena é escalada para caber, mantendo proporção).

```
┌─────────────── moldura (cor do modo) ────────────────────────┐
│  ┌──────────────── cena SVG do quarto ────────────────────┐  │
│  │        [⏱ 24:36  ▶/⏸  ⏹  ⏭]                     ⚙      │  │
│  │         › › › ›  (ciclos)                               │  │
│  │     "Nome da atividade"                                 │  │
│  │   quadro   [janela: floresta]   estante                 │  │
│  │        ursinho 🎧  notebook  caneca        lixeira      │  │
│  │   ═══════════ escrivaninha ═══════════                  │  │
│  └─────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

### Elementos
- **Barra do timer** (pílula escura no topo): ícone do modo, tempo `MM:SS`, botões iniciar/pausar, parar (reset) e pular (discreto).
- **Indicador de ciclos**: uma seta por foco do ciclo (padrão 4); preenchida = concluída, vazada = pendente.
- **Nome da atividade**: texto abaixo da barra; clique transforma em campo editável; Enter ou perder foco salva; vazio mostra placeholder "No que você vai focar?".
- **Botão ⚙**: abre painel de configurações sobre a cena.

### Cores por modo (moldura + ícone da barra)
| Modo         | Cor      |
|--------------|----------|
| Foco         | vermelho |
| Pausa curta  | verde    |
| Pausa longa  | azul     |

## 5. Cena e animações

> **Atualização (2026-09-30):** a cena foi redesenhada em pixel art no estilo de jogos 2D de blocos (inspirada em Terraria, arte original): casa de madeira em corte lateral, personagem humano que martela na bancada (foco), senta com uma caneca (pausa curta) e dorme na cama (pausa longa); o sol faz um arco no céu; moedas e estrelas caem na comemoração. Interface com painéis azuis de inventário, corações como indicador de ciclos e fontes Pixelify Sans / Silkscreen. A descrição abaixo é do visual original (ursinho); os comportamentos (reta final, comemoração, congelar ao pausar, movimento reduzido) continuam valendo.

Desenho original (não copiar arte de terceiros): parede de madeira, janela com floresta, quadro, estante com livros, escrivaninha, notebook, caneca, luminária, lixeira, ursinho com fone de ouvido. Contornos escuros e grossos, cores quentes.

### Por modo
- **Foco**: ursinho digitando (braços e cabeça com movimento leve), vapor saindo da caneca, árvores balançando na janela, tela do notebook acesa.
- **Pausa (curta e longa)**: ursinho se espreguiçando / tomando café; tela do notebook apagada.
- **Timer parado (pausado ou não iniciado)**: todas as animações congeladas (`animation-play-state: paused`).

### Céu (horário real)
O céu acompanha o horário real: o sol faz um arco do nascer ao pôr do sol de hoje, com ~1 h de céu alaranjado em volta de cada um, e à noite aparecem lua e estrelas (a casa escurece e as tochas iluminam). O nascer e o pôr do sol são calculados (algoritmo simplificado da NOAA, `js/sun.js`) pela localização do navegador, pedida na primeira abertura e guardada só localmente, arredondada a ~1 km (`pomodoro.location`). Sem localização, usa 6h–18h. Sol da meia-noite / noite polar mantêm dia ou noite contínuos. O céu atualiza mesmo com o timer pausado. O painel ⚙ mostra a origem e os horários do dia, com o botão "Usar minha localização".

### Reta final
- **Último minuto** (ou últimos 20% do bloco, se o bloco for menor que 5 min): números do timer pulsam; ícone do modo balança como despertador.
  - Foco: ursinho digita mais rápido e aparece uma gota de suor.
  - Pausa: ursinho boceja e olha para o notebook.
- **Últimos 10 segundos**: moldura pisca suavemente na cor do modo.
- **Fim do bloco**: comemoração de ~2 s (ursinho com braços para cima + estrelinhas/confete caindo) e em seguida a cena passa para o próximo modo.

### Acessibilidade
Com `prefers-reduced-motion: reduce`, animações contínuas e piscadas são desativadas; mudanças de modo e céu continuam (sem movimento).

## 6. Funcionamento do timer

### Ciclo
Foco → Pausa curta → Foco → … → no N-ésimo foco (padrão N = 4) → Pausa longa → recomeça do 1º foco (indicador de ciclos zera).

### Controles
- **Iniciar/Pausar**: alterna o bloco atual entre rodando e pausado.
- **Parar (⏹)**: volta o bloco atual ao tempo cheio e pausa. Se já houver tempo decorrido, pede confirmação.
- **Pular (⏭)**: avança para o próximo bloco sem contar o atual como concluído para alertas/comemoração; um foco pulado conta para avançar o ciclo (mantém a sequência previsível).
- **Ao terminar um bloco**: dispara alertas + comemoração e prepara o próximo bloco **pausado**, a menos que "iniciar automaticamente" esteja ligado.

### Precisão
O timer guarda o instante de término (`endsAt = Date.now() + restante`) enquanto roda e calcula `restante = endsAt - Date.now()` a cada tick (~250 ms, via `setInterval`). Assim não acumula erro nem atrasa com a aba em segundo plano. Ao pausar, grava o restante e descarta `endsAt`.

### Título da aba
Enquanto houver bloco carregado: `🍅 MM:SS – Foco` / `☕ MM:SS – Pausa` / `🌙 MM:SS – Pausa longa`.

## 7. Configurações (painel ⚙)

| Configuração                     | Padrão | Limites        |
|----------------------------------|--------|----------------|
| Foco (min)                       | 25     | 1–120          |
| Pausa curta (min)                | 5      | 1–60           |
| Pausa longa (min)                | 15     | 1–60           |
| Focos até a pausa longa          | 4      | 1–12           |
| Iniciar próximo automaticamente  | não    | —              |
| Som                              | ligado | —              |
| Volume                           | 70%    | 0–100%         |
| Notificação do navegador         | desligada | —           |

- Valores inválidos são ajustados para o limite mais próximo; campo vazio volta ao padrão.
- Mudar a duração do modo **atual** enquanto ele está parado e sem tempo decorrido atualiza o bloco na hora; caso contrário, vale a partir do próximo bloco.
- Ao ligar notificação, o app pede permissão; se negada, a opção volta para desligada e mostra aviso curto.

## 8. Alertas

- **Som**: sequência curta de tons (Web Audio), diferente para fim de foco e fim de pausa. Respeita liga/desliga e volume. O `AudioContext` é criado/retomado no primeiro clique do usuário (exigência dos navegadores).
- **Notificação**: título "Foco concluído!" / "Pausa terminada!" com o nome da atividade no corpo. Só se permitida e ligada.
- Falha em qualquer alerta é silenciosa (não interrompe o timer).

## 9. Persistência

Chaves em `localStorage`:
- `pomodoro.settings` — objeto de configurações.
- `pomodoro.state` — `{ mode, focusCount, remainingMs, activity }`.

O estado é salvo a cada mudança de controle, de modo, de atividade e a cada ~5 s enquanto roda. Ao recarregar, restaura modo, ciclo, atividade e restante, sempre **pausado**. Dados corrompidos ou ausentes → usa padrões. Toda leitura/escrita em `try/catch` (storage pode estar bloqueado).

## 10. Arquitetura

```
pomodoro/
├── index.html          estrutura + cena SVG inline
├── css/style.css       layout, cores por modo, keyframes
├── js/
│   ├── timer.js        lógica pura do ciclo (sem DOM)
│   ├── settings.js     padrões, validação, load/save (localStorage)
│   ├── alerts.js       som (Web Audio) + notificações
│   ├── scene.js        aplica modo, céu, reta final e comemoração à cena
│   └── app.js          composição: eventos da UI → timer → tela/cena/alertas
├── tests/timer.test.html   testes da lógica, rodam no navegador
└── docs/spec.md
```

### Responsabilidades e interfaces
- **timer.js** — cria um timer a partir de `(settings, estadoInicial, now)`; o relógio é injetado (`now()`) para permitir testes determinísticos. Expõe: `start()`, `pause()`, `reset()`, `skip()`, `tick()` (retorna se o bloco terminou), `getState()` → `{ mode, focusCount, remainingMs, durationMs, running }`, `updateSettings(settings)`. Não toca em DOM, storage nem áudio.
- **settings.js** — `DEFAULTS`, `validate(obj)`, `loadSettings()`, `saveSettings()`, `loadState()`, `saveState()`.
- **alerts.js** — `playEnd(mode, volume)`, `notify(title, body)`, `requestPermission()`.
- **scene.js** — `setMode(mode)`, `setRunning(bool)`, `setProgress(fração)` (céu), `setFinalStretch(nível)` (`none | minute | seconds`), `celebrate()` → Promise que resolve ao fim da animação.
- **app.js** — único módulo que conhece todos os outros; mantém o loop de tick, atualiza barra/indicador/título, reage a fim de bloco (alertas → `celebrate()` → próximo modo).

## 11. Testes

### Automáticos (`tests/timer.test.html`, mini-runner próprio sem dependências)
- Sequência de modos com N = 4 e com N = 1.
- Contagem com relógio falso: pausar e retomar preserva o restante exato.
- Fim de bloco detectado no tick correto; próximo bloco começa pausado ou rodando conforme config.
- `reset()` e `skip()` (incluindo avanço do ciclo ao pular foco).
- `updateSettings()` aplica na hora só quando o bloco está intacto.
- `validate()` de settings: limites, vazios e tipos errados.
- Restauração de estado salvo (válido e corrompido).

### Visuais (no navegador)
Com durações curtas de teste: cena nos três modos, céu mudando, reta final (minuto e 10 s), comemoração, animações congeladas ao pausar, painel de configurações, layout em desktop e celular, `prefers-reduced-motion`.

## 12. Critérios de pronto
- Um ciclo completo (4 focos + pausas + pausa longa) roda corretamente com as durações configuradas.
- Alertas disparam ao fim de cada bloco (som e, se permitida, notificação).
- Recarregar a página preserva configurações, atividade e estado.
- Todos os testes automáticos passam.
- Cena exibe todas as variações descritas na seção 5, em desktop e celular.
