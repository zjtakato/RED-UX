function createThunkMiddleware(extraArgument?) {
  return ({ dispatch, getState }) =>
    (next: any) =>
    (action: any) => {
      if (typeof action === 'function') {
        return action(dispatch, getState, extraArgument);
      }
      return next(action);
    };
}

const thunk = createThunkMiddleware() as any;
thunk.withExtraArgument = createThunkMiddleware;

export default thunk;
