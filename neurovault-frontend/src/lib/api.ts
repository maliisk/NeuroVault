import axios from "axios";

// Gateway adresini buraya yazıyoruz
export const api = axios.create({
  baseURL: "http://localhost:8080", // Not: Kendi Gateway portun neyse o kalsın, genelde 8080 olur
});

// YENİ: Her istek (request) atılmadan salise önce araya girip Token'ı ekliyoruz
api.interceptors.request.use(
  (config) => {
    // Token'ı localStorage'dan çek
    const token =
      typeof window !== "undefined" ? localStorage.getItem("nv_token") : null;

    // Eğer token varsa, isteğin Header (Başlık) kısmına "Bearer {token}" olarak ekle
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);
