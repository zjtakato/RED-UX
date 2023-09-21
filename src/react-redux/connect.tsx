import React, { useEffect, useReducer, useRef } from 'react';
import { useContext } from 'react';
import StoreContext from './context';
import { bindActionCreator } from '../redux';

export default function connect(mapStateToProps: any, mapDispatchToProps: any) {
  if (!mapStateToProps) {
    mapStateToProps = () => {
      return {};
    };
  }

  if (!mapDispatchToProps) {
    mapDispatchToProps = (dispatch: Function) => {
      return { dispatch };
    };
  }

  return function currying(Component: React.FC) {
    return function HOC(props: any) {
      const { store } = useContext(StoreContext);
      const [, forceRender] = useReducer((_) => _ + 1, 0);
      const latestStoreState = useRef(store.getState());
      const latestSelectedState = useRef(mapStateToProps(latestStoreState.current));
      useEffect(() => {
        function checkUpdate() {
          const newState = store.getState();
          if (newState === latestStoreState) return;
          const newSelectedState = mapStateToProps(newState);
          if (newSelectedState !== latestSelectedState.current) {
            latestSelectedState.current = newSelectedState;
            latestStoreState.current = newState;
            forceRender();
          }
        }
        const unsubscribe = store.subscribe(checkUpdate);
        return () => unsubscribe();
      }, [store]);

      let dispatchProps: any;
      if (typeof mapDispatchToProps === 'function') {
        dispatchProps = mapDispatchToProps(store.dispatch);
      } else {
        dispatchProps = bindActionCreator(mapDispatchToProps, store.dispatch);
      }

      return <Component {...props} {...latestSelectedState.current} {...dispatchProps} />;
    };
  };
}
