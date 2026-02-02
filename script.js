document.addEventListener('DOMContentLoaded', function() {
    // Application State
    const appState = {
        theme: localStorage.getItem('theme') || 'light',
        visitCount: parseInt(localStorage.getItem('visitCount')) || 0,
        currentVisitStart: Date.now(),
        projectsViewed: new Set(),
        githubData: null
    };

    // Initialize the application
    function init() {
        initializeTheme();
        initializeNavigation();
        initializeVisitorTracking();
        initializeGitHubIntegration();
        initializeContactForm();
        initializeScrollAnimations();
        initializeSkillAnimations();

        // Update analytics display
        updateAnalyticsDisplay();

        // Start visit timer
        startVisitTimer();

        // Update greeting
        updateGreeting();
    }

    // Theme Management
    function initializeTheme() {
        const themeToggle = document.getElementById('themeToggle');

        // Apply saved theme
        if (appState.theme === 'dark') {
            document.body.classList.add('dark-mode');
            themeToggle.textContent = '☀️';
        }

        themeToggle.addEventListener('click', function() {
            document.body.classList.toggle('dark-mode');
            appState.theme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';

            if (appState.theme === 'dark') {
                themeToggle.textContent = '☀️';
            } else {
                themeToggle.textContent = '🌙';
            }

            localStorage.setItem('theme', appState.theme);
        });
    }

    // Navigation Management
    function initializeNavigation() {
        const hamburger = document.getElementById('hamburger');
        const navLinks = document.querySelector('.nav-links');

        hamburger.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            hamburger.textContent = navLinks.classList.contains('active') ? '✕' : '☰';
        });

        // Close mobile menu when clicking on a link
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', function() {
                navLinks.classList.remove('active');
                hamburger.textContent = '☰';
            });
        });

        // Smooth Scrolling for Navigation Links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;

                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    const headerHeight = document.querySelector('header').offsetHeight;
                    const targetPosition = targetElement.offsetTop - headerHeight;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });

                    // Track project views when clicking on github link
                    if (targetId === '#github') {
                        trackProjectView('github_section');
                    }
                }
            });
        });

        // Active section highlighting
        function highlightActiveSection() {
            const sections = document.querySelectorAll('section');
            const navLinks = document.querySelectorAll('.nav-links a');
            let currentSection = '';

            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const headerHeight = document.querySelector('header').offsetHeight;

                if (window.scrollY >= (sectionTop - headerHeight - 50)) {
                    currentSection = section.getAttribute('id');
                }
            });

            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${currentSection}`) {
                    link.classList.add('active');
                }
            });
        }

        window.addEventListener('scroll', highlightActiveSection);
        highlightActiveSection();
    }

    // Visitor Tracking and Analytics
    function initializeVisitorTracking() {
        // Increment visit count
        appState.visitCount++;
        localStorage.setItem('visitCount', appState.visitCount.toString());

        // Update visitor counter in header
        const visitCountElement = document.getElementById('visitCount');
        if (visitCountElement) {
            visitCountElement.textContent = appState.visitCount;
        }
    }

    function startVisitTimer() {
        setInterval(() => {
            const currentTime = Date.now();
            const visitDuration = Math.floor((currentTime - appState.currentVisitStart) / 1000);
            const visitTimeElement = document.getElementById('currentVisitTime');

            if (visitTimeElement) {
                const minutes = Math.floor(visitDuration / 60);
                const seconds = visitDuration % 60;
                visitTimeElement.textContent = `${minutes}m ${seconds}s`;
            }
        }, 1000);
    }

    function trackProjectView(projectId) {
        if (!appState.projectsViewed.has(projectId)) {
            appState.projectsViewed.add(projectId);
            updateAnalyticsDisplay();
        }
    }

    function updateAnalyticsDisplay() {
        const totalVisitsElement = document.getElementById('totalVisits');
        const projectsViewedElement = document.getElementById('projectsViewed');

        if (totalVisitsElement) {
            totalVisitsElement.textContent = appState.visitCount;
        }

        if (projectsViewedElement) {
            projectsViewedElement.textContent = appState.projectsViewed.size;
        }
    }

    // GitHub Integration
    async function initializeGitHubIntegration() {
        await fetchGitHubData();
    }

    async function fetchGitHubData() {
        const username = 'maryamzakmbk';
        const apiUrl = `https://api.github.com/users/${username}/repos?sort=updated&per_page=6`;

        try {
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.status}`);
            }

            const repos = await response.json();
            appState.githubData = repos;
            renderGitHubStats(repos);
            renderGitHubRepos(repos);

            // Hide loading indicator
            const loadingElement = document.getElementById('githubLoading');
            if (loadingElement) {
                loadingElement.style.display = 'none';
            }

        } catch (error) {
            console.error('Error fetching GitHub data:', error);
            // Show error message
            const loadingElement = document.getElementById('githubLoading');
            const errorElement = document.getElementById('githubError');

            if (loadingElement) {
                loadingElement.style.display = 'none';
            }

            if (errorElement) {
                errorElement.style.display = 'block';
            }
        }
    }

    function renderGitHubStats(repos) {
        const statsElement = document.getElementById('githubStats');
        if (!statsElement) return;

        // Calculate stats
        const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
        const totalForks = repos.reduce((sum, repo) => sum + repo.forks_count, 0);
        const latestUpdate = repos.length > 0 ? new Date(repos[0].updated_at).toLocaleDateString() : 'N/A';

        // Render stats
        statsElement.innerHTML = `
            <div class="stat-item">
                <span class="stat-value">${repos.length}</span>
                <span class="stat-label">Repositories</span>
            </div>
            <div class="stat-item">
                <span class="stat-value">${totalStars}</span>
                <span class="stat-label">Stars</span>
            </div>
            <div class="stat-item">
                <span class="stat-value">${totalForks}</span>
                <span class="stat-label">Forks</span>
            </div>
            <div class="stat-item">
                <span class="stat-value">${latestUpdate}</span>
                <span class="stat-label">Last Update</span>
            </div>
        `;
    }

    function renderGitHubRepos(repos) {
        const reposGrid = document.getElementById('reposGrid');
        if (!reposGrid) return;

        // Clear existing content
        reposGrid.innerHTML = '';

        // Render repositories
        repos.forEach(repo => {
            const repoCard = document.createElement('div');
            repoCard.className = 'repo-card fade-in';

            // Format date
            const updatedDate = new Date(repo.updated_at).toLocaleDateString();

            repoCard.innerHTML = `
                <div class="repo-header">
                    <h3 class="repo-name">${repo.name}</h3>
                    <div class="repo-stats">
                        <span class="repo-stat">⭐ ${repo.stargazers_count}</span>
                        <span class="repo-stat">🍴 ${repo.forks_count}</span>
                    </div>
                </div>
                <p class="repo-description">${repo.description || 'No description available'}</p>
                <div class="repo-meta">
                    <span class="repo-language">${repo.language || 'Multiple Languages'}</span>
                    <span class="repo-date">Updated: ${updatedDate}</span>
                </div>
                ${repo.topics && repo.topics.length > 0 ? `
                    <div class="repo-topics">
                        ${repo.topics.slice(0, 3).map(topic => `<span class="repo-topic">${topic}</span>`).join('')}
                    </div>
                ` : ''}
                <a href="${repo.html_url}" target="_blank" class="repo-link" data-repo-id="${repo.id}">
                    View on GitHub →
                </a>
            `;
            reposGrid.appendChild(repoCard);
            observeElement(repoCard);

            // Track click on repo links
            const repoLink = repoCard.querySelector('.repo-link');
            if (repoLink) {
                repoLink.addEventListener('click', () => {
                    trackProjectView(`github_${repo.id}`);
                });
            }
        });

        // If no repositories
        if (repos.length === 0) {
            reposGrid.innerHTML = '<p class="no-projects">No GitHub repositories found.</p>';
        }
    }

    // Enhanced Contact Form with Secure Email Sending
    function initializeContactForm() {
        const contactForm = document.getElementById('contactForm');
        if (!contactForm) return;

        const formGroups = document.querySelectorAll('.form-group');

        // Add real-time validation
        formGroups.forEach(group => {
            const input = group.querySelector('input, textarea, select');
            if (!input) return;

            const errorSpan = document.createElement('span');
            errorSpan.className = 'error-message';
            group.appendChild(errorSpan);

            input.addEventListener('blur', function() {
                validateField(this);
            });

            input.addEventListener('input', function() {
                // Clear error when user starts typing
                if (this.classList.contains('error')) {
                    this.classList.remove('error');
                    errorSpan.textContent = '';
                }
            });
        });

        // Form submission
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            let isValid = true;
            const inputs = contactForm.querySelectorAll('input[required], textarea[required], select[required]');

            // Validate all required fields
            inputs.forEach(input => {
                if (!validateField(input)) {
                    isValid = false;
                }
            });

            if (isValid) {
                // Show loading state
                const submitBtn = contactForm.querySelector('button[type="submit"]');
                const originalText = submitBtn.textContent;
                submitBtn.textContent = 'Sending...';
                submitBtn.disabled = true;

                try {
                    // Collect form data
                    const formData = {
                        name: document.getElementById('name').value.trim(),
                        email: document.getElementById('email').value.trim(),
                        subject: document.getElementById('subject').value,
                        company: document.getElementById('company').value.trim(),
                        message: document.getElementById('message').value.trim(),
                        timestamp: new Date().toISOString(),
                        source: 'Portfolio Website'
                    };

                    // Send email using EmailJS (more secure than FormSubmit)
                    await sendEmailWithEmailJS(formData);

                    // Show success message
                    showFormMessage('Message sent successfully! I\'ll get back to you soon.', 'success');

                    // Reset form
                    contactForm.reset();

                    // Track form submission
                    trackProjectView('contact_form_submission');

                } catch (error) {
                    console.error('Error sending email:', error);
                    showFormMessage('Failed to send message. Please try again or email me directly at marzakmbk10@gmail.com', 'error');
                } finally {
                    // Restore button state
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                }
            } else {
                showFormMessage('Please fix the errors above.', 'error');
            }
        });

        function validateField(field) {
            const value = field.value.trim();
            const errorSpan = field.parentNode.querySelector('.error-message');
            let isValid = true;
            let errorMessage = '';

            // Required field validation
            if (field.hasAttribute('required') && value === '') {
                isValid = false;
                errorMessage = 'This field is required';
            }

            // Email validation
            if (field.type === 'email' && value !== '') {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid email address';
                }
            }

            // Message length validation
            if (field.name === 'message' && value.length < 10) {
                isValid = false;
                errorMessage = 'Message must be at least 10 characters long';
            }

            // Update field state
            if (!isValid) {
                field.classList.add('error');
                errorSpan.textContent = errorMessage;
            } else {
                field.classList.remove('error');
                errorSpan.textContent = '';
            }

            return isValid;
        }

        function showFormMessage(message, type) {
            // Remove existing messages
            const existingMessage = contactForm.querySelector('.form-message');
            if (existingMessage) {
                existingMessage.remove();
            }

            // Create new message
            const messageDiv = document.createElement('div');
            messageDiv.className = `form-message ${type}`;
            messageDiv.textContent = message;

            // Add animation
            messageDiv.style.opacity = '0';
            messageDiv.style.transform = 'translateY(-10px)';
            contactForm.insertBefore(messageDiv, contactForm.firstChild);

            // Animate in
            setTimeout(() => {
                messageDiv.style.opacity = '1';
                messageDiv.style.transform = 'translateY(0)';
            }, 10);

            // Auto remove after 5 seconds
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.style.opacity = '0';
                    messageDiv.style.transform = 'translateY(-10px)';
                    setTimeout(() => {
                        if (messageDiv.parentNode) {
                            messageDiv.remove();
                        }
                    }, 300);
                }
            }, 5000);
        }
    }

    // Secure Email Sending Function using EmailJS
    async function sendEmailWithEmailJS(formData) {
        // You need to sign up for EmailJS (free tier available)
        // Go to: https://www.emailjs.com/
        // After signing up, you'll get:
        // 1. Service ID
        // 2. Template ID
        // 3. Public Key

        const emailJsConfig = {
            serviceId: 'service_795cjcg', // Replace with your EmailJS service ID
            templateId: 'template_qas81eh', // Replace with your EmailJS template ID
            publicKey: '-SDmkT2k7XtdEVtV-' // Replace with your EmailJS public key
        };

        // If EmailJS is not configured, fall back to FormSubmit
        if (!emailJsConfig.serviceId || emailJsConfig.serviceId === 'YOUR_SERVICE_ID') {
            return await sendEmailWithFormSubmit(formData);
        }

        try {
            // Load EmailJS library dynamically
            if (!window.emailjs) {
                await loadScript('https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js');
                emailjs.init(emailJsConfig.publicKey);
            }

            // Send email
            const response = await emailjs.send(
                emailJsConfig.serviceId,
                emailJsConfig.templateId,
                {
                    from_name: formData.name,
                    from_email: formData.email,
                    subject: formData.subject,
                    company: formData.company,
                    message: formData.message,
                    to_email: 'marzakmbk10@gmail.com'
                }
            );

            console.log('Email sent successfully:', response);
            return response;
        } catch (error) {
            console.error('EmailJS failed, falling back to FormSubmit:', error);
            // Fall back to FormSubmit
            return await sendEmailWithFormSubmit(formData);
        }
    }

    // Fallback email sending using FormSubmit
    async function sendEmailWithFormSubmit(formData) {
        try {
            const response = await fetch('https://formsubmit.co/ajax/marzakmbk10@gmail.com', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    subject: formData.subject,
                    company: formData.company,
                    message: formData.message,
                    _subject: `New Portfolio Message: ${formData.subject}`,
                    _template: 'box'
                })
            });

            const result = await response.json();

            if (result.success) {
                console.log('FormSubmit email sent successfully');
                return result;
            } else {
                throw new Error('FormSubmit failed');
            }
        } catch (error) {
            console.error('FormSubmit failed:', error);
            throw error;
        }
    }

    // Helper function to load scripts dynamically
    function loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // Scroll Animations
    function initializeScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        // Observe elements for animation
        document.querySelectorAll('.skill-tag, .repo-card, .timeline-item, .certification-card, .contact-item, .stat-item').forEach(el => {
            el.classList.add('fade-in');
            observer.observe(el);
        });
    }

    function observeElement(element) {
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, { threshold: 0.1 });

        observer.observe(element);
    }

    // Skill Bar Animations
    function initializeSkillAnimations() {
        // Reset all skill bars to 0 width
        const skillBars = document.querySelectorAll('.skill-level');
        skillBars.forEach(bar => {
            bar.style.width = '0%';
        });

        // Animate skill bars when they come into view
        const skillItems = document.querySelectorAll('.skill-item');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const skillLevel = entry.target.querySelector('.skill-level');
                    if (skillLevel) {
                        // Get the width from inline style
                        const targetWidth = skillLevel.getAttribute('style')?.match(/width:\s*(\d+)%/);
                        if (targetWidth && targetWidth[1]) {
                            // Reset to 0 then animate to target
                            skillLevel.style.transition = 'width 1.5s ease-in-out';
                            setTimeout(() => {
                                skillLevel.style.width = targetWidth[1] + '%';
                            }, 100);
                        }
                    }
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.3,
            rootMargin: '0px 0px -100px 0px'
        });

        // Observe each skill item
        skillItems.forEach(item => {
            observer.observe(item);
        });
    }

    // Dynamic Greeting Based on Time of Day
    function updateGreeting() {
        const greetingElement = document.getElementById('greeting');
        const hour = new Date().getHours();
        let greeting = 'Hello';

        if (hour < 12) greeting = 'Good Morning';
        else if (hour < 18) greeting = 'Good Afternoon';
        else greeting = 'Good Evening';

        if (greetingElement) {
            greetingElement.textContent = `${greeting}, I'm Maryam Al Mobarak`;
        }
    }

    // Add CSS for repo-meta
    const style = document.createElement('style');
    style.textContent = `
        .repo-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 1rem 0;
            font-size: 0.9rem;
            color: var(--text-color);
            opacity: 0.7;
        }
        
        .repo-language {
            background: var(--secondary-color);
            color: white;
            padding: 0.3rem 0.7rem;
            border-radius: 15px;
            font-size: 0.8rem;
        }
        
        .repo-date {
            font-size: 0.9rem;
        }
    `;
    document.head.appendChild(style);

    // Initialize the application
    init();
});