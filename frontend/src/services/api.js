import axios from "axios";
axios.defaults.withCredentials = true;

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const register = async (username, password) => {
  try {
    const response = await api.post("/auth/register", { username, password });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const login = async (username, password) => {
  try {
    const response = await api.post("/auth/login", { username, password });
    localStorage.setItem("token", response.data.token);
    localStorage.setItem("userId", response.data.userId);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Axios interceptor to handle unauthorized requests
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized, clear localStorage and redirect to login
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      window.location.href = "/login"; // Redirect to the login page
    }
    return Promise.reject(error);
  }
);


export const addAccount = async (account_name, balance) => {
  try {
    const token = localStorage.getItem("token");
    const response = await api.post(
      "/accounts",
      { account_name, balance },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const updateAccount = async (accountId, account_name, balance) => {
  try {
    const token = localStorage.getItem("token");
    const response = await api.put(
      "/accounts", 
      { accountId, account_name, balance },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'An error occurred' };
  }
};

export const deleteAccount = async(accountId)=>{
  try {
    const token = localStorage.getItem("token");
    const response = await api.delete(`/accounts/${accountId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'An error occurred' };
  }
}

export const getAccounts = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await api.get("/accounts", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

export const getTransactions = async (accountId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get(`/transactions/${accountId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
};

export const addTransaction = async (transactionData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.post('/transactions', transactionData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  };

export const updateTransaction = async(transactionData)=>{
  try {
    const token = localStorage.getItem('token');
    const response = await api.put('/transactions', transactionData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
}

export const deleteTransaction = async(transactionId)=>{
  try {
    const token = localStorage.getItem('token');
    const response = await api.delete(`/transactions/${transactionId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
}

export default api;
