import { createReducer, on } from "@ngrx/store";
import { menuAction, selectRoute, setRoutes } from "./menu.action";
import { RouteOption } from "../models/route-option.model";


export const initialStateMenu = 'controls';

export interface RouteState {
    routes: RouteOption[];
    selectedRouteId: number | null;
}

export const initialState: RouteState = {
    routes: [],
    selectedRouteId: null
}




export const menuReducer = createReducer(
    initialStateMenu,
    on(menuAction, (state, { newstate }) => {
        state = newstate;
        return state;
    })
)

export const routesReducer = createReducer(
    initialState,
    on(setRoutes, (state, { routes }) => ({ ...state, routes})),
    on(selectRoute, (state, { routeId }) => ({ ...state, selectedRouteId: routeId }))
    );

