type Reducer = (state: any, action: any) => any;
type ReducerMap = {
    [key: string]: Reducer;
};
/**
 * 将多个reducer组合成一个
 * @param {ReducerMap} reducers
 * @returns {Reducer}
 */
export default function combineReducers(reducers: ReducerMap): Reducer;
export {};
