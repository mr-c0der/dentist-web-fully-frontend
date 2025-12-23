// ==========================================
// الوظائف الرئيسية - Main Functions
// ==========================================

// --- عرض الخدمات ---
function renderServices() {
    const container = document.querySelector('.services .box-container');
    if (!container || !siteData.services) return;
    
    container.innerHTML = siteData.services.map(service => `
        <div class="box">
            <div class="image-wrapper">
                <img src="${service.image}" alt="${service.title}">
            </div>
            <h3>${service.title}</h3>
        </div>
    `).join('');
}

// --- عرض آراء العملاء ---
function renderReviews() {
    const slider = document.querySelector('.reviews .reviews-slider');
    if (!slider || !siteData.reviews) return;
    
    slider.innerHTML = siteData.reviews.map((review, index) => {
        const isActive = index === 0 ? 'active' : '';
        let starsHTML = '';
        const fullStars = Math.floor(review.stars);
        const hasHalf = review.stars % 1 !== 0;
        
        for (let i = 0; i < fullStars; i++) starsHTML += '<i class="fas fa-star"></i>';
        if (hasHalf) starsHTML += '<i class="fas fa-star-half-alt"></i>';
        
        return `
            <div class="slide ${isActive}">
                <i class="fas fa-quote-right quote-icon"></i>
                <p class="text">${review.text}</p>
                <div class="user">
                    <h3>${review.name}</h3>
                    <div class="stars">${starsHTML}</div>
                </div>
            </div>
        `;
    }).join('');
    
    // إعادة تهيئة السلايدر
    initSlider();
}

// --- تهيئة سلايدر الآراء ---
function initSlider() {
    const slides = document.querySelectorAll('.reviews .slide');
    if (slides.length === 0) return;
    
    let index = 0;
    setInterval(() => {
        slides[index].classList.remove('active');
        index = (index + 1) % slides.length;
        slides[index].classList.add('active');
    }, 5000);
}

// ==========================================
// التطبيق الرئيسي - Main App
// ==========================================

let menu = document.querySelector('#menu-btn');
let navbar = document.querySelector('.header .navbar');
let header = document.querySelector('.header');

menu.onclick = () => {
    menu.classList.toggle('fa-times');
    navbar.classList.toggle('active');
}

window.onscroll = () => {
    menu.classList.remove('fa-times');
    navbar.classList.remove('active');

    if (window.scrollY > 0) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
}

// --- تشغيل عند تحميل الصفحة (moved to bottom) ---

// --- Scroll Animations Observer ---
function initScrollAnimations() {
    // If IntersectionObserver not supported, show everything
    if (!('IntersectionObserver' in window)) {
        document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right, .zoom-in').forEach(el => {
            el.style.opacity = '1';
            el.style.transform = 'none';
        });
        return;
    }

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1 // Reduced threshold for better mobile triggering
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right, .zoom-in');
    animatedElements.forEach(el => observer.observe(el));
    
    // Trigger once immediately for elements already in view (failsafe)
    setTimeout(() => {
        animatedElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight) {
                el.classList.add('active');
            }
        });
    }, 100);
}

// --- Counter Animation ---
function initCounterAnimation() {
    const counters = document.querySelectorAll('.counter');
    
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = +counter.getAttribute('data-target');
                const duration = 2000; // 2 seconds
                const increment = target / (duration / 16); // 60fps
                let current = 0;
                
                const updateCounter = () => {
                    current += increment;
                    if (current < target) {
                        counter.textContent = Math.ceil(current);
                        requestAnimationFrame(updateCounter);
                    } else {
                        counter.textContent = target;
                    }
                };
                
                updateCounter();
                counterObserver.unobserve(counter);
            }
        });
    }, { threshold: 0.5 });
    
    counters.forEach(counter => counterObserver.observe(counter));
}

// ==========================================
// نظام الحجز عبر واتساب - WhatsApp Booking
// ==========================================

function initBookingForm() {
    const form = document.getElementById('booking-form');
    const notesInput = document.getElementById('booking-notes');
    const notesCount = document.getElementById('notes-count');
    const errorDiv = document.getElementById('booking-error');
    const successDiv = document.getElementById('booking-success');

    if (!form) return;

    // Character counter for notes
    if (notesInput && notesCount) {
        notesInput.addEventListener('input', () => {
            notesCount.textContent = notesInput.value.length;
        });
    }

    // Form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Hide previous messages
        errorDiv.style.display = 'none';
        successDiv.style.display = 'none';

        // Get form values
        const name = document.getElementById('booking-name').value.trim();
        const email = document.getElementById('booking-email').value.trim();
        const date = document.getElementById('booking-date').value;
        const time = document.getElementById('booking-time').value;
        const notes = document.getElementById('booking-notes').value.trim();

        // Get selected services
        const serviceCheckboxes = document.querySelectorAll('input[name="service"]:checked');
        const services = Array.from(serviceCheckboxes).map(cb => cb.value);

        // Validation
        if (!name || !email || !date || !time) {
            errorDiv.textContent = 'الرجاء ملء جميع الحقول الإلزامية';
            errorDiv.style.display = 'block';
            return;
        }

        if (services.length === 0) {
            errorDiv.textContent = 'الرجاء اختيار خدمة واحدة على الأقل';
            errorDiv.style.display = 'block';
            return;
        }

        // Format date in Arabic
        const dateObj = new Date(date);
        const formattedDate = dateObj.toLocaleDateString('ar-EG', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Format time
        const [hours, minutes] = time.split(':');
        const hour12 = hours % 12 || 12;
        const ampm = hours < 12 ? 'صباحاً' : 'مساءً';
        const formattedTime = `${hour12}:${minutes} ${ampm}`;

        // Build WhatsApp message
        const message = `🦷 *طلب حجز موعد جديد*
━━━━━━━━━━━━━━━━━

👤 *الاسم:* ${name}
📧 *البريد:* ${email}

🏥 *الخدمات المطلوبة:*
${services.map(s => `   • ${s}`).join('\n')}

📅 *التاريخ:* ${formattedDate}
🕐 *الوقت:* ${formattedTime}

${notes ? `📝 *ملاحظات:* ${notes}` : ''}
━━━━━━━━━━━━━━━━━
✨ شكراً لاختياركم عيادتنا`;

        // Get doctor's phone (obfuscated)
        const doctorPhone = getDoctorPhone();
        
        // Create WhatsApp URL
        const whatsappURL = `https://wa.me/${doctorPhone}?text=${encodeURIComponent(message)}`;

        // Show success message
        successDiv.style.display = 'flex';

        // Open WhatsApp
        window.open(whatsappURL, '_blank');
    });
}

// Obfuscated phone number retrieval
function getDoctorPhone() {
    // Phone parts encoded in Base64 for basic obfuscation
    const p = [
        atob('MDAy'),      // 002
        atob('MDE='),      // 01
        atob('Mjgy'),      // 282
        atob('Nzcw'),      // 770
        atob('MjU1')       // 255
    ];
    return p.join('');
}

// Initialize booking form on page load
document.addEventListener('DOMContentLoaded', () => {
    try { renderServices(); } catch (e) { console.error('Services Error:', e); }
    try { renderReviews(); } catch (e) { console.error('Reviews Error:', e); }
    try { initScrollAnimations(); } catch (e) { console.error('Animation Error:', e); }
    try { initCounterAnimation(); } catch (e) { console.error('Counter Error:', e); }
    try { initBookingForm(); } catch (e) { console.error('Booking Error:', e); }
});
