const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const {check, validationResult} = require('express-validator');
const jwt = require('jsonwebtoken');
const config = require('config');
const bcrypt = require('bcryptjs');


const User = require('../../models/User');

// @route   GET api/auth
// @desc    Test route
// @access  Public

//Adding in auth like this referencing the middleware will automatically make it work, making this route protected
router.get('/', auth, async (req,res)=>{
    try {
        const user = await User.findById(req.user.id).select('-password'); //because we pass user id in the request
        // -password will leave out the password in the data
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// @route   POST api/auth
// @desc    Authenticate user & get token
// @access  Public

router.post('/', 
    [
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Password is required').exists()
    ], 
    async (req,res)=>{
        //Get an array of errors back when something goes wrong with request info
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({errors: errors.array()});
        }

        const {email, password} = req.body; //get specific data from request body

        try{

            // See if user exists
            let user = await User.findOne({email}); //allows to search by one field, await because async function

            //If user doesnt exist send error
            if(!user){
                return res.status(400).json({errors: [{msg: 'Invalid Credentials'}]});
            }

            const isMatch = await bcrypt.compare(password, user.password); //compares a plain text and encrypted password to see if they match

            if (!isMatch){
                return res.status(400).json({errors: [{msg: 'Invalid Credentials'}]});
            }
            
            // Return jsonwebtoken
            //get the payload with user id
            const payload = {
                user:{
                    id: user.id //with mongoose its .id as its an abstraction of mongodb's id object, normally it would be ._id
                }
            };

            //sign the jwt token
            jwt.sign(
                payload, 
                config.get('jwtSecret'),
                {expiresIn: 360000}, //wants to be 3600 in deployment so its quick, for productions its longer
                (err, token) => { //either get the token or an error, without an error we send token to user
                    if(err) throw err;
                    res.json({token});
                }
            );

        }catch(err){
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);

module.exports = router;