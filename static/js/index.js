window.HELP_IMPROVE_VIDEOJS = false;

// More Works Dropdown Functionality
function toggleMoreWorks() {
    const dropdown = document.getElementById('moreWorksDropdown');
    const button = document.querySelector('.more-works-btn');

    if (!dropdown || !button) return;
    
    if (dropdown.classList.contains('show')) {
        dropdown.classList.remove('show');
        button.classList.remove('active');
    } else {
        dropdown.classList.add('show');
        button.classList.add('active');
    }
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const container = document.querySelector('.more-works-container');
    const dropdown = document.getElementById('moreWorksDropdown');
    const button = document.querySelector('.more-works-btn');
    
    if (container && dropdown && button && !container.contains(event.target)) {
        dropdown.classList.remove('show');
        button.classList.remove('active');
    }
});

// Close dropdown on escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const dropdown = document.getElementById('moreWorksDropdown');
        const button = document.querySelector('.more-works-btn');
        if (dropdown && button) {
            dropdown.classList.remove('show');
            button.classList.remove('active');
        }
    }
});

// Copy BibTeX to clipboard
function copyBibTeX() {
    const bibtexElement = document.getElementById('bibtex-code');
    const button = document.querySelector('.copy-bibtex-btn');
    if (!bibtexElement || !button) return;

    const copyText = button.querySelector('.copy-text');
    const originalLabel = copyText ? copyText.textContent : '';

    const showFeedback = function () {
        button.classList.add('copied');
        if (copyText) copyText.textContent = 'Copied!';
        setTimeout(function () {
            button.classList.remove('copied');
            if (copyText) copyText.textContent = originalLabel;
        }, 2000);
    };

    const copyWithFallback = function () {
        const textArea = document.createElement('textarea');
        textArea.value = bibtexElement.textContent;
        textArea.setAttribute('readonly', '');
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
        document.body.removeChild(textArea);
        showFeedback();
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(bibtexElement.textContent)
            .then(showFeedback)
            .catch(copyWithFallback);
    } else {
        copyWithFallback();
    }
}

// Scroll to top functionality
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Show/hide scroll to top button
window.addEventListener('scroll', function() {
    const scrollButton = document.querySelector('.scroll-to-top');
    if (window.pageYOffset > 300) {
        scrollButton.classList.add('visible');
    } else {
        scrollButton.classList.remove('visible');
    }
});

// Video carousel autoplay when in view
function setupVideoCarouselAutoplay() {
    const carouselVideos = document.querySelectorAll('.results-carousel video');
    
    if (carouselVideos.length === 0) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target;
            if (entry.isIntersecting) {
                // Video is in view, play it
                video.play().catch(e => {
                    // Autoplay failed, probably due to browser policy
                    console.log('Autoplay prevented:', e);
                });
            } else {
                // Video is out of view, pause it
                video.pause();
            }
        });
    }, {
        threshold: 0.5 // Trigger when 50% of the video is visible
    });
    
    carouselVideos.forEach(video => {
        observer.observe(video);
    });
}

function setupDemoVideoPlayback() {
    const demoVideo = document.querySelector('.demo-video[data-playback-rate]');

    if (!demoVideo) return;

    const playbackRate = Number(demoVideo.dataset.playbackRate || '1');
    let isEnforcingPlaybackRate = false;

    const applyPlaybackRate = () => {
        if (isEnforcingPlaybackRate) return;

        isEnforcingPlaybackRate = true;
        demoVideo.defaultPlaybackRate = playbackRate;
        demoVideo.playbackRate = playbackRate;
        isEnforcingPlaybackRate = false;
    };

    applyPlaybackRate();
    demoVideo.addEventListener('loadedmetadata', applyPlaybackRate);
    demoVideo.addEventListener('canplay', applyPlaybackRate);
    demoVideo.addEventListener('play', applyPlaybackRate);
    demoVideo.addEventListener('ratechange', () => {
        if (demoVideo.playbackRate !== playbackRate) {
            applyPlaybackRate();
        }
    });
}

$(document).ready(function() {
    if (typeof bulmaCarousel !== 'undefined' && document.querySelector('.carousel')) {
        var options = {
            slidesToScroll: 1,
            slidesToShow: 1,
            loop: true,
            infinite: true,
            autoplay: true,
            autoplaySpeed: 5000,
        };

        bulmaCarousel.attach('.carousel', options);
    }

    if (typeof bulmaSlider !== 'undefined') {
        bulmaSlider.attach();
    }

    setupVideoCarouselAutoplay();
    setupDemoVideoPlayback();
});

// ---------------------------------------------------------------------------
// Sticky section navigation: mobile toggle, stuck state, active link
// ---------------------------------------------------------------------------
function setupNav() {
    const nav = document.getElementById('siteNav');
    const toggle = document.querySelector('.nav-toggle');
    const links = document.getElementById('navLinks');
    if (!nav || !toggle || !links) return;

    const closeMenu = function () {
        links.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
    };

    toggle.addEventListener('click', function () {
        const isOpen = links.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', String(isOpen));
    });

    links.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') closeMenu();
    });

    const syncStuckState = function () {
        nav.classList.toggle('is-stuck', window.scrollY > 8);
    };
    syncStuckState();
    window.addEventListener('scroll', syncStuckState, { passive: true });

    const sectionLinks = Array.prototype.slice.call(links.querySelectorAll('a[href^="#"]'));
    const sections = sectionLinks
        .map(function (link) { return document.querySelector(link.getAttribute('href')); })
        .filter(Boolean);

    if (!sections.length || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            sectionLinks.forEach(function (link) {
                link.classList.toggle('is-active', link.getAttribute('href') === '#' + entry.target.id);
            });
        });
    }, { rootMargin: '-25% 0px -65% 0px', threshold: 0 });

    sections.forEach(function (section) { observer.observe(section); });
}

setupNav();
