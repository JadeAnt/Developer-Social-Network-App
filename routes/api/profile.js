const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const {check, validationResult} = require('express-validator');

const Profile = require('../../models/Profile');
const User = require('../../models/User');

// @route   GET api/profile/me
// @desc    Get current users profile
// @access  Private

router.get('/me', auth, async (req,res)=>{
    try {
        const profile = await Profile.findOne({user: req.user.id}).populate('user', ['name', 'avatar']); //references object id of user from profile schema

        if(!profile){
            return res.status(400).json({msg: 'There is no profile for this user'});
        }

        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/profile
// @desc    Create or update a user profile
// @access  Private

router.post('/', [auth, [
    check('status', 'Status is required').not().isEmpty(),
    check('skills','Skills is required').not().isEmpty()
]], async (req, res)=>{

    //checks for body errors using above checks
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array});
    }
    // destructure the request
    const {
        company,
        website,
        location,
        bio,
        status,
        githubusername,
        skills,
        youtube,
        twitter,
        instagram,
        linkedin,
        facebook,
    } = req.body;

    //build profile object
    //check that the data is there before setting it
    const profileFields = {};
    profileFields.user = req.user.id;
    if(company) profileFields.company = company;
    if(website) profileFields.website = website;
    if(location) profileFields.location = location;
    if(bio) profileFields.bio = bio;
    if(status) profileFields.status = status;
    if(githubusername) profileFields.githubusername = githubusername;
    if(skills){
        profileFields.skills = skills.split(',').map(skill => skill.trim()); //because skills is an string and needs to be turned into a string
    }

    //build social object
    //check that the data is there before setting it
    profileFields.social = {}
    if(youtube) profileFields.social.youtube = youtube;
    if(twitter) profileFields.social.twitter = twitter;
    if(facebook) profileFields.social.facebook = facebook;
    if(linkedin) profileFields.social.linkedin = linkedin;
    if(instagram) profileFields.social.instagram = instagram;

    //with async await whenever using a mongoose method need to add await in front of it because it returns a promise
    
    try {
        let profile = await Profile.findOne({user: req.user.id});
        if(profile){
            //Update profile if we can find user
            profile = await Profile.findOneAndUpdate({
                user: req.user.id}, 
                {$set:profileFields}, 
                {new: true}
            );

            return res.json(profile);
        }

        //Create new profile if we cannot find user
        profile = new Profile(profileFields);

        await profile.save();
        res.json(profile); // sends profile we get
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// @route   GET api/profile
// @desc    Get all profiles
// @access  Public

router.get('/', async (req, res) => {
    try {
        const profiles = await Profile.find().populate('user',['name', 'avatar']);
        res.json(profiles); // sends profiles we get
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/profile/user/:user_id
// @desc    Get profile by user id
// @access  Public

router.get('/user/:user_id', async (req, res) => {
    try {
        const profile = await Profile.findOne({user: req.params.user_id}).populate('user',['name', 'avatar']);

        if(!profile) return res.status(400).json({msg: 'Profile not found'}); //check in case there is no profile

        res.json(profile); // sends profiles we get
    } catch (err) {
        console.error(err.message);
        if(err.kind == 'ObjectId'){ // for the objectId type of error
            return res.status(400).json({msg: 'Profile not found'}); //check in case there is no profile
        }
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/profile/
// @desc    Delete profile, user, & posts
// @access  Private

router.delete('/', auth, async (req, res) => {
    try {
        // @todo - remove users posts
        // Remove profile
        await Profile.findOneAndDelete({user: req.user.id});
        // Remove user
        await User.findOneAndDelete({_id: req.user.id});
        res.json({msg: 'User Deleted'}); // message to verify
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/profile/experience
// @desc    Add profile experience
// @access  Private
router.put('/experience', [auth,[
    check('title', 'Title is required').not().isEmpty(),
    check('company', 'Company is required').not().isEmpty(),
    check('from', 'From date is required').not().isEmpty()
]], async (req, res) =>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }
    
    const{
        title,
        company,
        location,
        from,
        to,
        current,
        description
    } = req.body;

    const newExp = {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    }
    try {
        const profile = await Profile.findOne({user: req.user.id});

        profile.experience.unshift(newExp);

        await profile.save();

        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;