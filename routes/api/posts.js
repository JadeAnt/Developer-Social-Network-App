const express = require('express');
const router = express.Router();
const {check, validationResult} = require('express-validator');
const auth = require('../../middleware/auth');

//The created models
const Post = require('../../models/Post');
const Profile = require('../../models/Profile');
const User = require('../../models/User');

// @route   POST api/posts
// @desc    Create a post
// @access  Public

router.post('/', [auth, [
    check('text', 'Text is required' ).not().isEmpty()
]], async (req,res)=>{
    
    //Error checking
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }

    try {
        const user = await User.findById(req.user.id).select('-password');

        const newPost = new Post({
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        });

        const post = await newPost.save();

        res.json(post); //once we add the post we'll get it back in our response
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
    
});

// @route   GET api/posts
// @desc    Get all posts
// @access  Private

router.get('/', auth, async (req,res) =>{
    try {
        const posts = await Post.find().sort({date: -1}); // get the most recent posts by date

        res.json(posts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/posts/:id
// @desc    Get post by ID
// @access  Private

router.get('/:id', auth, async (req,res) =>{
    try {
        const post = await Post.findById(req.params.id); // get the post by id

        if(!post){ //if post doesnt exist pass error message
            return res.status(404).json({msg : 'Post not found'});
        }

        res.json(post);
    } catch (err) {
        console.error(err.message);
        if(err.kind == 'ObjectId'){ //if post doesnt exist pass due to being different kind
            return res.status(404).json({msg : 'Post not found'});
        }
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/posts/:id
// @desc    Delete a post
// @access  Private

router.delete('/:id', auth, async (req,res) =>{
    try {
        const post = await Post.findById(req.params.id); // get the post by id

        // Check if Post exists
        if(!post){ //if post doesnt exist pass error message
            return res.status(404).json({msg : 'Post not found'});
        }

        // Check User
        // need to make sure the user thats deleting the post is the user that owns the post
        if(post.user.toString() !== req.user.id){
            return res.status(401).json({msg: 'User not authorized'});
        }

        //await post.remove(); //depricated
        await post.deleteOne();

        res.json({msg: 'Post Removed'});
    } catch (err) {
        console.error(err.message);
        if(err.kind == 'ObjectId'){ //if post doesnt exist pass due to being different kind
            return res.status(404).json({msg : 'Post not found'});
        }
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/posts/like/:id
// @desc    Like a post
// @access  Private

router.put('/like/:id', auth, async (req, res) =>{
    try {
        const post = await Post.findById(req.params.id); // get the post by id

        //Check if post has already been liked by this user
        // > 0 means true
        if(post.likes.filter(like => like.user.toString() === req.user.id).length > 0){
            return res.status(400).json({msg: 'Post already liked'});
        }

        post.likes.unshift({user: req.user.id});

        await post.save();

        res.json(post.likes); //the response

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// @route   PUT api/posts/unlike/:id
// @desc    Unlike a post
// @access  Private

router.put('/unlike/:id', auth, async (req, res) =>{
    try {
        const post = await Post.findById(req.params.id); // get the post by id

        //Check if post has already been liked by this user
        // > 0 means true
        if(post.likes.filter(like => like.user.toString() === req.user.id).length === 0){
            return res.status(400).json({msg: 'Post has not yet been liked'});
        }

        // Get remove index
        const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id);

        post.likes.splice(removeIndex,1);

        await post.save();

        res.json(post.likes); //the response

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


// @route   POST api/posts/comment/:id
// @desc    Comment on a post
// @access  Private

router.post('/comment/:id', [auth, [
    check('text', 'Text is required' ).not().isEmpty()
]], async (req,res)=>{
    
    //Error checking
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }

    try {
        const user = await User.findById(req.user.id).select('-password');
        const post = await Post.findById(req.params.id);

        const newComment = {
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        };

        post.comments.unshift(newComment); //unshift adds to beginning

        await post.save();

        res.json(post.comments); //once we add the post we'll get it back in our response
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
    
});

// @route   DELETE api/posts/comment/:id/:comment_id
// @desc    Delete a post
// @access  Private

router.delete('/comment/:id/:comment_id', auth, async (req, res)=>{
    try {
        const post = await Post.findById(req.params.id);

        // Get comment
        const comment = post.comments.find(comment => comment.id === req.params.comment_id);

        // make sure comment exists
        if(!comment){
            return res.status(404).json({msg: "Comment does not exist"});
        }

        // Check user
        if(comment.user.toString() !== req.user.id){
            return res.status(404).json({msg: "User not authorized"});
        }

        // Get remove index
        const removeIndex = post.comments.map(comment => comment.user.toString()).indexOf(req.user.id);

        post.comments.splice(removeIndex,1);

        await post.save();

        res.json(post.comments);
        
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;