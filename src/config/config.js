// src/config/config.js
module.exports = {
    // إعدادات JWT
    jwt: {
        secret: process.env.JWT_SECRET || 'your-secret-key',
        expiresIn: '24h'
    },
    
    // إعدادات تحميل الملفات
    upload: {
        // مسار حفظ ملفات التحاليل
        testsPath: 'uploads/tests',
        // أنواع الملفات المسموح بها
        allowedTypes: ['application/pdf'],
        // الحد الأقصى لحجم الملف (5 ميجابايت)
        maxSize: 5 * 1024 * 1024
    },

    // إعدادات المواعيد
    appointments: {
        // ساعات العمل
        workingHours: {
            start: '09:00',
            end: '17:00'
        },
        // المدة الزمنية للموعد (بالدقائق)
        duration: 30
    }
};