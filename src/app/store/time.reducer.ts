import { createReducer, on } from "@ngrx/store"
import { timeAction } from "./time.action"


export interface TimeState { 
    h: number;
    m: number;
}
export const initialStateTime: TimeState = { h: 8, m: 0 };

export const timeReducer = createReducer(
    initialStateTime,
    on(timeAction, (state, { h, m }) => ({...state,
        h,
        m }))
)