export default function bindActionCreator(actionCreator: any, dispatch: Function) {
  return function (this, ...args) {
    return dispatch(actionCreator.apply(this, args));
  };
}
