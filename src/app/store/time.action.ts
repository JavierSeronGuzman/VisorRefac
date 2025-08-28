import { createAction, props } from "@ngrx/store";


export const timeAction = createAction('Global time',props<{ h:number, m:number }>());