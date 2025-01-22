document.addEventListener('DOMContentLoaded', () => {
    // وظائف التحقق من صحة البيانات
    const validateEmail = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const validatePassword = password => password.length >= 6;

 // في scrpt.js
  const Auth = {
    async checkAuth() {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/login';
            return false;
        }

        try {
            const response = await fetch('/api/auth/verify', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            
            if (!data.valid) {
                throw new Error('Invalid token');
            }
            return true;
        } catch (error) {
            localStorage.removeItem('token');
            localStorage.removeItem('userRole');
            window.location.href = '/login';
            return false;
        }
    
    },

        async logout() {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    window.location.href = '/login';
                    return;
                }

                const response = await fetch('/api/auth/logout', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('userRole');
                    window.location.href = '/login';
                }
            } catch (error) {
                console.error('Logout error:', error);
                localStorage.removeItem('token');
                localStorage.removeItem('userRole');
                window.location.href = '/login';
            }
        }
    };

    // تحميل المكونات
    async function loadComponents() {
        try {
            const [headerResponse, footerResponse] = await Promise.all([
                fetch('/components/header.html'),
                fetch('/components/footer.html')
            ]);

            const [headerHtml, footerHtml] = await Promise.all([
                headerResponse.text(),
                footerResponse.text()
            ]);

            const headerPlaceholder = document.getElementById('header-placeholder');
            const footerPlaceholder = document.getElementById('footer-placeholder');

            if (headerPlaceholder) headerPlaceholder.innerHTML = headerHtml;
            if (footerPlaceholder) footerPlaceholder.innerHTML = footerHtml;

            // إعداد أزرار القائمة
            setupMenuButtons();
        } catch (error) {
            console.error('Error loading components:', error);
        }
    }

    // إعداد أزرار القائمة
    function setupMenuButtons() {
        const faBars = document.querySelector('.fa-bars');
        const faTimes = document.querySelector('.fa-times');
        if (faBars && faTimes) {
            faBars.addEventListener('click', () => {
                const navLinks = document.getElementById('navLinks');
                if (navLinks) navLinks.style.right = "0";
            });
            faTimes.addEventListener('click', () => {
                const navLinks = document.getElementById('navLinks');
                if (navLinks) navLinks.style.right = "-200px";
            });
        }
    }

    // نموذج تسجيل الدخول
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password })
                });

                const data = await response.json();

                if (response.ok && data.token) {
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('userRole', data.user.role);

                    const redirectUrl = data.user.role === 'admin' ? '/admin' : '/patient';
                    window.location.replace(redirectUrl);
                } else {
                    alert(data.message || 'فشل تسجيل الدخول');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('حدث خطأ أثناء تسجيل الدخول');
            }
        });
    }

    // إعداد الصفحات المحمية
// التحقق من الصفحات المحمية
const isProtectedPage = ['/admin', '/patient'].includes(window.location.pathname);

if (isProtectedPage) {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login';
    } else {
        // تحميل المكونات ثم التحقق من صحة التوكن
        loadComponents();
        Auth.checkAuth().then(isAuthenticated => {
            if (!isAuthenticated) {
                localStorage.removeItem('token');
                localStorage.removeItem('userRole');
                window.location.href = '/login'; // ← إضافة إعادة التوجيه
            }
        });
    }
} else {
    loadComponents();
}

    // إعداد التنقل في لوحة التحكم
    function setupDashboardNavigation() {
        const menuLinks = document.querySelectorAll('.dashboard-menu a');
        const sections = document.querySelectorAll('.dashboard-section');

        menuLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                menuLinks.forEach(l => l.parentElement.classList.remove('active'));
                e.target.parentElement.classList.add('active');
                
                const targetId = e.target.getAttribute('href').substring(1);
                sections.forEach(section => section.classList.add('hidden'));
                document.getElementById(targetId).classList.remove('hidden');
            });
        });
    }
});

// معالجة زر الرجوع
window.onpopstate = function(event) {
    const protectedPaths = ['/admin', '/patient'];
    if (protectedPaths.includes(window.location.pathname)) {
        Auth.checkAuth();
    }
};