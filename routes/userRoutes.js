const router = require('express').Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth');

// تسجيل الدخول
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log('محاولة تسجيل دخول:', username); // للتتبع

        // البحث عن المستخدم
        const user = await User.findOne({ username });
        if (!user) {
            console.log('المستخدم غير موجود:', username);
            return res.status(401).json({ message: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
        }

        // التحقق من كلمة المرور
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('كلمة المرور غير صحيحة للمستخدم:', username);
            return res.status(401).json({ message: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
        }

        // إنشاء token
        const token = jwt.sign(
            { 
                userId: user._id,
                role: user.role 
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        console.log('تم تسجيل الدخول بنجاح:', username);
        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                username: user.username,
                role: user.role
            }
        });
    } catch (error) {
        console.error('خطأ في تسجيل الدخول:', error);
        res.status(500).json({ message: 'خطأ في الخادم' });
    }
});

// التحقق من التوكن
router.get('/verify-token', auth, (req, res) => {
    try {
        res.json({ valid: true, user: req.user });
    } catch (error) {
        res.status(401).json({ message: 'توكن غير صالح' });
    }
});

// تسجيل الخروج
router.post('/logout', auth, (req, res) => {
    try {
        // يمكن إضافة منطق إضافي هنا مثل إدراج التوكن في القائمة السوداء
        console.log('تم تسجيل الخروج للمستخدم:', req.user.userId);
        res.json({ success: true, message: 'تم تسجيل الخروج بنجاح' });
    } catch (error) {
        console.error('خطأ في تسجيل الخروج:', error);
        res.status(500).json({ message: 'خطأ في الخادم' });
    }
});

// تحديث الملف الشخصي
router.put('/update-profile', auth, async function(req, res) {
    try {
        const { fullName, email, phone } = req.body;
        const updatedUser = await User.findByIdAndUpdate(
            req.user.userId,
            { fullName, email, phone },
            { new: true }
        ).select('-password');

        res.json({ success: true, user: updatedUser });
    } catch (error) {
        console.error('خطأ في تحديث البيانات:', error);
        res.status(500).json({ message: 'خطأ في تحديث البيانات' });
    }
});

// جلب معلومات المستخدم
router.get('/profile', auth, async function(req, res) {
    try {
        const user = await User.findById(req.user.userId)
            .select('-password');
        
        if (!user) {
            return res.status(404).json({ message: 'لم يتم العثور على المستخدم' });
        }

        res.json(user);
    } catch (error) {
        console.error('خطأ في جلب البيانات:', error);
        res.status(500).json({ message: 'خطأ في جلب البيانات' });
    }
});

module.exports = router;