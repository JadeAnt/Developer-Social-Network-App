import {SET_ALERT, REMOVE_ALERT} from '../actions/types';

const initialState = [];

export default function(state = initialState, action){
    const {type, payload} = action; //get the type and payload from action

    switch(type){
        case SET_ALERT: //Return an array with the payload
            return [...state, payload];
        case REMOVE_ALERT: //Remove a specific alert by ID
            return state.filter((alert) => alert.id !== payload);
        default: //every reducer always has a default return of state
            return state;
    }
}