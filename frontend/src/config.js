const getDefaultApiBaseUrl = () => {
  if (typeof window === 'undefined') {
    return 'https://localhost:5001';
  }

  const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
  return `${protocol}//${window.location.hostname}:5001`;
};

export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || getDefaultApiBaseUrl();
