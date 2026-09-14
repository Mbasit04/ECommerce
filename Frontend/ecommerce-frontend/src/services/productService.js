import api from './api';

// ----- Public/admin endpoints (kept for the existing pages) -----

export const getProducts = async (filters = {}) => {
  const response = await api.get('/Products', { params: filters });
  return response.data;
};

export const getProductById = async (id) => {
  const response = await api.get(`/Products/${id}`);
  return response.data;
};

export const getCategories = async () => {
  const response = await api.get('/Categories');
  return response.data;
};

// ----- Customer-facing endpoints (used by CustomerProducts.jsx) -----
//
// We hit the customer-side product endpoint so unauthenticated or
// customer-role callers get the right list. There is currently no
// dedicated `/Customer/categories` endpoint on the backend, so the
// category list is derived from the active product list. Each
// category appears only once, and we keep the first-seen name.

export const getCustomerProducts = async (params) => {
  const response = await api.get('/Customer/products', { params });
  return response.data;
};

export const getCustomerCategories = async () => {
  const products = await getCustomerProducts();

  const list = Array.isArray(products)
    ? products
    : products?.products || products?.items || [];

  const seen = new Map();
  for (const product of list) {
    const id =
      product.categoryId ?? product.CategoryId;
    const name =
      product.categoryName ?? product.CategoryName ?? 'Category';

    if (id == null || seen.has(id)) continue;
    seen.set(id, { id, name });
  }

  return Array.from(seen.values());
};
