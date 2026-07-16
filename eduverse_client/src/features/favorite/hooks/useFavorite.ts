/* eslint-disable @typescript-eslint/no-explicit-any */
import { useFavoriteStore } from "../store/favorite.store";
import Swal from "sweetalert2";

// Toast Mixin matching the premium styling of Eduverse
const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 2000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener("mouseenter", Swal.stopTimer);
    toast.addEventListener("mouseleave", Swal.resumeTimer);
  },
});

export function useFavorite() {
  const {
    favorites,
    loading,
    favoriteCount,
    fetchFavorites,
    addFavorite: storeAddFavorite,
    removeFavorite: storeRemoveFavorite,
  } = useFavoriteStore();

  const isFavorited = (courseId: string) => {
    return favorites.some((item) => item.khoaHocId === courseId);
  };

  const addFavorite = async (courseId: string, courseTitle: string) => {
    try {
      await storeAddFavorite(courseId);
      Toast.fire({
        icon: "success",
        title: `Đã thêm "${courseTitle}" vào yêu thích`,
      });
    } catch (error: any) {
      Toast.fire({
        icon: "error",
        title: error?.message || "Không thể thêm vào yêu thích",
      });
    }
  };

  const removeFavorite = async (
    courseId: string,
    courseTitle: string,
    confirmFirst = true
  ) => {
    if (confirmFirst) {
      const result = await Swal.fire({
        title: "Xác nhận bỏ yêu thích?",
        text: `Bạn có chắc chắn muốn bỏ khóa học "${courseTitle}" khỏi danh sách yêu thích?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#8B1313",
        cancelButtonColor: "rgba(24, 24, 27, 0.4)",
        confirmButtonText: "Bỏ yêu thích",
        cancelButtonText: "Hủy",
        customClass: {
          popup: "rounded-card",
        },
      });

      if (!result.isConfirmed) return;
    }

    try {
      await storeRemoveFavorite(courseId);
      Toast.fire({
        icon: "success",
        title: `Đã xóa "${courseTitle}" khỏi danh sách yêu thích`,
      });
    } catch (error: any) {
      Toast.fire({
        icon: "error",
        title: error?.message || "Không thể xóa khỏi danh sách yêu thích",
      });
    }
  };

  const toggleFavorite = async (courseId: string, courseTitle: string) => {
    const favorited = isFavorited(courseId);
    if (favorited) {
      // Toggle from courses page directly removes it without popup
      await removeFavorite(courseId, courseTitle, false);
    } else {
      await addFavorite(courseId, courseTitle);
    }
  };

  return {
    favorites,
    loading,
    favoriteCount,
    isFavorited,
    fetchFavorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
  };
}
