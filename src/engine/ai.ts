/**
 * Minimax AI with Alpha-Beta Pruning (Web Worker Ver.)
 * Basit ama etkili satranç yapay zekası.
 */
import type { Move } from 'chess.js';

let worker: Worker | null = null;

export function findBestMoveAsync(fen: string, depth: number = 3): Promise<Move | null> {
  return new Promise((resolve, reject) => {
    // Worker yoksa oluştur
    if (!worker) {
      worker = new Worker(new URL('./worker.ts', import.meta.url), {
        type: 'module',
      });
    }

    // Worker'dan mesaj gelince
    worker.onmessage = (e) => {
      resolve(e.data);
    };

    // Hata olursa
    worker.onerror = (err) => {
      console.error('AI Worker Error:', err);
      reject(err);
    };

    // Hesaplama başlat
    worker.postMessage({ fen, depth });
  });
}

// Worker'ı temizle (gerekirse)
export function terminateAI() {
  if (worker) {
    worker.terminate();
    worker = null;
  }
}
