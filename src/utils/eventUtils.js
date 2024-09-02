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