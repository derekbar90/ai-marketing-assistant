export const generateSchedule = (state) => {
  const { partners, preferences } = state;
  
  const schedule = [];
  const start = new Date();
  const end = new Date(start.getFullYear(), start.getMonth() + 2, 0);
  const timeSlots = preferences.timeSlots;

  for (let date = start; date <= end; date.setDate(date.getDate() + 1)) {
    for (const timeSlot of timeSlots) {
      const partner = selectPartner(partners);
      const contentType = selectContentType(preferences.contentTypes);

      schedule.push({
        date: new Date(date),
        partner,
        contentType,
        timeSlot
      });
    }
  }

  return schedule;
};

const selectPartner = (partners) => {
  const totalWeight = partners.reduce((sum, partner) => sum + partner.weight, 0);
  let random = Math.random() * totalWeight;

  for (const partner of partners) {
    random -= partner.weight;
    if (random <= 0) {
      return partner;
    }
  }

  return partners[partners.length - 1]; // Fallback
};

const selectContentType = (contentTypes) => {
  return contentTypes[Math.floor(Math.random() * contentTypes.length)];
};

const selectTimeSlot = (timeSlots) => {
  return timeSlots[Math.floor(Math.random() * timeSlots.length)];
};