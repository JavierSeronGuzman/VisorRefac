import { createAction, props } from "@ngrx/store";
import { RouteOption } from "../models/route-option.model";

export const  menuAction = createAction("[Menu] Change State",props<{ newstate: string }>());

export const setRoutes = createAction("[Map] Set Routes", props<{routes: RouteOption[]}>());
export const selectRoute = createAction("[Map] Select Route", props<{routeId: number}>());