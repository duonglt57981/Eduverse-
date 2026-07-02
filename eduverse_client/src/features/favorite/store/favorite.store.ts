import { create } from "zustand";
import { FavoriteCourse } from "../types/favorite.type";
import { favoriteService } from "../services/favorite.service";

interface FavoriteState {
  favorites: FavoriteCourse[];
  loading: boolean;
  favoriteCount: number;
  fetchFavorites: () => Promise<void>;
  addFavorite: (courseId: string) => Promise<FavoriteCourse>;
  removeFavorite: (courseId: string) => Promise<void>;
  toggleFavorite: (courseId: string) => Promise<void>;
}

export const useFavoriteStore = create<FavoriteState>((set, get) => ({
  favorites: [],
  loading: false,
  favoriteCount: 0,

  fetchFavorites: async () => {
    set({ loading: true });
    try {
      const response = await favoriteService.getFavorites();
      if (response.status) {
        set({
          favorites: response.data,
          favoriteCount: response.data.length,
        });
      }
    } catch (error) {
      console.error("Lỗi tải danh sách yêu thích:", error);
    } finally {
      set({ loading: false });
    }
  },

  addFavorite: async (courseId: string) => {
    try {
      const response = await favoriteService.addFavorite(courseId);
      if (response.status) {
        await get().fetchFavorites();
        return response.data;
      }
      throw new Error(response.message || "Không thể thêm vào danh sách yêu thích");
    } catch (error) {
      console.error("Lỗi thêm yêu thích:", error);
      throw error;
    }
  },

  removeFavorite: async (courseId: string) => {
    try {
      const response = await favoriteService.removeFavorite(courseId);
      if (response.status) {
        await get().fetchFavorites();
      } else {
        throw new Error(response.message || "Không thể xóa khỏi danh sách yêu thích");
      }
    } catch (error) {
      console.error("Lỗi xóa yêu thích:", error);
      throw error;
    }
  },

  toggleFavorite: async (courseId: string) => {
    const isFavorited = get().favorites.some((item) => item.khoaHocId === courseId);
    if (isFavorited) {
      await get().removeFavorite(courseId);
    } else {
      await get().addFavorite(courseId);
    }
  },
}));
