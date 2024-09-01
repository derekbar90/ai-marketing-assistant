export const initialState = {
  partners: [],
  schedule: [],
  preferences: {
    contentType: 'tweet', // Add a default content type
    contentTypes: ['tweet', 'blog'],
    timeSlots: ['morning', 'afternoon', 'evening'],
    blogLimitPerWeek: 3, // Add blog limit per week
  },
  currentMonth: new Date(),
};

export const loadStateFromLocalStorage = () => {
  try {
    const serializedState = localStorage.getItem('appState');
    if (serializedState === null) {
      return initialState;
    }
    const loadedState = JSON.parse(serializedState);
    return {
      ...initialState,
      ...loadedState,
      currentMonth: new Date(loadedState?.currentMonth || initialState.currentMonth),
      preferences: {
        ...initialState.preferences,
        ...loadedState.preferences,
      },
    };
  } catch (err) {
    return initialState;
  }
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
    case 'UPDATE_PARTNER_WEIGHT':
      return { ...state, partners: action.payload };
    default:
      return state;
  }
};