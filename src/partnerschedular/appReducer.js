const templates = [
  {
    title: 'Partnership Announcement',
    content: `Context: Official announcement of a new collaboration
Guidance:
- State the names of the partnering entities
- Mention the specific area of blockchain they're collaborating in
- Include the official announcement date
- Suggest where to find more information (e.g., official website)`
  },
  {
    title: 'Technical Integration',
    content: `Context: Combining specific technologies or features
Guidance:
- Name the exact technologies or features being integrated
- State the primary purpose of the integration
- Mention any immediate, measurable outcomes if available
- Indicate where technical details can be found`
  },
  {
    title: 'Product Launch',
    content: `Context: Releasing a new product or service from the partnership
Guidance:
- Provide the official name of the new product/service
- State its primary function
- Mention the launch date
- Indicate where users can access or learn about the product`
  },
  {
    title: 'Event Announcement',
    content: `Context: Upcoming event related to the partnership
Guidance:
- State the event name, type (e.g., webinar, conference), and date
- Mention the main topic or purpose of the event
- Provide information on how to participate or register
- Include any notable speakers or presentations if confirmed`
  },
  {
    title: 'Milestone Achievement',
    content: `Context: Reaching a significant, measurable goal
Guidance:
- State the specific milestone achieved (e.g., number of transactions, users)
- Provide the exact figure or statistic
- Mention the timeframe in which this was achieved
- Indicate where verification or more details can be found`
  },
  {
    title: 'Protocol Update',
    content: `Context: Changes or improvements to the blockchain protocol
Guidance:
- Name the specific protocol being updated
- State the nature of the update (e.g., security patch, performance improvement)
- Mention the version number or update identifier
- Indicate where the full changelog or documentation is available`
  },
  {
    title: 'Community Initiative',
    content: `Context: Launch of a program for the blockchain community
Guidance:
- Name the specific initiative (e.g., grant program, educational series)
- State its primary objective
- Mention the start date or application deadline if applicable
- Provide information on how community members can participate`
  },
  {
    title: 'Research Publication',
    content: `Context: Release of a research paper or whitepaper
Guidance:
- Provide the title of the publication
- State the main topic or finding
- Mention the authors or institutions involved
- Indicate where the full paper can be accessed`
  },
  {
    title: 'Governance Update',
    content: `Context: Changes to the governance model or voting system
Guidance:
- State the specific aspect of governance being updated
- Mention any key changes in the process
- Provide the implementation date
- Indicate where detailed information about the changes can be found`
  },
  {
    title: 'Partnership Metric',
    content: `Context: Sharing a key performance indicator of the partnership
Guidance:
- State the specific metric being shared (e.g., transaction volume, network growth)
- Provide the exact figure or percentage
- Mention the timeframe this metric covers
- Indicate the source of this data or where more information can be found`
  }
];


export const initialState = {
  partners: [],
  schedule: [],
  templates: templates, // Ensure templates is initialized as an empty array
  preferences: {
    contentTypes: ['Tweet', 'Blog'],
    timeSlots: ['morning', 'afternoon', 'evening'],
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
      partners: Array.isArray(loadedState.partners) ? loadedState.partners : initialState.partners,
    };
  } catch (err) {
    return initialState;
  }
};

export const appReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_PARTNER':
      // Prevent adding duplicate "Self" partner
      if (action.payload.id === 'self' && state.partners.some(p => p.id === 'self')) {
        return state;
      }
      return { ...state, partners: [...state.partners, action.payload] };
    case 'REMOVE_PARTNER':
      // Prevent removing the "Self" partner
      if (action.payload === 'self') {
        return state;
      }
      return { ...state, partners: state.partners.filter(partner => partner.id !== action.payload) };
    case 'SET_SCHEDULE':
      return { ...state, schedule: action.payload };
    case 'UPDATE_PREFERENCES':
      return { ...state, preferences: { ...state.preferences, ...action.payload } };
    case 'SET_CURRENT_MONTH':
      return { ...state, currentMonth: action.payload };
    case 'UPDATE_PARTNER_WEIGHT':
      return { 
        ...state, 
        partners: state.partners.map(partner => 
          partner.id === action.payload.id ? action.payload : partner
        ) 
      };
    case 'UPDATE_EVENT_CONTENT':
      console.log('Updating event content. Payload:', action.payload);
      console.log('Current state:', state);
      const updatedSchedule = state.schedule.map(event =>
        event.id === action.payload.id
          ? {
              ...event,
              generatedContent: action.payload.content,
              isApproved: action.payload.isApproved,
              selectedIdea: action.payload.selectedIdea
            }
          : event
      );
      console.log('Updated schedule:', updatedSchedule);
      const newState = {
        ...state,
        schedule: updatedSchedule,
      };
      console.log('New state after update:', newState);
      return newState;

    case 'APPROVE_EVENT_CONTENT':
      return {
        ...state,
        schedule: state.schedule.map(event =>
          event.id === action.payload.id ? { ...event, isApproved: true } : event
        ),
      };
    case 'SET_TEMPLATES':
      return { ...state, templates: action.payload };
    case 'ADD_TEMPLATE':
      return { ...state, templates: [...state.templates, action.payload] };
    case 'UPDATE_TEMPLATE':
      return {
        ...state,
        templates: state.templates.map((template, index) =>
          index === action.payload.index ? action.payload.template : template
        ),
      };
    case 'UPDATE_PARTNER_TWITTER':
      return { 
        ...state, 
        partners: state.partners.map(partner => 
          partner.id === action.payload.id ? action.payload : partner
        ) 
      };
    default:
      return state;
  }
};