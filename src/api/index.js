import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

export const adminApi = {
    getUsers: () => api.get("/api/admin/users"),
    updateCharacter: (discordId, characterName) => 
        api.post("/api/admin/user/character", { discordId, characterName }),
};

export const userApi = {
    getInfo: () => api.get("/api/member/info"),
};

export default api;