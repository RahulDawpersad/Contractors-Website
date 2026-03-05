// ========================================
// ProFix Home Services - Full Main JavaScript (with Supabase Auth)
// ========================================
// ====================== BREVO EMAIL SETUP ======================


// ====================== SUPABASE SETUP ======================
const SUPABASE_URL = 'https://gwtlqhjpfxdkwtrhmbtw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3dGxxaGpwZnhka3d0cmhtYnR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2MjA1ODksImV4cCI6MjA4ODE5NjU4OX0.dXf8CI_CDeZWgscGjjNKY8GtY3oARudMTaRR3vtRmj0';

let supabaseClient;
let currentUser = null;

// ====================== AUTH FUNCTIONS ======================
async function initAuth() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    currentUser = session?.user || null;
    updateAuthUI();

    supabaseClient.auth.onAuthStateChange((event, session) => {
        currentUser = session?.user || null;
        updateAuthUI();
    });
}

function updateAuthUI() {
    const container = document.getElementById('auth-links');
    if (!container) return;

    container.innerHTML = '';

    if (currentUser) {
        // Logged in - Show user profile with dropdown
        container.innerHTML = `
            <div class="user-menu" id="user-menu">
                <div class="user-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <span class="user-name">${currentUser.email.split('@')[0]}</span>
                <div class="user-dropdown">
                    <a href="#" id="view-profile-link">My Account</a>
                    <button id="logout-btn">Logout</button>
                </div>
            </div>
        `;

        const userMenu = document.getElementById('user-menu');
        const logoutBtn = document.getElementById('logout-btn');
        const profileLink = document.getElementById('view-profile-link');

        userMenu.addEventListener('click', function (e) {
            if (e.target.id === 'logout-btn') return;
            this.classList.toggle('active');
        });

        document.addEventListener('click', function (e) {
            if (!userMenu.contains(e.target)) {
                userMenu.classList.remove('active');
            }
        });

        logoutBtn.addEventListener('click', async () => {
            await supabaseClient.auth.signOut();
        });

        profileLink.addEventListener('click', (e) => {
            e.preventDefault();
            alert(`👋 Welcome back ${currentUser.email.split('@')[0]}!\n\nYour personal secure session is active.`);
        });

    } else {
        // Not logged in - Show Login / Sign Up
        container.innerHTML = `
            <a href="#" id="login-link" class="nav-auth-link login-link">Login</a>
            <a href="#" id="signup-link" class="nav-auth-link signup-link">Sign Up</a>
        `;

        document.getElementById('login-link').addEventListener('click', (e) => {
            e.preventDefault();
            showAuthModal(true);
        });

        document.getElementById('signup-link').addEventListener('click', (e) => {
            e.preventDefault();
            showAuthModal(false);
        });
    }
}

let isLoginMode = true;

function showAuthModal(loginMode) {
    isLoginMode = loginMode;
    const modal = document.getElementById('auth-modal');
    const title = document.getElementById('modal-title');
    const submitBtn = document.getElementById('auth-submit');
    const switchContainer = document.getElementById('auth-switch');

    title.textContent = isLoginMode ? 'Login to ProFix' : 'Create Your Account';
    submitBtn.textContent = isLoginMode ? 'Login' : 'Sign Up';

    switchContainer.innerHTML = isLoginMode
        ? `Don't have an account? <a href="#" id="switch-auth-mode">Sign Up</a>`
        : `Already have an account? <a href="#" id="switch-auth-mode">Login</a>`;

    modal.classList.add('active');
    document.getElementById('auth-message').innerHTML = '';

    // Attach form submit
    document.getElementById('auth-form').onsubmit = handleAuthSubmit;

    // Switch mode link
    document.getElementById('switch-auth-mode').addEventListener('click', (e) => {
        e.preventDefault();
        showAuthModal(!isLoginMode);
    });
}

