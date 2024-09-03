export const getEventEmoji = (contentType) => {
  switch (contentType.toLowerCase()) {
    case 'meeting':
      return '📅';
    case 'call':
      return '📞';
    case 'Blog':
      return '📝';
    case 'task':
      return '📝';
    case 'Tweet':
      return '🐥';
    default:
      return '🔔';
  }
};

export const generateUniqueId = () => {
  return '_' + Math.random().toString(36).substr(2, 9);
};