const jwt = require('jsonwebtoken');
const config = require('config');

//A middle ware function is a function that has access to req and response 
// and next is called so we can move on to next piece of middle ware
module.exports = function(req, res, next){
    //Get token from header
    const token = req.header('x-auth-token');

    //Check if not token
    if(!token){
        return res.status(401).json({msg: 'No token, authorization denied'});
    }

    // Verify token
    try{
        const decoded = jwt.verify(token, config.get('jwtSecret')); //decodes the token

        req.user = decoded.user;
        next(); //next moves onto next piece of middleware
    }catch(err){
        res.status(401).json({msg:'Token is not valid'});
    }
}