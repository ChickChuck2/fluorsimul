# Simulador de Tratamento de Água - Remoção de Fluoreto

Simulador técnico-didático para visualização do processo de remoção de fluoreto em águas industriais via precipitação e adsorção.

## 🚀 Tecnologias

- **Vite** + **TypeScript**
- **Vanilla CSS** (Estrutura Modular)
- **SVG Dinâmico** para visualização do fluxo
- **Canvas API** para monitoramento de dados em tempo real
- **Vitest** para testes de lógica de domínio

## 🏗️ Arquitetura

O projeto foi refatorado para seguir padrões modernos de desenvolvimento:

- **Centralized State**: Estado único via `SimulationStore`.
- **Formal State Machine**: Transições de fase estritamente controladas.
- **Dedicated Scheduler**: Relógio centralizado (`Clock`) com suporte a cancelamento via `AbortController`.
- **Separation of Concerns**:
  - `simulation/`: Lógica pura, cálculos e motor temporal.
  - `ui/`: Gerenciamento de DOM, formulários e gráficos.
  - `svg/`: Camada visual de animações e estados hidráulicos.
  - `styles/`: Sistema de CSS modular (tokens, layout, components).

## 📊 Premissas do Modelo (Disclaimer)

Este simulador é **didático**. Embora os conceitos sejam baseados em engenharia química real:

1.  **Cinética**: A velocidade de reação é acelerada para fins de demonstração.
2.  **Isoterma de Adsorção**: O decaimento de PPM na etapa de Alumina segue uma curva simplificada ($progress^{0.7}$) para ilustrar o comportamento não linear de saturação de sítios ativos.
3.  **Calibração**: Os setpoints de pH (10.5 para precipitação e 5.8 para adsorção) são tecnicamente precisos, mas os tempos de mistura não consideram turbulência real.
4.  **Saturação**: O modelo de saturação do filtro é discreto (baseado em ciclos de uso) em vez de uma curva de ruptura (breakthrough curve) contínua.

## 🛠️ Como Executar

1.  Instalar dependências: `npm install`
2.  Rodar em dev: `npm run dev`
3.  Typecheck: `npm run typecheck`
4.  Verificar qualidade: `npm run lint`
5.  Rodar testes: `npm test`
6.  Gerar build: `npm run build`

## ♿ Acessibilidade

O projeto utiliza semântica HTML5 (`main`, `aside`, `section`), rótulos ARIA para elementos dinâmicos e suporte total a navegação por teclado com estados de foco visíveis.
