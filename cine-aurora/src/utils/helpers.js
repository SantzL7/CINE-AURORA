/**
 * Função para selecionar elementos aleatórios de um array
 * @param {Array} array - Array de onde os elementos serão selecionados
 * @param {number} count - Quantidade de elementos aleatórios a serem selecionados
 * @returns {Array} Novo array com os elementos selecionados aleatoriamente
 */
export const getRandomElements = (array, count) => {
  // Se o array for menor ou igual ao número de elementos desejados, retorna uma cópia embaralhada
  if (array.length <= count) {
    return [...array].sort(() => Math.random() - 0.5);
  }

  // Cria uma cópia do array para não modificar o original
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  // Retorna os primeiros 'count' elementos do array embaralhado
  return shuffled.slice(0, count);
};

/**
 * Formata a duração em minutos para o formato HH:MM
 * @param {number} minutes - Duração em minutos
 * @returns {string} Duração formatada
 */
export const formatDuration = (minutes) => {
  if (!minutes) return '--:--';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

/**
 * Formata a data para o formato brasileiro
 * @param {string} dateString - Data no formato ISO
 * @returns {string} Data formatada
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('pt-BR', options);
};

/**
 * Limita o tamanho de um texto e adiciona "..." se necessário
 * @param {string} text - Texto a ser truncado
 * @param {number} maxLength - Tamanho máximo do texto
 * @returns {string} Texto truncado
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Converte links do Google Drive para links diretos de reprodução
 * @param {string} url - URL do vídeo (pode ser do Google Drive ou outro)
 * @returns {string|string[]} URL formatada para reprodução direta ou array de URLs para tentativas
 */
export const getVideoSource = (url) => {
  if (!url) return null;

  // Se for um link do Google Drive, converte para link direto
  if (url.includes('drive.google.com')) {
    try {
      // Extrai o ID do arquivo do link (diferentes formatos de URL)
      let fileId = '';

      // Formato 1: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
      const fileMatch = url.match(/\/file\/d\/([\w-]+)/);
      // Formato 2: https://drive.google.com/open?id=FILE_ID
      const openMatch = url.match(/[&?]id=([\w-]+)/);
      // Formato 3: Apenas o ID
      const directMatch = url.match(/^[\w-]{25,}$/);

      if (fileMatch && fileMatch[1]) {
        fileId = fileMatch[1];
      } else if (openMatch && openMatch[1]) {
        fileId = openMatch[1];
      } else if (directMatch) {
        fileId = directMatch[0];
      } else {
        console.warn('Não foi possível extrair o ID do arquivo do Google Drive:', url);
        return url; // Retorna o original se não conseguir extrair o ID
      }

      console.log('ID do arquivo extraído:', fileId);

      // Lista de formatos de URL para tentar, em ordem de preferência
      const videoUrls = [
        // Link de visualização direta (funciona para a maioria dos vídeos)
        `https://drive.google.com/uc?export=view&id=${fileId}`,
        // Link de incorporação (pode funcionar para alguns vídeos)
        `https://drive.google.com/file/d/${fileId}/preview`,
        // Link de download direto (pode forçar o download em vez de reproduzir)
        `https://drive.google.com/uc?export=download&id=${fileId}`,
        // Link de visualização direta (alternativo)
        `https://drive.google.com/uc?id=${fileId}`,
        // Link de streaming (pode funcionar para alguns formatos)
        `https://docs.google.com/uc?export=download&id=${fileId}`,
        // Link de incorporação alternativo
        `https://drive.google.com/uc?export=media&id=${fileId}`,
        // Link original como último recurso
        url
      ];

      console.log('URLs que serão tentadas:', videoUrls);
      return videoUrls;
    } catch (error) {
      console.error('Erro ao processar link do Google Drive:', error);
      return url; // Em caso de erro, retorna o link original
    }
  }

  // Para outros tipos de links, retorna como está
  return url;
};
