import { API_BASE } from './api';

// Função para obter o token
const getToken = (): string | null => {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
};

export const fileService = {
  // Upload de arquivo
  uploadFile: async (file: File, folder: string = 'avatars'): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const response = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Falha ao fazer upload do arquivo');
    }

    return response.json();
  },

  // Deletar arquivo
  deleteFile: async (fileUrl: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/upload`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ fileUrl }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Falha ao excluir o arquivo');
    }
  },

  // Obter URL completa do arquivo
  getFileUrl: (path: string): string => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${API_BASE.replace('/api', '')}${path}`;
  },
};
