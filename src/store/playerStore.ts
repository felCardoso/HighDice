import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface PlayerState {
  username: string
  abbreviation: string
  /** Cumulative score for the current run. */
  score: number
  /** Highest cumulative run score ever achieved, persisted across runs. */
  highScore: number
  recordScore: (points: number) => void
  resetScore: () => void
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set) => ({
      username: 'Anonymous',
      abbreviation: 'ANON',
      score: 0,
      highScore: 0,

      recordScore: (points) =>
        set((state) => {
          const score = state.score + points
          return { score, highScore: Math.max(state.highScore, score) }
        }),

      resetScore: () => set({ score: 0 }),
    }),
    {
      name: 'highdice-player',
      partialize: (state) => ({
        username: state.username,
        abbreviation: state.abbreviation,
        highScore: state.highScore,
      }),
    },
  ),
)
