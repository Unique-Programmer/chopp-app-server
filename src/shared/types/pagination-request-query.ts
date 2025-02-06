//Синхронизировано с админкой! Менять только во всех местах однвоременно
export type PaginationRequestQuery = {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: 'ASC' | 'DESC';
};
