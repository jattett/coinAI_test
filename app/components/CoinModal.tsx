'use client';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Coin } from '../page';

// ✅ Chart.js에서 category scale을 명시적으로 등록
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

export default function CoinModal({
  coin,
  predictedPrices,
  onClose,
}: {
  coin: Coin;
  predictedPrices: number[];
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-white p-8 rounded-2xl shadow-lg w-[800px] h-[600px] flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-3 text-center">{coin.name} 가격 예측</h2>

        <div className="w-full h-[400px]">
          <Line
            data={{
              labels: [
                '예상 1일 후',
                '예상 2일 후',
                '예상 3일 후',
                '예상 4일 후',
                '예상 5일 후',
                '예상 6일 후',
                '예상 7일 후',
              ],
              datasets: [
                {
                  label: '예측 가격 (USD)',
                  data: predictedPrices,
                  borderColor: '#F97316',
                  backgroundColor: 'rgba(249, 115, 22, 0.2)',
                  fill: true,
                  tension: 0.4,
                },
              ],
            }}
          />
        </div>

        <button onClick={onClose} className="px-6 py-2 mt-6 bg-red-500 text-white rounded-lg">
          닫기
        </button>
      </div>
    </div>
  );
}
