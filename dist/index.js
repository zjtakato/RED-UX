import React, { createContext, useContext, useReducer, useRef, useEffect } from 'react';

/**
 * 将多个reducer组合成一个
 * @param {ReducerMap} reducers
 * @returns {Reducer}
 */
function combineReducers(reducers) {
    const reducerKeys = Object.keys(reducers);
    const finalReducers = {};
    // base case
    for (let i = 0; i < reducerKeys.length; i++) {
        const key = reducerKeys[i];
        typeof reducerKeys[key] === 'function' && (finalReducers[key] = reducers[key]);
    }
    const finalReducerKeys = Object.keys(finalReducers);
    return function combination(state = {}, action) {
        const nextState = {};
        for (let i = 0; i < finalReducerKeys.length; i++) {
            const key = finalReducerKeys[i];
            const reducer = finalReducers[key];
            nextState[key] = reducer(state[key], action);
        }
        return nextState;
    };
}

function createStore(reducer, initialState, enhancer) {
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
        dispatch(action) {
            currentState = currentReducer(currentState, action);
            const listeners = (currentListeners = nextListeners);
            for (let i = 0; i < listeners.length; i++) {
                const listener = listeners[i];
                listener();
            }
            return action;
        },
        subscribe(listener) {
            currentListeners.push(listener);
            const unsubscribe = () => {
                const index = nextListeners.indexOf(listener);
                nextListeners.splice(index, 1);
            };
            return unsubscribe;
        },
    };
}

function compose(...funcs) {
    if (funcs.length === 0)
        return (arg) => arg;
    if (funcs.length === 1)
        return funcs[0];
    return funcs.reduce((a, b) => (...args) => a(b(...args)));
}

function bindActionCreator(actionCreator, dispatch) {
    return function (...args) {
        return dispatch(actionCreator.apply(this, args));
    };
}

const StoreContext = createContext(null);

function Provider(props) {
    return React.createElement(StoreContext.Provider, { value: { store: props.store } }, props.children);
}

function useDispatch() {
    const { store } = useContext(StoreContext);
    return store.dispatch;
}

function useSelector(selector) {
    const { store } = useContext(StoreContext);
    const [, forceRender] = useReducer((_) => _ + 1, 0);
    const latestStoreState = useRef(store.getState());
    const latestSelectedState = useRef(selector(latestStoreState.current));
    useEffect(() => {
        function checkUpdate() {
            const newState = store.getState();
            if (newState === latestStoreState)
                return;
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

function connect(mapStateToProps, mapDispatchToProps) {
    if (!mapStateToProps) {
        mapStateToProps = () => {
            return {};
        };
    }
    if (!mapDispatchToProps) {
        mapDispatchToProps = (dispatch) => {
            return { dispatch };
        };
    }
    return function currying(Component) {
        return function HOC(props) {
            const { store } = useContext(StoreContext);
            const [, forceRender] = useReducer((_) => _ + 1, 0);
            const latestStoreState = useRef(store.getState());
            const latestSelectedState = useRef(mapStateToProps(latestStoreState.current));
            useEffect(() => {
                function checkUpdate() {
                    const newState = store.getState();
                    if (newState === latestStoreState)
                        return;
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
            let dispatchProps;
            if (typeof mapDispatchToProps === 'function') {
                dispatchProps = mapDispatchToProps(store.dispatch);
            }
            else {
                dispatchProps = bindActionCreator(mapDispatchToProps, store.dispatch);
            }
            return React.createElement(Component, { ...props, ...latestSelectedState.current, ...dispatchProps });
        };
    };
}

function createThunkMiddleware(extraArgument) {
    return ({ dispatch, getState }) => (next) => (action) => {
        if (typeof action === 'function') {
            return action(dispatch, getState, extraArgument);
        }
        return next(action);
    };
}
const thunk = createThunkMiddleware();
thunk.withExtraArgument = createThunkMiddleware;

export { Provider, bindActionCreator, combineReducers, compose, connect as conenct, createStore, useDispatch, useSelector };
