import { create } from "zustand";
import { persist } from "zustand/middleware";

const useUserStore = create(
  persist(
    (set) => ({
      user: null,
      userId: null,
      token: null,
      isAuthenticated: false,

      // Set user data
      setUser: (userData) =>
        set({
          user: userData,
          userId: userData?.user_id || userData?._id,
          isAuthenticated: !!userData,
        }),

      // Set token
      setToken: (token) =>
        set({
          token,
          isAuthenticated: !!token,
        }),

      // Login
      login: (userData, token) => {
        localStorage.setItem("token", token);
        set({
          user: userData,
          userId: userData?.user_id || userData?._id,
          token,
          isAuthenticated: true,
        });
      },

      // Logout
      logout: () => {
        localStorage.removeItem("token");
        set({
          user: null,
          userId: null,
          token: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: "user-storage",
      partialize: (state) => ({
        user: state.user,
        userId: state.userId,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

export default useUserStore;
