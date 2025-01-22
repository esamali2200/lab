const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');

// حجز موعد
router.post('/book', async (req, res) => {
    const { userId, date } = req.body;
    const booking = new Booking({ userId, date });
    await booking.save();
    res.status(201).send('Booking created');
});

// الحصول على الحجوزات
router.get('/booking', async (req, res) => {
    const bookings = await Booking.find().populate('userId');
    res.send(bookings);
});

module.exports = router;