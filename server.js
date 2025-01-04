import express from 'express';
import dotenv from 'dotenv';
import connectDB from './db.js'; // استيراد دالة الاتصال بقاعدة البيانات
import router from './routes/routes.js';
import postRoutes from './routes/postRoutes.js';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import flash from 'connect-flash';
import path from 'path';

const app = express();

dotenv.config();

const PORT = process.env.PORT || 3000;
// connect mongoDB
connectDB();

// middlewares
app.use(express.json());
app.use(express.urlencoded({extended: false}));

//make upload directory as static
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))

// cookis middlware
app.use(cookieParser(process.env.COOKIE_SECRET));

//session middlware
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false, // لا تقم بإعادة حفظ الجلسة في كل طلب
    saveUninitialized: false, // لا تحفظ الجلسات الجديدة التي لم يتم تعديلها
    cookie: {
        maxAge: 6000 * 60 * 24 * 7, // مدة صلاحية الجلسة (1 week)
    }
}));

// flash messages
app.use(flash())

// store flash messages for viwes
        // إعداد middleware لتقديم الرسائل من `flash` إلى `locals`
app.use((req, res, next) => {
    res.locals.message = req.flash();
    next();
});

app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

// set ejs engine
app.set('view engine', 'ejs');

// using router
app.use('/', router);
app.use('/', postRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });