const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const BlacklistedToken = require('../models/BlacklistedToken');
const auth = require('../middleware/auth'); // أضف هذا
const router = express.Router();

// تسجيل الدخول
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401).json({ message: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
        }

        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        // تحديث وقت آخر تسجيل دخول
        user.lastLogin = new Date();
        await user.save();

        res.json({
            success: true,
            token,
            user: {
                username: user.username,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'حدث خطأ في تسجيل الدخول' });
    }
});

// تسجيل الخروج
router.post('/logout', auth, async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ message: 'يرجى تسجيل الدخول' });
        }

        // إضافة التوكن إلى القائمة السوداء
        await BlacklistedToken.create({ token });

        // تحديث وقت آخر تسجيل خروج
        const user = await User.findById(req.user.userId);
        if (user) {
            user.lastLogout = new Date();
            await user.save();
        }

        res.json({ 
            success: true,
            message: 'تم تسجيل الخروج بنجاح' 
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ message: 'حدث خطأ في تسجيل الخروج' });
    }
});

// التحقق من صلاحية التوكن
router.get('/verify', auth, (req, res) => {
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

module.exports = router;