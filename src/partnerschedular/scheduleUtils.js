export const generateSchedule = (state) => {
  const { partners, preferences } = state;
  const { blogLimitPerWeek } = preferences;

  const schedule = [];
  const start = new Date();
  const end = new Date(start.getFullYear(), start.getMonth() + 2, 0);
  const timeSlots = preferences.timeSlots;

  let blogCount = 0;
  let currentWeek = getWeekNumber(start);

  for (let date = start; date <= end; date.setDate(date.getDate() + 1)) {
    const weekNumber = getWeekNumber(date);
    if (weekNumber !== currentWeek) {
      currentWeek = weekNumber;
      blogCount = 0; // Reset blog count for the new week
    }

    for (const timeSlot of timeSlots) {
      const partner = selectPartner(partners);
      let contentType = selectContentType(preferences.contentTypes);

      if (contentType === 'Blog') {
        if (blogCount >= blogLimitPerWeek) {
          contentType = 'Tweet'; // Fallback to tweet if blog limit is reached
        } else {
          blogCount++;
        }
      }

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

const getWeekNumber = (date) => {
  const start = new Date(date.getFullYear(), 0, 1);
  const diff = (date - start + (start.getTimezoneOffset() - date.getTimezoneOffset()) * 60000) / 86400000;
  return Math.floor((diff + start.getDay() + 1) / 7);
};