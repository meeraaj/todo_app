const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://backend:5000/api';

export const fetchWithTimeout = async (url, options = {}) => {
  const timeout = options.timeout || 5000;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

export default API_BASE_URL;