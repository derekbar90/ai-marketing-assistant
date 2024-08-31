export const resolveConflicts = (schedule) => {
    const resolvedSchedule = [];
    const usedSlots = new Map(); // Change to Map to track used slots per day
  
    for (const event of schedule) {
      const day = event.date.toDateString();
      const slot = event.timeSlot;
      if (!usedSlots.has(day)) {
        usedSlots.set(day, new Set());
      }
      if (!usedSlots.get(day).has(slot)) {
        resolvedSchedule.push(event);
        usedSlots.get(day).add(slot);
      } else {
        // Find the next available slot
        const newSlot = findNextAvailableSlot(event, usedSlots);
        resolvedSchedule.push(newSlot);
        const newDay = newSlot.date.toDateString();
        if (!usedSlots.has(newDay)) {
          usedSlots.set(newDay, new Set());
        }
        usedSlots.get(newDay).add(newSlot.timeSlot);
      }
    }
  
    return resolvedSchedule;
  };
  
  const findNextAvailableSlot = (event, usedSlots) => {
    const timeSlots = ['morning', 'afternoon', 'evening'];
    let currentDate = new Date(event.date);
    let currentSlotIndex = timeSlots.indexOf(event.timeSlot);
  
    while (true) {
      currentSlotIndex = (currentSlotIndex + 1) % timeSlots.length;
      if (currentSlotIndex === 0) {
        // Move to the next day
        currentDate.setDate(currentDate.getDate() + 1);
      }
  
      const day = currentDate.toDateString();
      const slot = timeSlots[currentSlotIndex];
      if (!usedSlots.has(day)) {
        usedSlots.set(day, new Set());
      }
      if (!usedSlots.get(day).has(slot)) {
        return { ...event, date: new Date(currentDate), timeSlot: slot };
      }
    }
  };