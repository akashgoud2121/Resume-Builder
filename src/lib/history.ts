/**
 * History management for undo/redo functionality
 */

import type { ResumeData } from './types';

export interface HistoryState {
  past: ResumeData[];
  present: ResumeData;
  future: ResumeData[];
}

const MAX_HISTORY_LENGTH = 50; // Keep last 50 states

export function createHistoryState(initialState: ResumeData): HistoryState {
  return {
    past: [],
    present: initialState,
    future: [],
  };
}

/**
 * Add a new state to history
 */
export function addToHistory(
  history: HistoryState,
  newState: ResumeData
): HistoryState {
  // Don't add if state hasn't changed
  if (JSON.stringify(history.present) === JSON.stringify(newState)) {
    return history;
  }

  const newPast = [...history.past, history.present];
  
  // Limit history size
  if (newPast.length > MAX_HISTORY_LENGTH) {
    newPast.shift(); // Remove oldest
  }

  return {
    past: newPast,
    present: newState,
    future: [], // Clear future when new action is made
  };
}

/**
 * Undo - go back to previous state
 */
export function undo(history: HistoryState): HistoryState {
  if (history.past.length === 0) {
    return history; // Nothing to undo
  }

  const previous = history.past[history.past.length - 1];
  const newPast = history.past.slice(0, history.past.length - 1);

  return {
    past: newPast,
    present: previous,
    future: [history.present, ...history.future],
  };
}

/**
 * Redo - go forward to next state
 */
export function redo(history: HistoryState): HistoryState {
  if (history.future.length === 0) {
    return history; // Nothing to redo
  }

  const next = history.future[0];
  const newFuture = history.future.slice(1);

  return {
    past: [...history.past, history.present],
    present: next,
    future: newFuture,
  };
}

/**
 * Check if undo is available
 */
export function canUndo(history: HistoryState): boolean {
  return history.past.length > 0;
}

/**
 * Check if redo is available
 */
export function canRedo(history: HistoryState): boolean {
  return history.future.length > 0;
}

/**
 * Clear all history
 */
export function clearHistory(currentState: ResumeData): HistoryState {
  return createHistoryState(currentState);
}

