import axios from "axios";

const baseURL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000";

const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  (config) => {
    console.log(`🌐 [API] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    console.log(`📦 [API] Request config:`, config);

    const stored = sessionStorage.getItem("accessToken");
    let accessToken = "";

    try {
      accessToken = stored ? JSON.parse(stored) : "";
    } catch {
      accessToken = stored || "";
    }

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
      console.log(`🔐 [API] Authorization header set`);
    } else {
      console.log(`⚠️ [API] No access token found!`);
    }

    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
      console.log(`📁 [API] FormData detected, Content-Type deleted`);
    }

    console.log(`✅ [API] Request will be sent`);
    return config;
  },
  (err) => {
    console.log(`❌ [API] Request interceptor error:`, err);
    return Promise.reject(err);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    const method = response.config?.method?.toUpperCase();
    const url = response.config?.url;
    console.log(`✅ [API] ${method || "?"} ${url || "?"} SUCCESS:`, response.status, response.data);
    return response;
  },
  (error) => {
    const method = error.config?.method?.toUpperCase();
    const url = error.config?.url;
    console.error(
      `❌ [API] ${method || "?"} ${url || "?"} FAILED:`,
      error.response?.status,
      error.response?.data?.message || error.message
    );
    console.error(`📊 [API] Full error response:`, error.response?.data);
    return Promise.reject(error);
  }
);

export default axiosInstance;
