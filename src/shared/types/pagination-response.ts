//Синхронизировано с админкой! Менять только во всех местах однвоременно
export type PaginationResponse<T> = {
  items: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  limit: number;
};