async function handleAuthSubmit(e) {
    e.preventDefault();

    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value.trim();
    const messageEl = document.getElementById('auth-message');

    if (!email || !password) {
        messageEl.innerHTML = `<p style="color:#e74c3c;">Please fill in all fields</p>`;
        return;
    }

    messageEl.innerHTML = `<p style="color:#3498db;">Processing...</p>`;

    try {
        if (isLoginMode) {
            const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
            if (error) throw error;
            closeAuthModal();
        } else {
            const { error } = await supabaseClient.auth.signUp({
                email,
                password,
                options: { emailRedirectTo: window.location.origin }
            });
            if (error) throw error;
            messageEl.innerHTML = `<p style="color:#27ae60;">✅ Account created!<br>Please check your email to confirm.</p>`;
            setTimeout(closeAuthModal, 4000);
        }
    } catch (err) {
        messageEl.innerHTML = `<p style="color:#e74c3c;">${err.message}</p>`;
    }
}

function closeAuthModal() {
    document.getElementById('auth-modal').classList.remove('active');
}

// ====================== MAIN APP ======================
document.addEventListener('DOMContentLoaded', function () {

    // Initialize Supabase
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    initAuth();

    // --- Mobile Navigation Toggle ---
    const mobileToggle = document.getElementById('mobileToggle');
    const navLinks = document.getElementById('navLinks');

    if (mobileToggle && navLinks) {
        mobileToggle.addEventListener('click', function () {
            this.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        navLinks.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                mobileToggle.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });

        document.addEventListener('click', function (e) {
            if (!navLinks.contains(e.target) && !mobileToggle.contains(e.target)) {
                mobileToggle.classList.remove('active');
                navLinks.classList.remove('active');
            }
        });
    }

    // --- Navbar Scroll Effect ---
    const navbar = document.getElementById('navbar');
    const emergencyBanner = document.getElementById('emergencyBanner');

    window.addEventListener('scroll', function () {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        if (emergencyBanner) {
            if (window.scrollY > 200) {
                emergencyBanner.style.transform = 'translateY(-100%)';
                emergencyBanner.style.transition = 'transform 0.3s ease';
            } else {
                emergencyBanner.style.transform = 'translateY(0)';
            }
        }
    });

    // --- Scroll Animations ---
    const animatedElements = document.querySelectorAll('[data-animate]');

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        const delay = entry.target.getAttribute('data-delay') || 0;
                        setTimeout(function () {
                            entry.target.classList.add('animated');
                        }, parseInt(delay));
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
        );

        animatedElements.forEach(function (el) {
            observer.observe(el);
        });
    } else {
        animatedElements.forEach(function (el) {
            el.classList.add('animated');
        });
    }

    // --- FAQ Accordion ---
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(function (item) {
        const question = item.querySelector('.faq-question');
        if (question) {
            question.addEventListener('click', function () {
                const isActive = item.classList.contains('active');
                faqItems.forEach(function (faq) {
                    faq.classList.remove('active');
                });
                if (!isActive) item.classList.add('active');
            });
        }
    });

    // --- Contact Form ---
    const contactForm = document.getElementById('contactForm');

    if (contactForm) {
        // Prefill email if user is logged in
        if (currentUser) {
            const emailInput = document.getElementById('email');
            if (emailInput) emailInput.value = currentUser.email;
        }

        contactForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const service = document.getElementById('service').value;
            const message = document.getElementById('message').value.trim();

            if (!name || !email || !phone || !service) {
                showFormMessage('Please fill in all required fields.', 'error');
                return;
            }

            // Save to Supabase if logged in
            if (currentUser) {
                await supabaseClient.from('contact_requests').insert({
                    user_id: currentUser.id,
                    name, phone, service,
                    message: message || null
                });
            }

            // WhatsApp message
            const whatsappMsg = `Hi ProFix!\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nService: ${service}\nMessage: ${message || 'No message'}`;

            // === SEND EMAILS VIA BREVO ===
            try {
                const response = await fetch('/.netlify/functions/send-email', {  // Or full URL if needed
                    method: 'POST',
                    body: JSON.stringify({ name, email, phone, service, message })
                });

                if (!response.ok) throw new Error('Failed to send');

                // Proceed with success message, WhatsApp, etc.
                showFormMessage(`Thank you ${name.split(' ')[0]}! Emails sent. We'll reply in 30 mins. Opening WhatsApp...`, 'success');

                // WhatsApp logic...
            } catch (err) {
                showFormMessage('Error sending request. Please try again.', 'error');
            }

            // Success message + WhatsApp
            showFormMessage(`Thank you ${name.split(' ')[0]}! Emails sent. We'll reply in 30 mins. Opening WhatsApp...`, 'success');

            setTimeout(() => {
                window.open(`https://wa.me/27310000000?text=${encodeURIComponent(whatsappMsg)}`, '_blank');
            }, 1500);

            contactForm.reset();
        });
    }


    function showFormMessage(msg, type) {
        var existing = document.querySelector('.form-message');
        if (existing) existing.remove();

        var msgEl = document.createElement('div');
        msgEl.className = 'form-message';
        msgEl.textContent = msg;
        msgEl.style.cssText = 'padding: 14px 20px; border-radius: 8px; margin-top: 16px; text-align: center; font-family: Poppins, sans-serif; font-weight: 600; font-size: 0.9rem;';

        if (type === 'success') {
            msgEl.style.background = '#d4edda';
            msgEl.style.color = '#155724';
            msgEl.style.border = '1px solid #c3e6cb';
        } else {
            msgEl.style.background = '#f8d7da';
            msgEl.style.color = '#721c24';
            msgEl.style.border = '1px solid #f5c6cb';
        }

        var submitBtn = contactForm.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.parentNode.insertBefore(msgEl, submitBtn.nextSibling);

        setTimeout(() => {
            if (msgEl.parentNode) msgEl.remove();
        }, 5000);
    }

    // --- Quote Popup ---
    var popupOverlay = document.getElementById('popupOverlay');
    var popupClose = document.getElementById('popupClose');
    var popupShown = false;

    setTimeout(function () {
        if (!popupShown && popupOverlay) {
            popupOverlay.classList.add('active');
            popupShown = true;
        }
    }, 20000);

    if (popupClose) {
        popupClose.addEventListener('click', function () {
            popupOverlay.classList.remove('active');
        });
    }

    if (popupOverlay) {
        popupOverlay.addEventListener('click', function (e) {
            if (e.target === popupOverlay) popupOverlay.classList.remove('active');
        });
    }

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && popupOverlay) {
            popupOverlay.classList.remove('active');
        }
    });

    // --- Smooth Scroll ---
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            var targetId = this.getAttribute('href');
            if (targetId === '#') return;
            var targetEl = document.querySelector(targetId);
            if (targetEl) {
                e.preventDefault();
                targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // --- Active Nav Link ---
    var sections = document.querySelectorAll('section[id]');

    function highlightNav() {
        var scrollY = window.scrollY + 100;
        sections.forEach(function (section) {
            var sectionTop = section.offsetTop;
            var sectionHeight = section.offsetHeight;
            var sectionId = section.getAttribute('id');

            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                document.querySelectorAll('.nav-links a').forEach(function (link) {
                    link.classList.remove('active-link');
                    if (link.getAttribute('href') === '#' + sectionId) {
                        link.classList.add('active-link');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', highlightNav);

    // --- Gallery Hover ---
    var galleryItems = document.querySelectorAll('.gallery-item');
    galleryItems.forEach(function (item) {
        item.addEventListener('mouseenter', function () { this.style.zIndex = '2'; });
        item.addEventListener('mouseleave', function () { this.style.zIndex = '1'; });
    });

    // ====================== AUTH MODAL LISTENERS ======================
    const closeModalBtn = document.getElementById('close-auth-modal');
    const authModal = document.getElementById('auth-modal');

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeAuthModal);
    }

    if (authModal) {
        authModal.addEventListener('click', function (e) {
            if (e.target === this) closeAuthModal();
        });
    }

    console.log('✅ ProFix Home Services - Fully Loaded with Secure Supabase Auth! 🔧');
});