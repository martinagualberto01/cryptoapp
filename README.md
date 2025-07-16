Quero que você crie um aplicativo completo chamado **Crypto Portfolio & Market Assistant**, usando:

- React com Vite
- TypeScript
- Tailwind CSS (tema escuro com destaques em verde-limão e amarelo)
- Chart.js para os gráficos
- Suporte a PWA (funcionar como app no celular)
- Notificações push pelo navegador
- API da CoinGecko para preços em tempo real (USD e BRL)

🔧 Estrutura esperada:
1. Tela de dashboard com visão geral do portfólio
2. Inserção manual de transações (compra/venda)
3. Cálculo de PnL (lucro/prejuízo não realizado) baseado nas transações
4. Gráficos com preços e indicadores técnicos (RSI, MACD)
5. Assistente inteligente que diz se é uma “boa zona de entrada” com base em RSI e preço histórico
6. Sistema de alertas:
   - Quando o preço cruza um valor específico
   - Quando RSI < 35 (entrada) ou RSI > 70 (alerta de sobrecompra)
   - Relatórios diários às 09h, 13h, 21h
7. Opção para visualizar valores em USD e BRL
8. Ícones das moedas ao lado dos nomes (ex: logo do BTC, ETH, etc.)
9. Tema escuro elegante com destaques em lime-400 e yellow-400

📁 Estrutura de arquivos sugerida:
- `src/App.tsx`
- `src/components/Header.tsx`
- `src/components/Sidebar.tsx`
- `src/components/Dashboard.tsx`
- `src/components/Portfolio.tsx`
- `src/components/AddTransactionModal.tsx`
- `src/components/Alerts.tsx`
- `src/components/DayTradingSuggestions.tsx`
- `src/components/CryptoChart.tsx`
- `src/context/PortfolioContext.tsx`
- `src/context/AlertsContext.tsx`
- `src/services/cryptoApi.ts`
- `src/services/notificationService.ts`
- `public/manifest.json` (para PWA)

⚠️ Por favor:
- Comece criando o `package.json` com as dependências corretas.
- Depois crie os arquivos iniciais.
- Em seguida, me mostre o que foi criado e os próximos passos.

Tudo deve estar em português (nomes, textos da interface, botões etc.).

