const jwt = require('jsonwebtoken');
const BlacklistedToken = require('../models/BlacklistedToken');

async function auth(req, res, next) {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ message: 'يرجى تسجيل الدخول' });
        }

        // التحقق من أن التوكن غير موجود في القائمة السوداء
        const isBlacklisted = await BlacklistedToken.findOne({ token });
        if (isBlacklisted) {
            return res.status(401).json({ message: 'انتهت صلاحية الجلسة' });
        }

        // فك تشفير التوكن والتحقق من صلاحيته
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // التحقق من انتهاء صلاحية التوكن
        if (decoded.exp < Date.now() / 1000) {
            return res.status(401).json({ message: 'انتهت صلاحية الجلسة' });
        }

        // إضافة بيانات المستخدم إلى الطلب
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Auth error:', error);
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'انتهت صلاحية الجلسة' });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'جلسة غير صالحة' });
        } else {
            return res.status(500).json({ message: 'خطأ في الخادم' });
        }
    }
}

module.exports = auth;