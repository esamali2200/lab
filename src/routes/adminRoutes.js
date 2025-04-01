// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    getAllUsers,
    handleProfileUpdate,
    getAllAppointments,
    updateAppointmentStatus,
    addTestResult,
    getDashboardStats
} = require('../controllers/adminController');

// حماية جميع مسارات الأدمن
router.use(protect);
router.use(authorize('admin'));

// إدارة المستخدمين
router.get('/users', getAllUsers);
router.post('/users/profile-update', handleProfileUpdate);

// إدارة المواعيد
router.get('/appointments', getAllAppointments);
router.post('/appointments/status', updateAppointmentStatus);

// إدارة التحاليل
router.post('/tests', addTestResult);

// لوحة التحكم
router.get('/dashboard/stats', getDashboardStats);

module.exports = router;