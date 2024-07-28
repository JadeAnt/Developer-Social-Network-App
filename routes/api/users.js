// Install Packages
const express = require('express');
const router = express.Router();
const {check, validationResult} = require('express-validator');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');

//This is UserModel
const User = require('../../models/User');

// @route   POST api/users
// @desc    Register User
// @access  Public

// request = data sent, response = data returned
router.post('/', 
    [
        check('name', 'Name is required').not().isEmpty(),
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Please enter a password with 6 or more characters').isLength({
            min: 6
        })
    ], 
    async (req,res)=>{
        //Get an array of errors back when something goes wrong with request info
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({errors: errors.array()});
        }

        const {name, email, password} = req.body; //get specific data from request body

        try{

            // See if user exists
            let user = await User.findOne({email}); //allows to search by one field, await because async function

            //If user exists aready send error, dont want multiple of the same user
            if(user){
                return res.status(400).json({errors: [{msg: 'User already exists'}]});
            }

            // Get users gravatar, s = size, r = rating (pg13,R), d = default
            const avatar = gravatar.url(email,{
                s: '200',
                r: 'pg',
                d: 'mm'
            });
            
            //creates new instance of user (not saved to database yet)
            user = new User({
                name,
                email,
                avatar,
                password
            });
            
            // Encrypt password
            const salt = await bcrypt.genSalt(10);

            user.password = await bcrypt.hash(password, salt); //creates hash of user password

            await user.save(); //Saves user to database //anything that returns a promise add await

            // Return jsonwebtoken
            res.send('User registered');

        }catch(err){
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);

module.exports = router;