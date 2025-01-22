const adminMiddleware = (req, res, next) => {
    try {
        console.log('Checking admin rights for user:', req.user);
        
        if (!req.user) {
            console.log('No user found in request');
            return res.status(401).json({ 
                success: false,
                message: 'يرجى تسجيل الدخول' 
            });
        }

        if (req.user.role !== 'admin') {
            console.log('User is not admin:', req.user.role);
            return res.status(403).json({ 
                success: false,
                message: 'غير مصرح بالوصول لهذه الصفحة' 
            });
        }

        console.log('Admin access granted for user:', req.user.userId);
        next();
    } catch (error) {
        console.error('Admin middleware error:', error);
        res.status(500).json({ 
            success: false,
            message: 'حدث خطأ في التحقق من الصلاحيات' 
        });
    }
};

module.exports = adminMiddleware;