export const initialState = {
  partners: [],
  schedule: [],
  preferences: {
    contentType: 'tweet', // Add a default content type
    contentTypes: ['tweet', 'blog'],
    timeSlots: ['morning', 'afternoon', 'evening'],
  },
  currentMonth: new Date(),
};

  export const appReducer = (state, action) => {
    switch (action.type) {
      case 'ADD_PARTNER':
        return { ...state, partners: [...state.partners, action.payload] };
      case 'REMOVE_PARTNER':
        return { ...state, partners: state.partners.filter(partner => partner.id !== action.payload) };
      case 'SET_SCHEDULE':
        return { ...state, schedule: action.payload };
      case 'UPDATE_PREFERENCES':
        return { ...state, preferences: { ...state.preferences, ...action.payload } };
      case 'SET_CURRENT_MONTH':
        return { ...state, currentMonth: action.payload };
      default:
        return state;
    }
  };