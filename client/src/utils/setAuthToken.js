import axios from 'axios';

const setAuthToken = token => { //sets the header with the token, IF there is a token
    if(token){
        axios.defaults.headers.common['x-auth-token'] = token;
    }
    else{
        delete axios.defaults.headers.common['x-auth-token']; // if token is not correct, delete it 
    }
}

export default setAuthToken;