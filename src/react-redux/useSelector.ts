import { useContext, useEffect, useReducer, useRef } from 'react';
import StoreContext from './context';

export default function useSelector(selector: (state: any) => any) {
  const { store } = useContext(StoreContext);
  const [, forceRender] = useReducer((_) => _ + 1, 0);
  const latestStoreState = useRef(store.getState());
  const latestSelectedState = useRef(selector(latestStoreState.current));

  useEffect(() => {
    function checkUpdate() {
      const newState = store.getState();
      if (newState === latestStoreState) return;
      const newSelectedState = selector(newState);
      if (newSelectedState !== latestSelectedState.current) {
        latestSelectedState.current = newSelectedState;
        latestStoreState.current = newState;
        forceRender();
      }
    }
    const unsubscribe = store.subscribe(checkUpdate);
    return () => unsubscribe();
  }, [store]);

  return latestSelectedState.current;
}