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
  return text.substring(0, maxLength) + '...';
};
