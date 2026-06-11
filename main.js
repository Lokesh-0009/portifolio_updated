/* ==========================================================================
   MAIN SYSTEM SCRIPT - INTERSECTIONS, COUNTERS, AND ANIMATIONS
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // DOM References
    const loaderScreen = document.getElementById('loading-screen');
    const progressArea = document.getElementById('loader-progress-area');
    const timelineBar = document.querySelector('.timeline-bar');
    const timelinePlayhead = document.querySelector('.timeline-playhead');
    const loaderStatus = document.querySelector('.loader-status');
    
    const bgVideo = document.getElementById('bg-video');
    const btnAudioToggle = document.getElementById('btn-audio-toggle');
    const appContainer = document.getElementById('app-container');
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');

    let isFirstPlayActive = true;

    // 1. SIMULATED TIMELINE LOADER
    let progress = 0;
    const loadingSteps = [
        "Initializing editing timelines...",
        "Loading video assets & caches...",
        "Buffering cinematic clips...",
        "Setting up color wheels...",
        "99% Rendering complete...",
        "Render Complete!"
    ];

    const updateLoader = () => {
        progress += Math.random() * 8 + 2;
        if (progress >= 100) {
            progress = 100;
            timelineBar.style.width = `100%`;
            timelinePlayhead.style.left = `100%`;
            loaderStatus.textContent = loadingSteps[loadingSteps.length - 1];
            
            setTimeout(() => {
                enterPortfolioAutomatically();
            }, 500);
        } else {
            timelineBar.style.width = `${progress}%`;
            timelinePlayhead.style.left = `${progress}%`;
            
            // Randomly update status messages
            const stepIndex = Math.min(Math.floor((progress / 100) * loadingSteps.length), loadingSteps.length - 2);
            loaderStatus.textContent = loadingSteps[stepIndex];
            
            setTimeout(updateLoader, 50 + Math.random() * 100);
        }
    };

    // Begin Loading
    setTimeout(updateLoader, 300);

    // 2. AUTOMATIC ENTRANCE & AUTOPLAY WITH INTERACTIVE UNMUTE
    const enterPortfolioAutomatically = () => {
        // Autoplay background video (Muted initially to pass browser policy)
        if (bgVideo) {
            bgVideo.muted = true;
            bgVideo.play().catch(error => {
                console.error("Autoplay failed:", error);
            });
        }

        // Fade out Loading Screen overlay
        gsap.to(loaderScreen, {
            opacity: 0,
            duration: 1.0,
            ease: "power2.inOut",
            onComplete: () => {
                loaderScreen.classList.add('hidden');
            }
        });

        // Reveal Floating Audio Button
        if (btnAudioToggle) {
            btnAudioToggle.classList.remove('hidden');
            gsap.fromTo(btnAudioToggle, 
                { opacity: 0, y: 20 }, 
                { opacity: 1, y: 0, duration: 0.8, delay: 0.5, ease: "power3.out" }
            );
        }

        // Reveal Portfolio content
        appContainer.classList.remove('hidden');
        setTimeout(() => {
            appContainer.classList.add('visible');
            if (window.initializeMainPage) {
                window.initializeMainPage();
            }
        }, 100);
    };

    // Unmute Video Sound
    const unmuteVideo = () => {
        if (isFirstPlayActive && bgVideo && bgVideo.muted) {
            bgVideo.muted = false;
            bgVideo.volume = 1.0;
            bgVideo.play().catch(e => console.log("Unmute play failed:", e));
            
            if (btnAudioToggle) {
                btnAudioToggle.innerHTML = `<i class="fa-solid fa-volume-high"></i> <span>Sound On</span>`;
                btnAudioToggle.classList.add('sound-on');
            }
        }
    };

    // Mute Video Sound
    const muteVideo = () => {
        if (bgVideo && !bgVideo.muted) {
            bgVideo.muted = true;
            if (btnAudioToggle) {
                btnAudioToggle.innerHTML = `<i class="fa-solid fa-volume-xmark"></i> <span>Sound Off</span>`;
                btnAudioToggle.classList.remove('sound-on');
            }
        }
    };

    // Audio Button Action Toggle
    const toggleAudio = (e) => {
        e.stopPropagation();
        if (bgVideo) {
            if (bgVideo.muted) {
                unmuteVideo();
            } else {
                muteVideo();
            }
        }
    };

    if (btnAudioToggle) {
        btnAudioToggle.addEventListener('click', toggleAudio);
    }

    // Unmute audio upon first user interaction (Satisfies user request + browser guidelines)
    const unmuteOnInteraction = (e) => {
        if (e && e.target && e.target.closest('#btn-audio-toggle')) return;
        unmuteVideo();
        removeInteractionListeners();
    };

    const removeInteractionListeners = () => {
        window.removeEventListener('click', unmuteOnInteraction);
        window.removeEventListener('keydown', unmuteOnInteraction);
        window.removeEventListener('touchstart', unmuteOnInteraction);
    };

    window.addEventListener('click', unmuteOnInteraction);
    window.addEventListener('keydown', unmuteOnInteraction);
    window.addEventListener('touchstart', unmuteOnInteraction);

    // Loop video silently once the first play finishes
    if (bgVideo) {
        bgVideo.addEventListener('ended', () => {
            isFirstPlayActive = false;
            removeInteractionListeners();
            bgVideo.muted = true;
            bgVideo.loop = true;
            bgVideo.play();
            
            // Fade out floating audio button since intro is over and looping silently
            if (btnAudioToggle) {
                gsap.to(btnAudioToggle, {
                    opacity: 0,
                    y: 20,
                    duration: 0.8,
                    onComplete: () => {
                        btnAudioToggle.classList.add('hidden');
                    }
                });
            }
        });
    }

    // 3. MAIN PAGE INTERSECTIONS & ANIMATIONS
    // Reveal items on scroll
    const revealElements = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // Mobile Menu Toggle
    mobileMenuToggle.addEventListener('click', () => {
        mobileMenuToggle.classList.toggle('open');
        navMenu.classList.toggle('open');
    });

    // Close mobile menu when nav link is clicked
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenuToggle.classList.remove('open');
            navMenu.classList.remove('open');
            
            // Active class tracking
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });

    // 4. PORTFOLIO FILTER MECHANISM (Simplified - no categories)
    const projectCards = document.querySelectorAll('.project-card');

    // 5. STATISTICS COUNTER ANIMATION
    const statNumbers = document.querySelectorAll('.stat-number');
    let countersRun = false;

    const runCounters = () => {
        if (countersRun) return;
        countersRun = true;

        statNumbers.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-target'), 10);
            let count = 0;
            const duration = 2000; // 2 seconds
            const stepTime = Math.max(Math.floor(duration / target), 15);
            
            const counterInterval = setInterval(() => {
                count += Math.ceil(target / (duration / stepTime));
                if (count >= target) {
                    stat.textContent = target;
                    clearInterval(counterInterval);
                } else {
                    stat.textContent = count;
                }
            }, stepTime);
        });
    };

    const statsSection = document.getElementById('stats');
    if (statsSection) {
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    runCounters();
                    statsObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });
        
        statsObserver.observe(statsSection);
    }

    // 6. PORTFOLIO CLICK DETAILS (LOCAL MP4 VIDEO PLAYER MODAL)
    const videoModal = document.getElementById('video-modal');
    const modalVideo = document.getElementById('modal-video');
    const modalClose = document.querySelector('.modal-close');

    projectCards.forEach(card => {
        card.addEventListener('click', () => {
            const videoUrl = card.getAttribute('data-video');
            const isLandscape = card.getAttribute('data-aspect') === '16-9' || card.classList.contains('landscape-card');
            if (modalVideo && videoUrl) {
                modalVideo.setAttribute('src', videoUrl);
                
                if (isLandscape) {
                    videoModal.classList.add('modal-landscape');
                } else {
                    videoModal.classList.remove('modal-landscape');
                }
                
                videoModal.classList.remove('hidden');
                document.body.style.overflow = 'hidden'; // Lock page scroll
                modalVideo.play().catch(e => console.log("Modal play blocked:", e));
            }
        });
    });

    const closeModal = () => {
        if (modalVideo) {
            modalVideo.pause();
            modalVideo.setAttribute('src', '');
        }
        videoModal.classList.add('hidden');
        videoModal.classList.remove('modal-landscape'); // Reset state
        document.body.style.overflow = 'auto'; // Unlock page scroll
    };

    modalClose.addEventListener('click', closeModal);
    videoModal.addEventListener('click', (e) => {
        if (e.target === videoModal) {
            closeModal();
        }
    });

    // 7. CONTACT FORM SUBMISSION (Real AJAX Email Delivery via FormSubmit)
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const submitBtn = contactForm.querySelector('.btn-submit');
            const originalText = submitBtn.innerHTML;
            
            const nameInput = document.getElementById('name');
            const emailInput = document.getElementById('email');
            const projectSelect = document.getElementById('project-type');
            const messageInput = document.getElementById('message');
            
            submitBtn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Sending...`;
            submitBtn.disabled = true;

            const accessKeyInput = document.getElementById('web3forms-access-key');
            
            const formData = {
                access_key: accessKeyInput ? accessKeyInput.value : "YOUR_ACCESS_KEY_HERE",
                name: nameInput.value,
                email: emailInput.value,
                "project type": projectSelect.value,
                message: messageInput.value
            };

            fetch("https://api.web3forms.com/submit", {
                method: "POST",
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formData)
            })
            .then(response => response.json())
            .then(data => {
                submitBtn.style.background = '#22c55e'; // Success green
                submitBtn.innerHTML = `<i class="fa-solid fa-check"></i> Project Sent!`;
                contactForm.reset();
                
                setTimeout(() => {
                    submitBtn.style.background = '';
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                }, 4000);
            })
            .catch(error => {
                console.error("Submission error:", error);
                submitBtn.style.background = '#ef4444'; // Error red
                submitBtn.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Try Again`;
                
                setTimeout(() => {
                    submitBtn.style.background = '';
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                }, 4000);
            });
        });
    }

    // 8. GLOBAL INITIALIZATION TRIGGERED ON LOAD
    window.initializeMainPage = () => {
        // Animate Header and Hero elements with GSAP
        const tl = gsap.timeline();
        
        tl.fromTo('.logo', 
            { opacity: 0, y: -20 }, 
            { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
        );

        tl.fromTo('.nav-link', 
            { opacity: 0, y: -20 }, 
            { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: "power3.out" },
            "-=0.6"
        );

        tl.fromTo('.header-cta', 
            { opacity: 0, scale: 0.9 }, 
            { opacity: 1, scale: 1, duration: 0.8, ease: "back.out(1.5)" },
            "-=0.6"
        );

        tl.fromTo('.tagline-badge', 
            { opacity: 0, y: 30 }, 
            { opacity: 1, y: 0, duration: 1, ease: "power4.out" },
            "-=0.4"
        );

        tl.fromTo('.hero-title .line-1', 
            { opacity: 0, y: 60 }, 
            { opacity: 1, y: 0, duration: 1.2, ease: "power4.out" },
            "-=0.8"
        );

        tl.fromTo('.hero-title .line-2', 
            { opacity: 0, y: 60 }, 
            { opacity: 1, y: 0, duration: 1.2, ease: "power4.out" },
            "-=1.0"
        );

        tl.fromTo('.hero-subtitle', 
            { opacity: 0, y: 30 }, 
            { opacity: 1, y: 0, duration: 1.2, ease: "power3.out" },
            "-=0.8"
        );

        tl.fromTo('.hero-actions .btn-primary', 
            { opacity: 0, x: -30 }, 
            { opacity: 1, x: 0, duration: 1, ease: "power3.out" },
            "-=0.8"
        );

        tl.fromTo('.hero-actions .btn-secondary', 
            { opacity: 0, x: 30 }, 
            { opacity: 1, x: 0, duration: 1, ease: "power3.out" },
            "-=1.0"
        );
    };
});
