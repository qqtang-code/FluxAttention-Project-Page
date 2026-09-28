/* FluxAttention project page scripts.
   Plain DOM APIs only: the page has no carousel, slider or video, so the
   template's jQuery/bulma-carousel hooks were dropped along with the jQuery
   CDN request (blocked on some networks, and a blocked script used to take the
   navigation down with it). */

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
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Show/hide the scroll-to-top button
function setupScrollToTop() {
    const scrollButton = document.querySelector('.scroll-to-top');
    if (!scrollButton) return;

    const sync = function () {
        scrollButton.classList.toggle('visible', window.scrollY > 300);
    };
    sync();
    window.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync, { passive: true });
}

// Sticky section navigation: mobile toggle, stuck state, active link
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
    window.addEventListener('resize', syncStuckState, { passive: true });
    window.addEventListener('hashchange', syncStuckState);

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

    // Close the menu when a link is followed (covers keyboard activation too).
    window.addEventListener('hashchange', closeMenu);
}

setupScrollToTop();
setupNav();