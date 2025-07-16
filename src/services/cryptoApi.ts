import axios from 'axios';

const API_URL = 'https://api.coingecko.com/api/v3';

export const buscarPreco = async (moedaId: string, vs: 'usd' | 'brl') => {
  const { data } = await axios.get(`${API_URL}/simple/price`, {
    params: {
      ids: moedaId,
      vs_currencies: vs,
      include_24hr_change: true,
      include_last_updated_at: true,
    },
  });
  return data[moedaId];
};

export const buscarIcone = (iconeUrl: string) => iconeUrl;

export const buscarMoedasPopulares = async () => {
  const { data } = await axios.get(`${API_URL}/coins/markets`, {
    params: {
      vs_currency: 'usd',
      order: 'market_cap_desc',
      per_page: 20,
      page: 1,
      sparkline: false,
    },
  });
  // Retorna id, nome, símbolo e url do ícone
  return data.map((coin: any) => ({
    id: coin.id,
    nome: coin.name,
    simbolo: coin.symbol,
    icone: coin.image,
  }));
};