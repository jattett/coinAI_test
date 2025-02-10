'use client';
import { useState, useEffect } from 'react';
import CoinModal from './components/CoinModal';
import { trainAndPredict } from './components/CoinModel'; // ✅ {} 사용하여 가져오기

// Coin 타입 정의
export interface Coin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
}

export default function Home() {
  const [coinData, setCoinData] = useState<Coin[]>([]);
  const [selectedCoin, setSelectedCoin] = useState<Coin | null>(null);
  const [predictedPrices, setPredictedPrices] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCoins = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd');
        if (!response.ok) throw new Error('API 응답이 올바르지 않습니다.');

        const data = await response.json();
        setCoinData(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('알 수 없는 오류가 발생했습니다.');
        }
      } finally {
        setLoading(false);
      }
    };

    // ✅ 10초마다 fetchCoins 실행 (실시간 업데이트)
    fetchCoins(); // 초기 데이터 로드
    const intervalId = setInterval(fetchCoins, 10000); // 10초마다 최신 데이터 가져오기

    return () => clearInterval(intervalId); // 컴포넌트 언마운트 시 인터벌 해제
  }, []);
  // 🚀 모달 열기 & 예측 실행
  const handleRowClick = async (coin: Coin) => {
    setSelectedCoin(coin);

    try {
      const url = `https://api.coingecko.com/api/v3/coins/${coin.id}/market_chart?vs_currency=usd&days=365&interval=daily`;
      const response = await fetch(url);
      const data = await response.json();

      const prices = data.prices.map((price: number[]) => price[1]);

      // 🚀 예측된 가격 가져오기
      let predicted = await trainAndPredict(prices);

      // ✅ 예측된 값이 중첩 배열이면 1차원 배열로 변환
      if (Array.isArray(predicted) && Array.isArray(predicted[0])) {
        predicted = predicted.flat();
      }

      setPredictedPrices(predicted as number[]);
    } catch (error) {
      console.error('Error fetching chart data:', error);
    }
  };
  const handleCloseModal = () => {
    setSelectedCoin(null);
    setPredictedPrices([]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading coin data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <h1 className="text-3xl font-bold mb-4">CoinGecko Coin Data</h1>

      {selectedCoin && <CoinModal coin={selectedCoin} predictedPrices={predictedPrices} onClose={handleCloseModal} />}

      <div className="w-full max-w-3xl">
        <table className="min-w-full border-collapse border border-slate-300">
          <thead>
            <tr className="bg-slate-100">
              <th className="p-3 border border-slate-300 text-left">Coin</th>
              <th className="p-3 border border-slate-300 text-left">Symbol</th>
              <th className="p-3 border border-slate-300 text-left">Price (USD)</th>
              <th className="p-3 border border-slate-300 text-left">Market Cap</th>
            </tr>
          </thead>
          <tbody>
            {coinData.map((coin) => (
              <tr key={coin.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => handleRowClick(coin)}>
                <td className="p-3 border border-slate-300 flex items-center space-x-2">
                  <img src={coin.image} alt={coin.name} className="w-6 h-6" />
                  <span>{coin.name}</span>
                </td>
                <td className="p-3 border border-slate-300 uppercase">{coin.symbol}</td>
                <td className="p-3 border border-slate-300">{coin.current_price.toLocaleString()}</td>
                <td className="p-3 border border-slate-300">{coin.market_cap.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
