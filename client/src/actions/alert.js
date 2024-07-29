import { SET_ALERT, REMOVE_ALERT } from "./types";
import {v4 as uuidv4} from 'uuid';

export const setAlert = (msg, alertType, timeout=5000) => dispatch => {
    const id = uuidv4(); //gives a random long string
    dispatch({
        type: SET_ALERT,
        payload: {msg, alertType, id}
    });
    //after 5 seconds dispatch the alert (basically removing it)
    setTimeout(() => dispatch({type: REMOVE_ALERT, payload: id}), timeout); 
};