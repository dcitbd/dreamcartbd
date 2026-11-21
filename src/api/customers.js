import { apiClient } from './client.js';

export const customersApi = {
  async list(params) { return apiClient.request("customers/list", params); },
  async get(id) { return apiClient.request("customers/details", { id }); },
  async create(payload) { return apiClient.request("customers/create", payload); },
  async register(payload) { return apiClient.request("customers/register", payload); },
  async login(payload) { return apiClient.request("customers/login", payload); },
  async update(payload) { return apiClient.request("customers/update", payload); }
};

export default customersApi;
