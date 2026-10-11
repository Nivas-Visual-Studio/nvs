document.addEventListener('DOMContentLoaded', function () {

  // Mobile nav
  var navToggle = document.querySelector('.nav-toggle');
  var mainNav = document.querySelector('.main-nav');

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', function () {
      var isOpen = mainNav.classList.toggle('is-open');
      navToggle.classList.toggle('is-open', isOpen);
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    mainNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mainNav.classList.remove('is-open');
        navToggle.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Scroll reveal
  var revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window && revealEls.length) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  // Back to top
  var backToTop = document.querySelector('.back-to-top');
  if (backToTop) {
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Testimonials
  // Add approved reviews here. Leave empty to show none.
  var REVIEWS = [
    /*
    {
      name: 'Anany.',
      image: 'https://i.pravatar.cc/100?img=32',
      text: 'The logo they designed captured exactly the tone we wanted \u2014 clean, confident, and easy to apply everywhere.'
    },
    {
      name: 'Marcus T.',
      image: 'https://i.pravatar.cc/100?img=15',
      text: 'Our old artwork was a mess of low-res files. The redraw came back sharp, consistent, and ready for print.'
    },
    {
      name: 'Priya K.',
      image: 'https://i.pravatar.cc/100?img=47',
      text: 'They turned a rough product idea into visuals we could actually show to manufacturers. Big help.'
    }
    */
  ];

  var REVIEW_EMAIL = 'contact.nivasvisuals@gmail.com';
  var testimonialGrid = document.getElementById('testimonial-grid');

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function renderTestimonialCard(review) {
    var card = document.createElement('article');
    card.className = 'testimonial-card';
    var avatar = review.image
      ? '<img class="testimonial-avatar" src="' + escapeHtml(review.image) + '" alt="" loading="lazy">'
      : '';
    card.innerHTML =
      '<div class="testimonial-person">' +
        avatar +
        '<span class="testimonial-name">' + escapeHtml(review.name) + '</span>' +
      '</div>' +
      '<p class="testimonial-text">' + escapeHtml(review.text) + '</p>';
    return card;
  }

  if (testimonialGrid && Array.isArray(REVIEWS)) {
    REVIEWS.forEach(function (review) {
      testimonialGrid.appendChild(renderTestimonialCard(review));
    });
  }

  // Review modal
  var reviewBtn = document.getElementById('open-review-modal');
  var reviewModal = document.getElementById('review-modal');
  var reviewModalClose = document.getElementById('close-review-modal');
  var reviewForm = document.getElementById('review-form');
  var reviewStatus = document.getElementById('review-status');

  function openReviewModal() {
    if (reviewModal) reviewModal.classList.add('is-open');
  }
  function closeReviewModal() {
    if (reviewModal) reviewModal.classList.remove('is-open');
  }

  if (reviewBtn) reviewBtn.addEventListener('click', openReviewModal);
  if (reviewModalClose) reviewModalClose.addEventListener('click', closeReviewModal);
  if (reviewModal) {
    reviewModal.addEventListener('click', function (e) {
      if (e.target === reviewModal) closeReviewModal();
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

  // Review form
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
      showReviewStatus('Sending\u2026', false);

      fetch('https://formsubmit.co/ajax/' + REVIEW_EMAIL, {
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
          setTimeout(function () {
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

  // Contact form
  var contactForm = document.getElementById('contact-form');
  var contactSuccess = document.getElementById('contact-success');
  var contactError = document.getElementById('contact-error');

  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      var btn = contactForm.querySelector('button[type="submit"]');
      var originalText = btn ? btn.textContent : '';

      if (btn) {
        btn.disabled = true;
        btn.textContent = 'Sending...';
      }
      if (contactSuccess) contactSuccess.classList.remove('is-visible');
      if (contactError) contactError.classList.remove('is-visible');

      fetch('https://formsubmit.co/ajax/' + REVIEW_EMAIL, {
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

});