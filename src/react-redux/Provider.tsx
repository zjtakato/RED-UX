import React from 'react';
import StoreContext from './context';

export default function Provider(props: { store: any; children: JSX.Element }) {
  return <StoreContext.Provider value={{ store: props.store }}>{props.children}</StoreContext.Provider>;
}