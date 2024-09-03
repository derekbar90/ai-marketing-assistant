export const getEventEmoji = (contentType) => {
  switch (contentType.toLowerCase()) {
    case 'meeting':
      return '📅';
    case 'call':
      return '📞';
    case 'blog':
      return '📝';
    case 'task':
      return '📝';
    case 'tweet':
      return '🐥';
    default:
      return '🔔';
  }
};

export const generateUniqueId = () => {
  return '_' + Math.random().toString(36).substr(2, 9);
};