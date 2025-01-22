const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const auth = require('./middleware/auth');
const User = require('./models/User');
const BlacklistedToken = require('./models/BlacklistedToken');
require('dotenv').config();

// إعداد التطبيق
const app = express();

// Middleware الأساسي
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// الاتصال بقاعدة البيانات
mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('Connected to MongoDB Successfully');
        try {
            // التحقق من وجود حساب الأدمن وإنشائه إذا لم يكن موجوداً
            const adminExists = await User.findOne({ username: 'admin' });
            if (!adminExists) {
                const mainAdmin = new User({
                    username: 'admin',
                    password: await bcrypt.hash('admin123456', 10),
                    role: 'admin'
                });
                await mainAdmin.save();
                console.log('Main admin account created');
            }
        } catch (error) {
            console.error('Error in initial setup:', error);
        }
    })
    .catch(err => {
        console.error('MongoDB Connection Error:', err);
    });

// تكوين المسارات
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', auth, require('./routes/userRoutes'));
app.use('/api/bookings', auth, require('./routes/bookingRoutes'));
app.use('/api/admin', auth, require('./routes/adminRoutes'));


app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'بيانات الدخول غير صحيحة' });
        }

        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ token, user: { role: user.role } });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'خطأ في الخادم الداخلي' });
    }
});
// مسار تسجيل الخروج
app.post('/logout', auth, async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ message: 'يرجى تسجيل الدخول' });
        }

        // إضافة التوكن إلى القائمة السوداء
        const blacklistedToken = new BlacklistedToken({ token });
        await blacklistedToken.save();

        // تحديث وقت آخر تسجيل خروج
        const user = await User.findById(req.user.userId);
        if (user) {
            user.lastLogout = new Date();
            await user.save();
        }

        res.json({ message: 'تم تسجيل الخروج بنجاح' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ message: 'حدث خطأ في تسجيل الخروج' });
    }
});

// المسارات العامة
const publicPages = ['', 'login', 'register', 'services', 'about', 'contact', 'news', 'faq', 'testimonials', 'booking'];
publicPages.forEach(page => {
    app.get(`/${page}`, (req, res) => {
        const filePath = page === '' ? 'index.html' : `${page}.html`;
        res.sendFile(path.join(__dirname, 'public', 'pages', filePath));
    });
});

// المسارات المحمية
app.get('/admin', auth, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.redirect('/login');
    }
    res.sendFile(path.join(__dirname, 'public', 'pages', 'admin.html'));
});

app.get('/patient', auth, (req, res) => {
    if (req.user.role !== 'user') {
        return res.redirect('/login');
    }
    res.sendFile(path.join(__dirname, 'public', 'pages', 'patient.html'));
});

// مسار التحقق من التوكن
app.get('/api/auth/verify', auth, (req, res) => {
    try {
        res.json({ 
            valid: true, 
            user: {
                userId: req.user.userId,
                role: req.user.role
            }
        });
    } catch (error) {
        res.status(401).json({ 
            valid: false,
            message: 'Token invalid'
        });
    }
});

// مسار التحقق من التوكن
app.get('/api/auth-token', auth, (req, res) => {
    try {
        res.json({ valid: true });
    } catch (error) {
        res.status(401).json({ valid: false });
    }
});

// معالجة امتداد .html
app.use((req, res, next) => {
    if (req.path.includes('.html')) {
        const newPath = req.path.replace('.html', '');
        return res.redirect(newPath);
    }
    next();
});

// معالجة المسارات غير الموجودة
app.get('*', (req, res) => {
    res.status(404).send('الصفحة غير موجودة');
});

// تشغيل السيرفر
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

// معالجة الأخطاء العامة
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({ 
        success: false,
        message: 'حدث خطأ في الخادم'
    });
});

module.exports = app;