import express from 'express';
import {protectRoute} from '../middlwares/authMiddlware.js';
import multer from 'multer';
import path from 'path';
import User from '../models/userSchema.js';
import Post from '../models/postSchema.js';
const router = express.Router()

// set up storage engine using multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // تعيين اسم فريد للملف
    }
})

// initlize upload variable with the storage engine
const upload = multer({ storage: storage });

// home route
router.get('/', (req, res) => {
    res.render('index', {title: 'Home Page', active: 'home'});
});

// router for my posts page
router.get('/my-posts', protectRoute, async (req, res) => {

    try{
        const userId = req.session.user._id;
        const user = await User.findById(userId).populate('posts');

        if(!user){ 
            req.flash('error', 'User not found!');
            res.redirect('/')
        }


        res.render('posts/my-posts', { title: 'My Posts Page', active: 'my_posts', posts: user.posts })

    }catch(error){
        console.error(error);
        req.flash('error', 'Something went wrong!');
        res.redirect('/create-posts')
    }
    
})

// router for creat new posts page
router.get('/create-posts', protectRoute, async (req, res) => {

    res.render('posts/create-posts', { title: 'Create new Posts', active: 'create_posts'})

})

// router for edit posts
router.get('/edit-post/:id', protectRoute, (req, res) => {
    res.render('posts/edit-post', { title: 'Edit Page', active: 'edit_posts' })
}) 

// router for view posts in detail
router.get('/post/:id', (req, res) => {
    res.render('posts/view-posts', { title: 'View Page', active: 'view_posts' })
}) 

// handle creat new post requist
router.post('/create-posts', protectRoute, upload.single('image'), async (req, res) => {
  
    try{
        const {title, content} = req.body;
        const image = req.file.filename;

        const slug = title.replace(/\s+/g, '-').toLowerCase();

        const user = await User.findById(req.session.user._id);

        // create new post
        const post = new Post({title, content, slug, image, user});
        


        // save posts in user array (userSchema)
        await User.updateOne({_id: req.session.user._id}, {$push: {posts: post._id}});

        await post.save();

        req.flash('success', 'Post saved successfully!');
        res.redirect('/my-posts')

        
    }catch(error){
        console.error(error);
        req.flash('error', 'Something went wrong!');
        res.redirect('/create-posts')
    }
});


export default router;