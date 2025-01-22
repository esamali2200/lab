const router = require('express').Router();
const Booking = require('../models/Booking');
const auth = require('../middleware/auth');

// مسارات الحجوزات
router.post('/create', auth, async (req, res) => {
    try {
        const booking = new Booking({
            userId: req.user.id,
            ...req.body
        });
        await booking.save();
        res.status(201).json({ success: true, booking });
    } catch (error) {
        res.status(500).json({ message: 'خطأ في إنشاء الحجز' });
    }
});

module.exports = router;