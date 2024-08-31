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