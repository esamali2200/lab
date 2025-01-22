// controllers/userController.js
const User = require('../models/User');

class UserController {
    async updateProfile(req, res) {
        try {
            const { fullName, email, phone } = req.body;
            const user = await User.findByIdAndUpdate(req.user.id, 
                { fullName, email, phone },
                { new: true }
            );
            res.json({ success: true, user });
        } catch (error) {
            res.status(500).json({ message: 'خطأ في تحديث البيانات' });
        }
    }
}

module.exports = new UserController();

// controllers/bookingController.js
const Booking = require('../models/Booking');

class BookingController {
    async createBooking(req, res) {
        try {
            const { testType, date, time } = req.body;
            const booking = new Booking({
                userId: req.user.id,
                testType,
                date,
                time
            });
            await booking.save();
            res.status(201).json({ success: true, booking });
        } catch (error) {
            res.status(500).json({ message: 'خطأ في حجز الموعد' });
        }
    }

    async getUserBookings(req, res) {
        try {
            const bookings = await Booking.find({ userId: req.user.id });
            res.json(bookings);
        } catch (error) {
            res.status(500).json({ message: 'خطأ في تحميل المواعيد' });
        }
    }
}

module.exports = new BookingController();