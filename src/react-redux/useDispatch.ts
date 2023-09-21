import { useContext } from 'react';
import StoreContext from './context';

export default function useDispatch() {
  const { store } = useContext(StoreContext);
  return store.dispatch;
}
