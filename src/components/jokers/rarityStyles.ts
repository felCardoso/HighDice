import type { JokerRarity } from '../../game/jokers'

export const RARITY_LABEL: Record<JokerRarity, string> = {
  common: 'Common',
  rare: 'Rare',
  legendary: 'Legendary',
}

export const RARITY_BORDER: Record<JokerRarity, string> = {
  common: 'border-[#475569]',
  rare: 'border-[#1a5f94]',
  legendary: 'border-[#b98a14]',
}

export const RARITY_BG: Record<JokerRarity, string> = {
  common: 'bg-[#334155]',
  rare: 'bg-[#0b2a4a]',
  legendary: 'bg-[#5a4306]',
}

export const RARITY_TEXT: Record<JokerRarity, string> = {
  common: 'text-slate-300',
  rare: 'text-sky-300',
  legendary: 'text-amber-300',
}
