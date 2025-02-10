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
        // 🚀 최신 환율 가져오기 (USD → KRW)
        const exchangeRateResponse = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=usd&vs_currencies=krw'
        );
        if (!exchangeRateResponse.ok) throw new Error('환율 데이터를 가져올 수 없습니다.');

        const exchangeRateData = await exchangeRateResponse.json();
        const usdToKrw = exchangeRateData.usd.krw || 1300; // 환율 데이터가 없으면 기본값(1300) 사용

        console.log(`✅ 최신 환율: 1 USD = ${usdToKrw} KRW`);

        // 🚀 최신 코인 데이터 가져오기
        const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd');
        if (!response.ok) throw new Error('코인 데이터를 가져올 수 없습니다.');

        const data = await response.json();

        // 🚀 가격을 KRW로 변환
        const convertedData = data.map((coin: Coin) => ({
          ...coin,
          current_price: Math.round(coin.current_price * usdToKrw), // 원화 변환
          market_cap: Math.round(coin.market_cap * usdToKrw), // 시가총액 변환
        }));

        setCoinData(convertedData);
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

    // ✅ 40초마다 fetchCoins 실행 (실시간 업데이트)
    fetchCoins(); // 초기 데이터 로드
    const intervalId = setInterval(fetchCoins, 40000); // 40초마다 최신 데이터 가져오기

    return () => clearInterval(intervalId); // 컴포넌트 언마운트 시 인터벌 해제
  }, []);

  const handleRowClick = async (coin: Coin) => {
    setSelectedCoin(coin);
    setPredictedPrices([]);

    try {
      console.log('⏳ AI 예측 시작...');

      setTimeout(async () => {
        const url = `https://api.coingecko.com/api/v3/coins/${coin.id}/market_chart?vs_currency=usd&days=365&interval=daily`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('API 응답이 올바르지 않습니다.');

        const data = await response.json();
        const prices = data.prices.map((price: number[]) => price[1]);

        // 🚀 최신 환율 가져오기
        const exchangeRateResponse = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=usd&vs_currencies=krw'
        );
        const exchangeRateData = await exchangeRateResponse.json();
        const usdToKrw = exchangeRateData.usd.krw || 1300;

        // 🚀 AI 예측 모델 실행
        let predicted = await trainAndPredict(prices);
        if (Array.isArray(predicted) && Array.isArray(predicted[0])) {
          predicted = predicted.flat();
        }

        // ✅ 예측된 가격을 KRW로 변환
        const predictedKrw = (predicted as number[]).map((price) => Math.round(price * usdToKrw));

        console.log('✅ AI 예측 완료 (KRW)', predictedKrw);
        setPredictedPrices(predictedKrw);
      }, 2000);
    } catch (error) {
      console.error('🚨 API 요청 실패:', error);
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
                <td className="p-3 border border-slate-300">
                  ₩{coin.current_price.toLocaleString()} {/* ✅ 원화(KRW) 적용 */}
                </td>
                <td className="p-3 border border-slate-300">
                  ₩{coin.market_cap.toLocaleString()} {/* ✅ 시가총액(KRW) 적용 */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
