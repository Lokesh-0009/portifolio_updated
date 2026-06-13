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
        progress += Math.random() * 15 + 10;
        if (progress >= 100) {
            progress = 100;
            timelineBar.style.width = `100%`;
            timelinePlayhead.style.left = `100%`;
            loaderStatus.textContent = loadingSteps[loadingSteps.length - 1];
            
            setTimeout(() => {
                enterPortfolioAutomatically();
            }, 200);
        } else {
            timelineBar.style.width = `${progress}%`;
            timelinePlayhead.style.left = `${progress}%`;
            
            // Randomly update status messages
            const stepIndex = Math.min(Math.floor((progress / 100) * loadingSteps.length), loadingSteps.length - 2);
            loaderStatus.textContent = loadingSteps[stepIndex];
            
            setTimeout(updateLoader, 20 + Math.random() * 30);
        }
    };

    // Begin Loading
    setTimeout(updateLoader, 300);

    // 2. AUTOMATIC ENTRANCE & AUTOPLAY WITH INTERACTIVE UNMUTE
    const mainHeader = document.getElementById('main-header');
    
    // Hide header initially (it's outside app-container now)
    if (mainHeader) mainHeader.classList.add('hidden');

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

        // Reveal header (now outside app-container)
        if (mainHeader) {
            mainHeader.classList.remove('hidden');
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

    // Scroll-based header behavior:
    // - Always visible on hero section
    // - On other sections: show on scroll, auto-hide after 5s of no movement
    let hideTimer = null;
    const HIDE_DELAY = 5000; // 5 seconds
    const heroSection = document.getElementById('hero');

    const showHeader = () => {
        const header = document.getElementById('main-header');
        if (header) header.classList.remove('header-hidden');
    };

    const hideHeader = () => {
        const header = document.getElementById('main-header');
        if (header) header.classList.add('header-hidden');
    };

    const resetHideTimer = () => {
        if (hideTimer) clearTimeout(hideTimer);
        hideTimer = setTimeout(() => {
            // Only auto-hide if we're past the hero section
            const heroBottom = heroSection ? heroSection.offsetTop + heroSection.offsetHeight : 0;
            if (window.scrollY > heroBottom - 100) {
                hideHeader();
            }
        }, HIDE_DELAY);
    };

    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        const header = document.getElementById('main-header');
        if (!header) return;

        // Add 'scrolled' class for enhanced glass effect when past top
        if (currentScrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Determine if we're in the hero section
        const heroBottom = heroSection ? heroSection.offsetTop + heroSection.offsetHeight : 0;
        const isInHero = currentScrollY < heroBottom - 100;

        if (isInHero) {
            // Hero section — always show, cancel any hide timer
            showHeader();
            if (hideTimer) clearTimeout(hideTimer);
        } else {
            // Past hero — show on any scroll, start 5s hide timer
            showHeader();
            resetHideTimer();
        }
    }, { passive: true });

    // Also show header on mouse/touch movement (for when user stops scrolling but moves mouse)
    const onUserActivity = () => {
        const heroBottom = heroSection ? heroSection.offsetTop + heroSection.offsetHeight : 0;
        if (window.scrollY >= heroBottom - 100) {
            showHeader();
            resetHideTimer();
        }
    };
    window.addEventListener('mousemove', onUserActivity, { passive: true });
    window.addEventListener('touchstart', onUserActivity, { passive: true });

    // Mobile Menu Toggle
    mobileMenuToggle.addEventListener('click', () => {
        mobileMenuToggle.classList.toggle('open');
        navMenu.classList.toggle('open');
        document.body.classList.toggle('menu-open');
    });

    // Close mobile menu when tapping the backdrop overlay (::before pseudo-element)
    navMenu.addEventListener('click', (e) => {
        // The ::before backdrop captures clicks and they bubble to navMenu
        // Only close if the click is directly on the navMenu (not its children/links)
        if (e.target === navMenu) {
            mobileMenuToggle.classList.remove('open');
            navMenu.classList.remove('open');
            document.body.classList.remove('menu-open');
        }
    });

    // Close mobile menu and update active on nav link click
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenuToggle.classList.remove('open');
            navMenu.classList.remove('open');
            document.body.classList.remove('menu-open');

            // Active class tracking
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });

    // Auto-update active nav link based on scroll position
    const sections = [
        { id: 'hero',     selector: '[href="#hero"]' },
        { id: 'work',     selector: '[href="#work"]' },
        { id: 'services', selector: '[href="#services"]' },
        { id: 'contact',  selector: '[href="#contact"]' },
    ];

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                const match = sections.find(s => s.id === id);
                if (match) {
                    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                    const activeLink = document.querySelector(`.nav-link${match.selector}`);
                    if (activeLink) activeLink.classList.add('active');
                }
            }
        });
    }, { threshold: 0.3 });

    sections.forEach(s => {
        const el = document.getElementById(s.id);
        if (el) sectionObserver.observe(el);
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

    // 6. PORTFOLIO CLICK DETAILS (DYNAMIC VIDEO / IFRAME PLAYER MODAL)
    const videoModal = document.getElementById('video-modal');
    const modalClose = document.querySelector('.modal-close');
    const videoWrapper = document.querySelector('.video-wrapper');
    const customVideoControls = document.getElementById('custom-video-controls');

    let currentVideo = null;
    let isSeeking = false;

    const setupCustomControls = (video) => {
        currentVideo = video;
        const playBtn = customVideoControls.querySelector('.play-btn');
        const timelineSlider = customVideoControls.querySelector('.timeline-slider');
        const timelineProgress = customVideoControls.querySelector('.timeline-progress');
        const timeDisplay = customVideoControls.querySelector('.time-display');
        const volumeBtn = customVideoControls.querySelector('.volume-btn');
        const volumeBtnMobile = customVideoControls.querySelector('.volume-btn-mobile');
        const settingsBtn = customVideoControls.querySelector('.settings-btn');
        const settingsDropdown = customVideoControls.querySelector('.settings-dropdown');
        const speedSelect = customVideoControls.querySelector('.speed-select');
        const fullscreenBtn = customVideoControls.querySelector('.fullscreen-btn');
        const fullscreenBtnMobile = customVideoControls.querySelector('.fullscreen-btn-mobile');

        // Reset elements state
        if (playBtn) playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
        if (timelineSlider) timelineSlider.value = 0;
        if (timelineProgress) timelineProgress.style.width = '0%';
        if (timeDisplay) timeDisplay.textContent = '0:00 / 0:00';
        if (speedSelect) speedSelect.value = '1';
        if (settingsDropdown) settingsDropdown.classList.add('hidden');
        if (volumeBtn) volumeBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
        if (volumeBtnMobile) volumeBtnMobile.innerHTML = '<i class="fa-solid fa-volume-high"></i>';

        // Helper: format time in MM:SS
        const formatTime = (seconds) => {
            if (isNaN(seconds) || seconds === Infinity) return '0:00';
            const m = Math.floor(seconds / 60);
            const s = Math.floor(seconds % 60);
            return `${m}:${s < 10 ? '0' : ''}${s}`;
        };

        // Play/Pause event
        const togglePlay = () => {
            if (video.paused) {
                video.play().catch(e => console.log("Play failed:", e));
            } else {
                video.pause();
            }
        };

        playBtn.onclick = (e) => {
            e.stopPropagation();
            togglePlay();
        };
        video.onclick = togglePlay;

        video.onplay = () => {
            playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
        };

        video.onpause = () => {
            playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
        };

        // Time updates
        video.ontimeupdate = () => {
            if (isSeeking) return;
            const pct = (video.currentTime / video.duration) * 100;
            timelineSlider.value = pct || 0;
            timelineProgress.style.width = `${pct || 0}%`;
            timeDisplay.textContent = `${formatTime(video.currentTime)} / ${formatTime(video.duration)}`;
        };

        video.onloadedmetadata = () => {
            timeDisplay.textContent = `0:00 / ${formatTime(video.duration)}`;
        };

        // Seeking events
        timelineSlider.oninput = () => {
            isSeeking = true;
            timelineProgress.style.width = `${timelineSlider.value}%`;
            if (video.duration) {
                const targetTime = (timelineSlider.value / 100) * video.duration;
                timeDisplay.textContent = `${formatTime(targetTime)} / ${formatTime(video.duration)}`;
            }
        };

        timelineSlider.onchange = () => {
            isSeeking = false;
            if (video.duration) {
                video.currentTime = (timelineSlider.value / 100) * video.duration;
            }
        };

        // Sync volume change
        video.onvolumechange = () => {
            if (video.muted) {
                if (volumeBtn) volumeBtn.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
                if (volumeBtnMobile) volumeBtnMobile.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
            } else {
                if (volumeBtn) volumeBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
                if (volumeBtnMobile) volumeBtnMobile.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
            }
        };

        // Volume / Mute
        const toggleMute = () => {
            video.muted = !video.muted;
        };

        if (volumeBtn) {
            volumeBtn.onclick = (e) => {
                e.stopPropagation();
                toggleMute();
            };
        }
        if (volumeBtnMobile) {
            volumeBtnMobile.onclick = (e) => {
                e.stopPropagation();
                toggleMute();
            };
        }

        // Settings gears toggle
        settingsBtn.onclick = (e) => {
            e.stopPropagation();
            settingsDropdown.classList.toggle('hidden');
        };

        // Speed change option
        speedSelect.onchange = () => {
            video.playbackRate = parseFloat(speedSelect.value);
            settingsDropdown.classList.add('hidden'); // auto-close on selection
        };

        // Fullscreen
        const triggerFullscreen = () => {
            if (video.requestFullscreen) {
                video.requestFullscreen();
            } else if (video.webkitRequestFullscreen) {
                video.webkitRequestFullscreen(); // Safari
            } else if (video.msRequestFullscreen) {
                video.msRequestFullscreen(); // IE11
            }
        };

        if (fullscreenBtn) {
            fullscreenBtn.onclick = (e) => {
                e.stopPropagation();
                triggerFullscreen();
            };
        }
        if (fullscreenBtnMobile) {
            fullscreenBtnMobile.onclick = (e) => {
                e.stopPropagation();
                triggerFullscreen();
            };
        }
    };

    // Close settings dropdown when clicking outside
    window.addEventListener('click', (e) => {
        const settingsDropdown = customVideoControls ? customVideoControls.querySelector('.settings-dropdown') : null;
        const settingsBtn = customVideoControls ? customVideoControls.querySelector('.settings-btn') : null;
        if (settingsDropdown && settingsBtn && !settingsBtn.contains(e.target) && !settingsDropdown.contains(e.target)) {
            settingsDropdown.classList.add('hidden');
        }
    });

    projectCards.forEach(card => {
        card.addEventListener('click', () => {
            const videoUrl = card.getAttribute('data-video');
            const isLandscape = card.getAttribute('data-aspect') === '16-9' || card.classList.contains('landscape-card');
            if (videoWrapper && videoUrl) {
                const isDrive = videoUrl.includes('drive.google.com');

                const isMobile = window.innerWidth <= 768;

                if (isDrive) {
                    // Hide custom controls overlay for iframe embeds
                    if (customVideoControls) customVideoControls.classList.add('hidden');

                    let embedUrl = videoUrl;
                    if (videoUrl.includes('uc?export=download&id=')) {
                        const id = videoUrl.split('id=')[1].split('&')[0];
                        embedUrl = `https://drive.google.com/file/d/${id}/preview`;
                    } else if (videoUrl.includes('/file/d/') && !videoUrl.includes('/preview')) {
                        embedUrl = videoUrl.replace(/\/view.*/, '/preview');
                    }
                    
                    console.log("Drive iframe used");
                    videoWrapper.innerHTML = `<iframe id="modal-iframe" src="${embedUrl}" style="width:100%;height:100%;border:none;" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
                } else {
                    // Show custom controls overlay for direct video elements only on desktop
                    if (customVideoControls) {
                        if (isMobile) {
                            customVideoControls.classList.add('hidden');
                        } else {
                            customVideoControls.classList.remove('hidden');
                        }
                    }

                    // Convert Drive URL to direct stream link for HTML5 video element on mobile
                    let playUrl = videoUrl;
                    if (isDrive) {
                        let id = '';
                        if (videoUrl.includes('id=')) {
                            id = videoUrl.split('id=')[1].split('&')[0];
                        } else if (videoUrl.includes('/file/d/')) {
                            id = videoUrl.split('/file/d/')[1].split('/')[0];
                        }
                        if (id) {
                            // Use direct streaming uc?id= endpoint instead of export=download to bypass Content-Disposition: attachment blocks on mobile Safari
                            playUrl = `https://drive.google.com/uc?id=${id}`;
                        }
                    }

                    videoWrapper.innerHTML = `<video id="modal-video" autoplay muted playsinline src="${encodeURI(decodeURI(playUrl))}"></video>`;
                    const modalVideo = document.getElementById('modal-video');
                    if (modalVideo) {
                        modalVideo.load();
                        modalVideo.play().catch(e => console.log("Modal play blocked:", e));
                        
                        if (!isMobile) {
                            setupCustomControls(modalVideo);
                        }
                    }
                }

                if (isLandscape) {
                    videoModal.classList.add('modal-landscape');
                } else {
                    videoModal.classList.remove('modal-landscape');
                }

                videoModal.classList.remove('hidden');
                document.documentElement.classList.add('modal-open');
                document.body.classList.add('modal-open');
            }
        });
    });

    const closeModal = () => {
        if (videoWrapper) {
            videoWrapper.innerHTML = ''; // Clear video/iframe resources completely
        }
        if (customVideoControls) {
            customVideoControls.classList.add('hidden');
        }
        currentVideo = null;
        videoModal.classList.add('hidden');
        videoModal.classList.remove('modal-landscape');
        document.documentElement.classList.remove('modal-open');
        document.body.classList.remove('modal-open');
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

        tl.fromTo('.hero-greeting', 
            { opacity: 0, y: 30 }, 
            { opacity: 1, y: 0, duration: 1, ease: "power4.out" },
            "-=0.8"
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

        tl.fromTo('.hero-image-wrapper', 
            { opacity: 0, scale: 0.95, y: 20 }, 
            { opacity: 1, scale: 1, y: 0, duration: 1.5, ease: "power4.out" },
            "-=1.2"
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

    // ==========================================================================
    // 9. DYNAMIC GLASSMORPHISM ANTI-GRAVITY PARTICLE BACKDROP (Perplexity Style)
    // ==========================================================================
    const particleCanvas = document.getElementById('particles-canvas');
    if (particleCanvas) {
        const ctx = particleCanvas.getContext('2d');
        let particles = [];
        let animationFrameId = null;
        let width = 0;
        let height = 0;
        const dpr = window.devicePixelRatio || 1;
        let lastTime = 0;
        let draggedParticle = null;

        // Track mouse coordinates globally
        const mouse = {
            x: null,
            y: null,
            radius: 140 // magnetic hover attraction/repulsion radius
        };

        const onMouseDown = (e) => {
            if (window.innerWidth <= 768) return;
            const clientX = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0].clientX);
            const clientY = e.clientY !== undefined ? e.clientY : (e.touches && e.touches[0].clientY);
            if (clientX === undefined || clientY === undefined) return;

            // Check if user clicked on an interactive HTML node to prevent blocking normal clicks
            const target = e.target;
            const isInteractive = target.closest('a, button, input, select, textarea, [role="button"], .project-card, .mobile-menu-toggle, .btn-primary, .btn-secondary, .social-links a, .nav-link, .profile-socials-pill a, .contact-item a');
            if (isInteractive) return;

            // Search for closest particle intersection
            let closestParticle = null;
            let minDist = Infinity;
            
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                const dist = Math.hypot(p.x - clientX, p.y - clientY);
                // Size-based selection limit + touch padding (15px)
                if (dist < p.size + 15 && dist < minDist) {
                    minDist = dist;
                    closestParticle = p;
                }
            }

            if (closestParticle) {
                draggedParticle = closestParticle;
                draggedParticle.isDragging = true;
                draggedParticle.dragAlpha = 0.0; // disable anti-gravity
                mouse.x = clientX;
                mouse.y = clientY;
                if (e.cancelable) e.preventDefault();
            }
        };

        const onMouseMove = (e) => {
            if (window.innerWidth <= 768) return;
            const clientX = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0].clientX);
            const clientY = e.clientY !== undefined ? e.clientY : (e.touches && e.touches[0].clientY);
            if (clientX === undefined || clientY === undefined) return;

            mouse.x = clientX;
            mouse.y = clientY;
        };

        const onMouseUp = () => {
            if (window.innerWidth <= 768) return;
            if (draggedParticle) {
                draggedParticle.isDragging = false;
                draggedParticle = null;
            }
        };

        // Attach global events to window
        window.addEventListener('mousedown', onMouseDown, { passive: false });
        window.addEventListener('mousemove', onMouseMove, { passive: true });
        window.addEventListener('mouseup', onMouseUp, { passive: true });

        window.addEventListener('touchstart', onMouseDown, { passive: false });
        window.addEventListener('touchmove', onMouseMove, { passive: true });
        window.addEventListener('touchend', onMouseUp, { passive: true });
        window.addEventListener('touchcancel', onMouseUp, { passive: true });

        window.addEventListener('mouseleave', () => {
            mouse.x = null;
            mouse.y = null;
            if (draggedParticle) {
                draggedParticle.isDragging = false;
                draggedParticle = null;
            }
        });

        class Particle {
            constructor() {
                this.reset(true);
            }

            reset(initial = false) {
                this.x = Math.random() * width;
                this.y = initial ? Math.random() * height : height + 60;
                
                // size distribution: 85% small/mid, 15% larger glass orbs
                const r = Math.random();
                if (r < 0.85) {
                    this.size = Math.random() * 12 + 4; // 4px to 16px
                } else if (r < 0.97) {
                    this.size = Math.random() * 15 + 16; // 16px to 31px
                } else {
                    this.size = Math.random() * 29 + 31; // 31px to 60px
                }
                
                // Mass proportional to area/size to drive inertia
                this.mass = (this.size * this.size * 0.05) + 1;
                
                // Base anti-gravity speed (smaller float faster, larger float slower)
                this.baseVy = - (1.4 / Math.sqrt(this.size)) - 0.15;
                
                this.vx = Math.random() * 0.2 - 0.1;
                this.vy = this.baseVy;
                
                // Dynamic colors matching portfolio palette
                const randColor = Math.random();
                if (randColor < 0.45) {
                    this.colorType = 'purple';
                } else if (randColor < 0.90) {
                    this.colorType = 'cyan';
                } else {
                    this.colorType = 'white';
                }
                
                this.noisePhase = Math.random() * 100;
                this.glow = 0.0;
                this.isDragging = false;
                this.dragAlpha = 1.0; // anti-gravity scale (1.0 = full float, 0.0 = none)
            }

            update(time) {
                if (this.isDragging) {
                    // Spring pull towards cursor position
                    const dx = mouse.x - this.x;
                    const dy = mouse.y - this.y;
                    this.vx += (dx * 0.15) / this.mass;
                    this.vy += (dy * 0.15) / this.mass;
                    // Strong friction during drag to prevent jittering
                    this.vx *= 0.82;
                    this.vy *= 0.82;
                    this.glow = Math.min(1.0, this.glow + 0.1);
                } else {
                    // Gradually restore anti-gravity weight on drag release
                    if (this.dragAlpha < 1.0) {
                        this.dragAlpha += 0.02;
                    }

                    // Perlin-like wave drift horizontal velocity
                    const targetVx = Math.sin(this.y * 0.005 + time * 0.0012 + this.noisePhase) * 0.35;
                    this.vx += (targetVx - this.vx) * 0.03;

                    // Buoyancy drift vertical velocity
                    const targetVy = (this.baseVy + Math.cos(this.x * 0.003 + time * 0.001 + this.noisePhase) * 0.15) * this.dragAlpha;
                    this.vy += (targetVy - this.vy) * 0.03;

                    // Proximity interaction field
                    if (mouse.x !== null && mouse.y !== null) {
                        const dx = this.x - mouse.x;
                        const dy = this.y - mouse.y;
                        const dist = Math.hypot(dx, dy);

                        if (dist < mouse.radius) {
                            const force = (mouse.radius - dist) / mouse.radius;
                            const angle = Math.atan2(dy, dx);

                            // Push away softly from magnetic cursor
                            this.vx += (Math.cos(angle) * force * 0.8) / this.mass;
                            this.vy += (Math.sin(angle) * force * 0.8) / this.mass;
                            
                            // Elevate light glow intensity
                            this.glow = Math.min(1.0, this.glow + 0.06);
                        } else {
                            this.glow = Math.max(0.0, this.glow - 0.02);
                        }
                    } else {
                        this.glow = Math.max(0.0, this.glow - 0.02);
                    }

                    // Apply normal movement damping
                    this.vx *= 0.98;
                    this.vy *= 0.98;
                }

                // Apply updates
                this.x += this.vx;
                this.y += this.vy;

                // Screen boundary collision checks (soft bounce)
                const bounce = -0.45;
                if (this.x < this.size) {
                    this.x = this.size;
                    this.vx *= bounce;
                } else if (this.x > width - this.size) {
                    this.x = width - this.size;
                    this.vx *= bounce;
                }

                // If float out top of viewport, recycle to bottom
                if (this.y < -this.size - 10) {
                    this.reset(false);
                }
            }

            draw() {
                ctx.save();
                
                const currentSize = this.size * (this.isDragging ? 1.08 : (1.0 + this.glow * 0.05));
                
                // 1. Ambient Blur Glow / Drop Shadow
                const glowRadius = currentSize * 2.2;
                const glowGrad = ctx.createRadialGradient(this.x, this.y, currentSize * 0.5, this.x, this.y, glowRadius);
                
                let glowColor = 'rgba(109, 40, 217, 0.015)'; // Purple default
                if (this.colorType === 'cyan') {
                    glowColor = 'rgba(8, 145, 178, 0.015)';
                } else if (this.colorType === 'white') {
                    glowColor = 'rgba(255, 255, 255, 0.03)';
                }
                
                const baseGlowAlpha = this.isDragging ? 0.25 : (0.04 + this.glow * 0.12);
                const targetGlowColor = glowColor.replace(/[\d.]+\)$/, `${baseGlowAlpha})`);
                
                glowGrad.addColorStop(0, targetGlowColor);
                glowGrad.addColorStop(0.5, targetGlowColor.replace(/[\d.]+\)$/, `${baseGlowAlpha * 0.4})`));
                glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
                
                ctx.fillStyle = glowGrad;
                ctx.beginPath();
                ctx.arc(this.x, this.y, glowRadius, 0, Math.PI * 2);
                ctx.fill();
                
                // 2. Glass Base fill (specular radial lighting gradient)
                const specularX = this.x - currentSize * 0.22;
                const specularY = this.y - currentSize * 0.22;
                const fillGrad = ctx.createRadialGradient(specularX, specularY, currentSize * 0.05, this.x, this.y, currentSize);
                
                if (this.colorType === 'purple') {
                    fillGrad.addColorStop(0, 'rgba(196, 181, 253, 0.22)');
                    fillGrad.addColorStop(0.5, 'rgba(139, 92, 246, 0.09)');
                    fillGrad.addColorStop(1, 'rgba(109, 40, 217, 0.04)');
                } else if (this.colorType === 'cyan') {
                    fillGrad.addColorStop(0, 'rgba(207, 250, 254, 0.22)');
                    fillGrad.addColorStop(0.5, 'rgba(6, 182, 212, 0.09)');
                    fillGrad.addColorStop(1, 'rgba(8, 145, 178, 0.04)');
                } else {
                    fillGrad.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
                    fillGrad.addColorStop(0.5, 'rgba(241, 245, 249, 0.10)');
                    fillGrad.addColorStop(1, 'rgba(203, 213, 225, 0.05)');
                }
                
                ctx.fillStyle = fillGrad;
                ctx.beginPath();
                ctx.arc(this.x, this.y, currentSize, 0, Math.PI * 2);
                ctx.fill();

                // 3. Specular Highlights (Reflection Curve & Dot)
                if (currentSize > 6) {
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, currentSize * 0.85, Math.PI * 1.05, Math.PI * 1.55);
                    ctx.strokeStyle = `rgba(255, 255, 255, ${0.30 + this.glow * 0.2})`;
                    ctx.lineWidth = currentSize * 0.06;
                    ctx.stroke();
                    
                    ctx.beginPath();
                    ctx.ellipse(specularX, specularY, currentSize * 0.12, currentSize * 0.08, Math.PI / 4, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(255, 255, 255, ${0.40 + this.glow * 0.25})`;
                    ctx.fill();
                }

                // 4. White Glass Rim Outline (Refraction Edge)
                ctx.beginPath();
                ctx.arc(this.x, this.y, currentSize, 0, Math.PI * 2);
                const strokeAlpha = 0.07 + this.glow * 0.15 + (this.isDragging ? 0.25 : 0.0);
                ctx.strokeStyle = `rgba(255, 255, 255, ${strokeAlpha})`;
                ctx.lineWidth = currentSize > 15 ? 1.0 : 0.6;
                ctx.stroke();
                
                ctx.restore();
            }
        }

        const resizeCanvas = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            
            if (width <= 768) {
                if (animationFrameId) {
                    cancelAnimationFrame(animationFrameId);
                    animationFrameId = null;
                }
                ctx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
                particles = [];
                return;
            }
            
            particleCanvas.width = width * dpr;
            particleCanvas.height = height * dpr;
            ctx.scale(dpr, dpr);
            
            // Scaled adaptive density count based on screen width
            // ~40 on mobile up to ~180 on wide screens
            const count = Math.min(Math.floor((width * height) / 9500), 220);
            
            if (particles.length < count) {
                const diff = count - particles.length;
                for (let i = 0; i < diff; i++) {
                    particles.push(new Particle());
                }
            } else if (particles.length > count) {
                particles.splice(count);
            }

            if (!animationFrameId) {
                animate(0);
            }
        };

        const initParticles = () => {
            resizeCanvas();
            window.addEventListener('resize', resizeCanvas);
            if (window.innerWidth > 768) {
                animate(0);
            }
        };

        const animate = (timestamp) => {
            if (window.innerWidth <= 768) {
                ctx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
                animationFrameId = null;
                return;
            }
            ctx.clearRect(0, 0, width, height);
            
            const time = timestamp || 0;

            // 1. Double loop to handle Soft Collisions and Clustering Forces
            for (let i = 0; i < particles.length; i++) {
                const p1 = particles[i];
                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx = p2.x - p1.x;
                    const dy = p2.y - p1.y;
                    
                    // Quick boundary reject check before expensive math
                    if (Math.abs(dx) > 180 || Math.abs(dy) > 180) continue;
                    
                    const dist = Math.hypot(dx, dy);
                    const minDist = p1.size + p2.size;

                    // Soft collisions push-back
                    if (dist < minDist) {
                        const overlap = minDist - dist;
                        const angle = Math.atan2(dy, dx);
                        const force = overlap * 0.08;
                        
                        p1.vx -= (Math.cos(angle) * force) / p1.mass;
                        p1.vy -= (Math.sin(angle) * force) / p1.mass;
                        p2.vx += (Math.cos(angle) * force) / p2.mass;
                        p2.vy += (Math.sin(angle) * force) / p2.mass;
                    } 
                    // Clustering attraction forces
                    else if (dist < 180) {
                        const force = (180 - dist) * 0.0001;
                        const angle = Math.atan2(dy, dx);
                        
                        p1.vx += (Math.cos(angle) * force) / p1.mass;
                        p1.vy += (Math.sin(angle) * force) / p1.mass;
                        p2.vx -= (Math.cos(angle) * force) / p2.mass;
                        p2.vy -= (Math.sin(angle) * force) / p2.mass;
                    }

                    // Optional connecting lines inside AI cloud
                    if (dist < 90) {
                        const lineAlpha = ((90 - dist) / 90) * 0.06;
                        ctx.strokeStyle = `rgba(109, 40, 217, ${lineAlpha})`;
                        ctx.lineWidth = 0.5;
                        ctx.beginPath();
                        ctx.moveTo(p1.x, p1.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                }
            }

            // 2. Update positions and draw
            for (let i = 0; i < particles.length; i++) {
                particles[i].update(time);
                particles[i].draw();
            }
            
            animationFrameId = requestAnimationFrame(animate);
        };

        initParticles();
    }
});
