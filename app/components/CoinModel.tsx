'use client';
import * as tf from '@tensorflow/tfjs';

// 🚀 TensorFlow.js 기반 예측 모델 (선형 회귀)
export async function trainAndPredict(prices: number[]) {
  // ✅ export default 제거
  if (prices.length < 5) return []; // 데이터 부족 시 예측 안 함

  // 날짜(X) 및 가격(Y) 데이터 변환
  const xs = tf.tensor2d(prices.map((_, i) => [i]));
  const ys = tf.tensor2d(prices.map((p) => [p]));

  // 선형 회귀 모델 생성
  const model = tf.sequential();
  model.add(tf.layers.dense({ units: 1, inputShape: [1] }));

  // 모델 학습 설정 (Adam 옵티마이저 사용)
  model.compile({ loss: 'meanSquaredError', optimizer: 'adam' });

  // 학습 실행 (Epochs: 200)
  await model.fit(xs, ys, { epochs: 200 });

  // 🚀 다음 7일 가격 예측
  const futureXs = tf.tensor2d([...Array(7)].map((_, i) => [prices.length + i]));
  const predictedPricesTensor = model.predict(futureXs) as tf.Tensor;

  // ✅ 예측 결과를 항상 1차원 배열로 변환
  const predictedPrices = await predictedPricesTensor.array();

  return Array.isArray(predictedPrices) && Array.isArray(predictedPrices[0])
    ? predictedPrices.flat()
    : (predictedPrices as number[]);
}
