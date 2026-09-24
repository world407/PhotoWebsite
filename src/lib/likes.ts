import { createContext, useContext } from 'react';

export interface LikesContextValue {
  likedIds: number[];
  isLiked: (id: number) => boolean;
  toggleLike: (id: number) => void;
}

export const LikesContext = createContext<LikesContextValue | undefined>(undefined);

export function useLikes(): LikesContextValue {
  const context = useContext(LikesContext);
  if (!context) {
    throw new Error('useLikes must be used within a LikesProvider');
  }
  return context;
}
