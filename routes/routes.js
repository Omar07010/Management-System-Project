import express from 'express';
import User from '../models/userSchema.js'; // had schema khasa b l user
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import {guestRoute, protectRoute} from '../middlwares/authMiddlware.js'

const router = express.Router();


// NODE MAILER MESSAGES
var transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "60cba7cf0bf5d5",
      pass: "50adee9441345f"
    }
  });


// login page routes
router.get('/login', guestRoute, (req, res) => {
    res.render('login', {title: 'Login Page', active: 'login'});
});

// register page routes
router.get('/register', guestRoute, (req, res) => {
    res.render('register', {title: 'Register Page', active: 'register'});
});

// forgote password page routes
router.get('/forgot-password', guestRoute, (req, res) => {
    res.render('forgot-password', {title: 'Forgot Password Page', active: 'forgot'});
});

// reset password page routes
router.get('/reset-password/:token', guestRoute, async (req, res) => {
    const { token } = req.params;
    const user = await User.findOne({ token })
    if (!user) {
        req.flash('error', 'link expired or invalid!');
        return res.redirect('/forgot-password')
    }

    res.render('reset-password', {title: 'Reset Password Page', active: 'reset', token});
});
// profile page routes
router.get('/profile', protectRoute, (req, res) => {
    res.render('profile', {title: 'Profile Page', active: 'profile'});
});



router.post('/register', guestRoute, async (req, res) => {
    const {name, email, password} = req.body;
    try {
        const userExist = await User.findOne({email});
        if (userExist) {
            req.flash('error', 'email or password already exist!');
            res.redirect('/login')
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            name,
            email,
            password: hashedPassword
        })
        if (!user) {
            user.save();
        }      
        req.flash('success', 'User registered successfully!')
        res.redirect('/login')
    }
    
    catch(error){
        console.error(error);
        req.flash('error', 'Somthing wont wrong, please try again!')
        res.redirect('/register');
    }
});

router.post('/login', guestRoute, async (req, res) => {
    const {email, password} = req.body;
    try{
        const user = await User.findOne({email});
        if (user && (await bcrypt.compare(password, user.password))) {
            req.session.user = user;
            res.redirect('/profile')
        }else{
            req.flash('error', 'Invalaid email or password');
            res.redirect('/login')
        }
        
    }
    catch(error){
        console.error(error);
        req.flash('error', 'Somthing wont wrong, please try again!')
        res.redirect('/login');
    }
})



// handle forgot password
router.post('/forgot-password', async (req, res) => {
    const {email} = req.body;
    try{
        const user = await User.findOne({email});
        if (!user) {
            req.flash('error', 'Email not found!');
            return res.redirect('/forgot-password')
        }

        const token = Math.random().toString(36).slice(2);
        user.token = token;
        await user.save();
        const info = await transport.sendMail({
            from: '"System Managment" <info@managment.com>', // sender address
            to: email, // list of receivers
            subject: "Password reset ✔", // Subject line
            text: "Please reset your password", // plain text body
            html: `<p>Click here to reset your password: <a href='http://localhost:3000/reset-password/${token}'> Reset password </a> <br>Thank you! </p>`, // html body
          });

          if (info.messageId) {
            req.flash('success', 'Password resent link ha been sented to your email, Please check!');
            res.redirect('/forgot-password')
          } else {
            req.flash('error', 'error sending email!');
            res.redirect('/forgot-password')
          }
    }catch(error){
        console.error(error);
        req.flash('error', 'Somthing wont wrong, please try again!')
        res.redirect('/register');
    }
    
});

// handle logout route
router.post('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/')
})

// handle reset password post requist
router.post('/reset-password', async (req, res) => {
    const {token, new_password, confirm_new_password} = req.body;
    
    try{

      const user = await User.findOne({token});
        if(new_password !== confirm_new_password){
            req.flash('error', "Password dosn't match!")
            res.redirect(`/reset-password/${token}`);
        }

        if(!user){
            req.flash('error', 'Invalid token');
            return res.redirect('/forgot-password');
        }
        
        user.password = await bcrypt.hash(new_password, 10);
        user.token = null;
        await user.save();
        req.flash('success', 'Password reset successfully')
        res.redirect('/login')

    }
    catch(error){
        console.error(error);
        req.flash('error', 'Somthing wont wrong, please try again!')
        res.redirect('/reset-password');
    }
})


export default router;