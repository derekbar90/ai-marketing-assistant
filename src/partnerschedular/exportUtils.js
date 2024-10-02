export const exportToCSV = (schedule) => {
    const headers = ['date', 'platform', 'type', 'timeframe'];
    const csvContent = [
      headers.join(','),
      ...schedule.map(event => [
        event.date.toDateString(),
        event.partner.name,
        event.contentType,
        event.timeSlot
      ].join(','))
    ].join('\n');
  
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'schedule.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };