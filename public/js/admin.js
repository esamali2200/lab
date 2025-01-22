class AdminDashboard {
    constructor() {
        this.initializeEventListeners();
        this.loadStatistics();
    }

    initializeEventListeners() {
        // التنقل في القائمة الجانبية
        const menuLinks = document.querySelectorAll('.admin-menu a');
        menuLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handleMenuClick(e));
        });

        // البحث
        const searchInput = document.querySelector('.search-bar input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e));
        }

        // أزرار المواعيد
        document.querySelectorAll('.btn-approve').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleAppointment(e, 'approve'));
        });

        document.querySelectorAll('.btn-reject').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleAppointment(e, 'reject'));
        });
    }

    async loadStatistics() {
        try {
            const response = await fetch('/api/admin/statistics');
            const data = await response.json();
            this.updateDashboard(data);
        } catch (error) {
            console.error('Error loading statistics:', error);
        }
    }

    // التعامل مع المواعيد
    async handleAppointment(e, action) {
        const appointmentId = e.target.dataset.id;
        try {
            const response = await fetch(`/api/admin/appointments/${action}/${appointmentId}`, {
                method: 'POST'
            });
            if (response.ok) {
                this.updateAppointmentStatus(appointmentId, action);
            }
        } catch (error) {
            console.error('Error handling appointment:', error);
        }
    }

    // تحديث واجهة المستخدم
    updateDashboard(data) {
        // تحديث الإحصائيات
        document.getElementById('usersCount').textContent = data.usersCount;
        document.getElementById('appointmentsCount').textContent = data.appointmentsCount;
        document.getElementById('testsCount').textContent = data.testsCount;
    }
}

// تهيئة لوحة التحكم عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    new AdminDashboard();
});