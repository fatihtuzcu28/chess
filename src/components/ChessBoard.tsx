/**
 * ChessBoard Component
 * 8x8 satranç tahtasını render eder.
 * Sürükle-bırak, legal moves, selected square ve terfi modali.
 */
import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Square as ChessSquare, PieceSymbol } from 'chess.js';
import { useGameStore } from '../store/useGameStore';
import SquareComponent from './Square';
import { PieceMap } from '../assets/pieces';

const ChessBoard: React.FC = () => {
  const {
    game,
    fen,
    selectedSquare,
    legalMoves,
    lastMove,
    kingInCheck,
    pendingPromotion,
    aiThinking,
    selectSquare,
    makeMove,
    handlePromotion,
    cancelPromotion,
    getLegalMovesFrom,
    showLegalMoves,
  } = useGameStore();

  const [draggingFrom, setDraggingFrom] = useState<ChessSquare | null>(null);
  const [dragLegalMoves, setDragLegalMoves] = useState<ChessSquare[]>([]);
  const boardRef = useRef<HTMLDivElement>(null);
  const [boardSize, setBoardSize] = useState(560);

  // Responsive board boyutu
  useEffect(() => {
    const updateSize = () => {
      const maxSize = Math.min(window.innerWidth - 32, window.innerHeight - 120, 640);
      setBoardSize(Math.max(280, maxSize));
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const squareSize = boardSize / 8;

  // Board verisi
  const board = useMemo(() => game.board(), [fen, game]);

  const handleSquareClick = useCallback((square: ChessSquare) => {
    if (draggingFrom) return;
    selectSquare(square);
  }, [selectSquare, draggingFrom]);

  const handleDragStart = useCallback((square: ChessSquare) => {
    const piece = game.get(square);
    if (piece && piece.color === game.turn()) {
      if (useGameStore.getState().aiEnabled && game.turn() === 'b') return;
      setDraggingFrom(square);
      setDragLegalMoves(getLegalMovesFrom(square));
      selectSquare(square);
    }
  }, [game, selectSquare, getLegalMovesFrom]);

  const handleDragEnd = useCallback((targetSquare: ChessSquare | null) => {
    if (draggingFrom && targetSquare) {
      const lm = getLegalMovesFrom(draggingFrom);
      if (lm.includes(targetSquare)) {
        // Terfi kontrolü
        const piece = game.get(draggingFrom);
        if (
          piece?.type === 'p' &&
          ((piece.color === 'w' && targetSquare[1] === '8') ||
           (piece.color === 'b' && targetSquare[1] === '1'))
        ) {
          useGameStore.setState({
            pendingPromotion: { from: draggingFrom, to: targetSquare },
            selectedSquare: null,
            legalMoves: [],
          });
        } else {
          makeMove(draggingFrom, targetSquare);
        }
      }
    }
    setDraggingFrom(null);
    setDragLegalMoves([]);
  }, [draggingFrom, makeMove, getLegalMovesFrom, game]);

  const activeLegalMoves = draggingFrom ? dragLegalMoves : legalMoves;

  // Terfi taşları
  const promotionPieces: PieceSymbol[] = ['q', 'n', 'r', 'b'];
  const promoColor = pendingPromotion ? (game.turn() === 'w' ? 'w' : 'b') : 'w';

  return (
    <div className="relative">
      {/* Tahta */}
      <motion.div
        ref={boardRef}
        data-board
        className="grid grid-cols-8 rounded-xl overflow-hidden neu relative"
        style={{ width: boardSize, height: boardSize }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {board.map((row, rowIdx) =>
          row.map((piece, colIdx) => {
            const file = String.fromCharCode(97 + colIdx);
            const rank = (8 - rowIdx).toString();
            const square = (file + rank) as ChessSquare;

            const isSelected = selectedSquare === square || draggingFrom === square;
            const isLegal = showLegalMoves && activeLegalMoves.includes(square);
            const isLastFrom = lastMove?.from === square;
            const isLastTo = lastMove?.to === square;
            const isCheck = kingInCheck === square;
            const hasPieceOnSquare = !!piece;

            return (
              <SquareComponent
                key={square}
                square={square}
                row={rowIdx}
                col={colIdx}
                squareSize={squareSize}
                piece={piece}
                isSelected={isSelected}
                isLegalMove={isLegal}
                isLastMoveFrom={isLastFrom}
                isLastMoveTo={isLastTo}
                isCheck={isCheck}
                hasPiece={hasPieceOnSquare && isLegal}
                onClick={handleSquareClick}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                isDragging={draggingFrom === square}
              />
            );
          })
        )}
      </motion.div>

      {/* AI Düşünüyor Göstergesi */}
      <AnimatePresence>
        {aiThinking && (
          <motion.div
            className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 text-sm"
            style={{ color: 'var(--text-secondary)' }}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
          >
            <span>AI düşünüyor</span>
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-current thinking-dot" />
              <div className="w-1.5 h-1.5 rounded-full bg-current thinking-dot" />
              <div className="w-1.5 h-1.5 rounded-full bg-current thinking-dot" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Terfi Modal */}
      <AnimatePresence>
        {pendingPromotion && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/40 rounded-xl"
              onClick={cancelPromotion}
            />
            <motion.div
              className="relative glass p-3 flex gap-2"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              {promotionPieces.map((p) => {
                const key = `${promoColor}${p}`;
                const PComp = PieceMap[key];
                return (
                  <div
                    key={p}
                    className="promotion-piece p-2"
                    onClick={() => handlePromotion(p)}
                  >
                    {PComp && <PComp size={squareSize * 0.7} />}
                  </div>
                );
              })}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChessBoard;
