export default function createStore(reducer: Function, initialState: any, enhancer: Function) {
  if (typeof enhancer !== 'undefined') {
    return enhancer(createStore)(reducer, initialState);
  }

  let currentReducer = reducer;
  let currentState = initialState;
  let currentListeners = [];
  let nextListeners = currentListeners;

  return {
    getState() {
      return currentState;
    },
    dispatch(action: { type: string; payload: any }) {
      currentState = currentReducer(currentState, action);
      const listeners = (currentListeners = nextListeners);
      for (let i = 0; i < listeners.length; i++) {
        const listener = listeners[i];
        listener();
      }
      return action;
    },
    subscribe(listener: Function) {
      currentListeners.push(listener);
      const unsubscribe = () => {
        const index = nextListeners.indexOf(listener);
        nextListeners.splice(index, 1);
      };
      return unsubscribe;
    },
  };
}
