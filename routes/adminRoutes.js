const router = require('express').Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// مسارات الأدمن
router.get('/statistics', [auth, admin], async (req, res) => {
    try {
        const stats = {
            usersCount: await User.countDocuments({ role: 'user' }),
            appointmentsCount: await Booking.countDocuments(),
            testsCount: await Test.countDocuments()
        };
        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: 'خطأ في تحميل الإحصائيات' });
    }
});

router.post('/appointments/:action/:id', [auth, admin], async (req, res) => {
    try {
        // تحديث حالة الموعد
        const { action, id } = req.params;
        await Booking.findByIdAndUpdate(id, { status: action });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: 'خطأ في تحديث الموعد' });
    }
});

module.exports = router;