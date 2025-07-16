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

export const buscarIcone = (moedaId: string) =>
  `https://assets.coingecko.com/coins/images/${moedaId}/large.png`;