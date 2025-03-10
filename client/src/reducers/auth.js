import {
    REGISTER_SUCCESS,
    REGISTER_FAIL,
    USER_LOADED,
    AUTH_ERROR,
    LOGIN_SUCCESS,
    LOGIN_FAIL,
    LOGOUT,
    ACCOUNT_DELETED
} from '../actions/types';

const initialState = {
    token: localStorage.getItem('token'),
    isAuthenticated: null,
    loading: true,
    user: null
};

export default function(state=initialState, action){
    const {type, payload} = action; //getting the type and payload from action
    
    switch(type){
        case USER_LOADED:
            return {
                ...state,
                isAuthenticated: true,
                loading: false,
                user: payload
            };
        case REGISTER_SUCCESS:
        case LOGIN_SUCCESS: //does the same thing as register success, clears the auth state and clears the token from local storage
            localStorage.setItem('token', payload.token);
            return {
                ...state, // ... = whatver is currently there
                ...payload,
                isAuthenticated: true,
                loading: false
            };
        case REGISTER_FAIL:
        case AUTH_ERROR: //does the same thing as register fail, clears the auth state and clears the token from local storage
        case LOGIN_FAIL: //does the same thing as register fail, clears the auth state and clears the token from local storage
        case LOGOUT: //does the same thing as register fail, clears the auth state and clears the token from local storage
        case ACCOUNT_DELETED:    
            localStorage.removeItem('token');
            return {
                ...state, // ... = whatver is currently there
                token: null,
                isAuthenticated: false,
                loading: false
            };
        default:
            return state;
    }
}