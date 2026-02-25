import axios from 'axios';

export function getApiErrorMessage(error, fallbackMessage = 'Co loi xay ra. Vui long thu lai.') {
  if (!error) return fallbackMessage;

  if (axios.isAxiosError(error)) {
    const responseMessage = error.response?.data?.message;
    if (typeof responseMessage === 'string' && responseMessage.trim()) {
      return responseMessage;
    }

    if (error.response?.status === 401) {
      return 'Thong tin dang nhap khong hop le.';
    }

    if (error.code === 'ECONNABORTED') {
      return 'Yeu cau het thoi gian. Vui long thu lai.';
    }

    return 'Khong the ket noi den aipai_core. Kiem tra backend va REACT_APP_API_BASE_URL.';
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
}
