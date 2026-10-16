(function () {
  'use strict';

  // ---------- Reload: start at the top, drop the #hash ----------
  var navEntry = window.performance && performance.getEntriesByType
    ? performance.getEntriesByType('navigation')[0]
    : null;
  var isReload = navEntry
    ? navEntry.type === 'reload'
    : !!(performance.navigation && performance.navigation.type === 1);

  if (isReload) {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    if (location.hash) history.replaceState(null, '', location.pathname + location.search);
    window.scrollTo(0, 0);
    window.addEventListener('load', function () { window.scrollTo(0, 0); });
  }

  function init() {

    // ---------- Scroll reveal ----------
    var revealEls = document.querySelectorAll('.reveal');

    if ('IntersectionObserver' in window && revealEls.length) {
      var revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0, rootMargin: '0px 0px -8% 0px' });

      revealEls.forEach(function (el) { revealObserver.observe(el); });
    } else {
      revealEls.forEach(function (el) { el.classList.add('is-visible'); });
    }

    // ---------- Back to top ----------
    var backToTop = document.querySelector('.back-to-top');
    if (backToTop) {
      backToTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // ---------- Testimonials ----------
    // Add approved reviews here. Each one looks like:
    //   { name: 'Client Name', image: 'https://example.com/photo.jpg', text: 'Their real words.' }
    // Only add reviews from real clients who agreed to be quoted.
    var REVIEWS = [];

    // Form submissions go to this address through FormSubmit. After activating
    // your email with FormSubmit, you can swap it for the random alias they
    // give you so the address doesn't appear in this file.
    var REVIEW_EMAIL = 'contact.nivasvisuals@gmail.com';
    var FORM_ENDPOINT = 'https://formsubmit.co/ajax/' + REVIEW_EMAIL;

    var testimonialGrid = document.getElementById('testimonial-grid');

    function renderTestimonialCard(review) {
      var card = document.createElement('article');
      card.className = 'testimonial-card';

      var person = document.createElement('div');
      person.className = 'testimonial-person';

      if (review.image && /^https?:\/\//i.test(review.image)) {
        var img = document.createElement('img');
        img.className = 'testimonial-avatar';
        img.alt = '';
        img.loading = 'lazy';
        img.src = review.image;
        person.appendChild(img);
      }

      var name = document.createElement('span');
      name.className = 'testimonial-name';
      name.textContent = review.name || '';
      person.appendChild(name);

      var text = document.createElement('p');
      text.className = 'testimonial-text';
      text.textContent = review.text || '';

      card.appendChild(person);
      card.appendChild(text);
      return card;
    }

    if (testimonialGrid) {
      if (Array.isArray(REVIEWS) && REVIEWS.length) {
        REVIEWS.forEach(function (review) {
          testimonialGrid.appendChild(renderTestimonialCard(review));
        });
      } else {
        var empty = document.createElement('p');
        empty.className = 'testimonial-empty';
        empty.textContent = 'Worked with us? Be the first to leave a review.';
        testimonialGrid.appendChild(empty);
      }
    }

    // ---------- Review modal ----------
    var reviewBtn = document.getElementById('open-review-modal');
    var reviewModal = document.getElementById('review-modal');
    var reviewModalClose = document.getElementById('close-review-modal');
    var reviewForm = document.getElementById('review-form');
    var reviewStatus = document.getElementById('review-status');
    var lastFocus = null;
    var statusTimer = null;

    function isModalOpen() {
      return !!reviewModal && reviewModal.classList.contains('is-open');
    }

    function openReviewModal() {
      if (!reviewModal) return;
      lastFocus = document.activeElement;
      reviewModal.removeAttribute('inert');
      reviewModal.classList.add('is-open');
      document.body.classList.add('modal-open');
      var first = document.getElementById('review-name');
      if (first) setTimeout(function () { first.focus(); }, 50);
    }

    function closeReviewModal() {
      if (!reviewModal || !isModalOpen()) return;
      reviewModal.classList.remove('is-open');
      reviewModal.setAttribute('inert', '');
      document.body.classList.remove('modal-open');
      if (statusTimer) { clearTimeout(statusTimer); statusTimer = null; }
      if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
    }

    if (reviewBtn) reviewBtn.addEventListener('click', openReviewModal);
    if (reviewModalClose) reviewModalClose.addEventListener('click', closeReviewModal);

    if (reviewModal) {
      reviewModal.addEventListener('click', function (e) {
        if (e.target === reviewModal) closeReviewModal();
      });

      // Keep Tab focus inside the open dialog
      reviewModal.addEventListener('keydown', function (e) {
        if (e.key !== 'Tab') return;
        var focusables = Array.prototype.filter.call(
          reviewModal.querySelectorAll('a[href], button:not([disabled]), input, textarea, select'),
          function (el) {
            return el.type !== 'hidden' && el.tabIndex !== -1 && el.offsetParent !== null;
          }
        );
        if (!focusables.length) return;
        var firstEl = focusables[0];
        var lastEl = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        } else if (!e.shiftKey && document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      });
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeReviewModal();
    });

    function showReviewStatus(message, isError) {
      if (!reviewStatus) return;
      reviewStatus.textContent = message;
      reviewStatus.classList.toggle('is-error', !!isError);
      reviewStatus.classList.add('is-visible');
    }

    // ---------- Review form ----------
    if (reviewForm) {
      reviewForm.addEventListener('submit', function (e) {
        e.preventDefault();

        var name = document.getElementById('review-name').value.trim();
        var photo = document.getElementById('review-Photo').value.trim();
        var text = document.getElementById('review-text').value.trim();
        var honeypot = document.getElementById('review-website');

        if (!name || !text) return;
        if (honeypot && honeypot.value) return;

        var submitBtn = reviewForm.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.disabled = true;
        showReviewStatus('Sending…', false);

        fetch(FORM_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({
            Name: name,
            Photo: photo || 'Not provided',
            Review: text,
            _subject: 'New review from ' + name,
            _template: 'table',
            _captcha: 'false'
          })
        })
          .then(function (res) {
            if (!res.ok) throw new Error('Request failed');
            return res.json();
          })
          .then(function () {
            reviewForm.reset();
            showReviewStatus('Thank you! Your review has been sent.', false);
            statusTimer = setTimeout(function () {
              closeReviewModal();
              if (reviewStatus) reviewStatus.classList.remove('is-visible');
            }, 1800);
          })
          .catch(function (err) {
            console.error('Review form error:', err);
            showReviewStatus('Sorry, something went wrong. Please try again or email ' + REVIEW_EMAIL + '.', true);
          })
          .then(function () {
            if (submitBtn) submitBtn.disabled = false;
          });
      });
    }

    // ---------- Contact form ----------
    var contactForm = document.getElementById('contact-form');
    var contactSuccess = document.getElementById('contact-success');
    var contactError = document.getElementById('contact-error');

    if (contactForm) {
      contactForm.addEventListener('submit', function (e) {
        e.preventDefault();

        var honey = contactForm.querySelector('input[name="_honey"]');
        if (honey && honey.value) return; // bot: do nothing

        var btn = contactForm.querySelector('button[type="submit"]');
        var originalText = btn ? btn.textContent : '';

        if (btn) {
          btn.disabled = true;
          btn.textContent = 'Sending...';
        }
        if (contactSuccess) contactSuccess.classList.remove('is-visible');
        if (contactError) contactError.classList.remove('is-visible');

        fetch(FORM_ENDPOINT, {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: new FormData(contactForm)
        })
          .then(function (res) { return res.json(); })
          .then(function (data) {
            if (data.success === 'true' || data.success === true) {
              if (contactSuccess) contactSuccess.classList.add('is-visible');
              contactForm.reset();
            } else {
              throw new Error(data.message || 'Send failed');
            }
          })
          .catch(function (err) {
            console.error('Contact form error:', err);
            if (contactError) contactError.classList.add('is-visible');
          })
          .then(function () {
            if (btn) {
              btn.disabled = false;
              btn.textContent = originalText;
            }
          });
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
