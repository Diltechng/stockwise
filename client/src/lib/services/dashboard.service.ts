import api from "@/lib/api";
import { ApiResponse, DashboardStats } from "@/types";

export const dashboardService = {
  getStats: () => api.get<ApiResponse<DashboardStats>>("/dashboard/stats"),
};
