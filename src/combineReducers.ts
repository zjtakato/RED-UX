// TODO: 完善类型
type Reducer = (state: any, action: any) => any;
type ReducerMap = { [key: string]: Reducer };

/**
 * 将多个reducer组合成一个
 * @param {ReducerMap} reducers
 * @returns {Reducer}
 */
export default function combineReducers(reducers: ReducerMap): Reducer {
  const reducerKeys = Object.keys(reducers);
  const finalReducers = {};

  // base case
  for (let i = 0; i < reducerKeys.length; i++) {
    const key = reducerKeys[i];
    typeof reducerKeys[key] === 'function' && (finalReducers[key] = reducers[key]);
  }

  const finalReducerKeys = Object.keys(finalReducers);
  return function combination(state = {}, action) {
    let hasChanged = false;
    const nextState = {};
    for (let i = 0; i < finalReducerKeys.length; i++) {
      const key = finalReducerKeys[i];
      const reducer = finalReducers[key];

      const previousStateForKey = state[key];
      const nextStateForKey = reducer(previousStateForKey, action);

      nextState[key] = nextStateForKey;
      // 是否命中了子reducer
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
    }
    return hasChanged ? nextState : state;
  };
}
