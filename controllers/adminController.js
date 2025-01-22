const User = require('../models/User');
const Booking = require('../models/Booking');
const Test = require('../models/Test');

class AdminController {
    // إحصائيات لوحة التحكم
    async getDashboardStats(req, res) {
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
    }

    // إدارة المستخدمين
    async getUsers(req, res) {
        try {
            const users = await User.find({ role: 'user' })
                .select('-password');
            res.json(users);
        } catch (error) {
            res.status(500).json({ message: 'خطأ في تحميل المستخدمين' });
        }
    }

    // إدارة المواعيد
    async handleAppointment(req, res) {
        const { id } = req.params;
        const { action } = req.body;

        try {
            const booking = await Booking.findById(id);
            if (!booking) {
                return res.status(404).json({ message: 'الموعد غير موجود' });
            }

            booking.status = action === 'approve' ? 'approved' : 'rejected';
            await booking.save();

            res.json({ message: 'تم تحديث حالة الموعد بنجاح' });
        } catch (error) {
            res.status(500).json({ message: 'خطأ في تحديث الموعد' });
        }
    }

    // إضافة نتائج التحاليل
    async addTestResult(req, res) {
        const { bookingId, results } = req.body;

        try {
            const booking = await Booking.findById(bookingId);
            if (!booking) {
                return res.status(404).json({ message: 'الموعد غير موجود' });
            }

            booking.results = results;
            booking.status = 'completed';
            await booking.save();

            res.json({ message: 'تم إضافة النتائج بنجاح' });
        } catch (error) {
            res.status(500).json({ message: 'خطأ في إضافة النتائج' });
        }
    }
}

module.exports = new AdminController();