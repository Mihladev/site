// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
  // Initialize all components
  initNavbar();
  initCursorFollower();
  initTeamCarousel();
  initSliders();
  initTabs();
  // initForms(); // Existing form handling; keep commented if not used here.
  initAnimations();
  initPartnerLogos();
  initNewsletter(); // NEW: Initialize the newsletter form submission
});

// Newsletter form functionality
function initNewsletter() {
  const newsletterForm = document.querySelector(".newsletter-form");
  if (!newsletterForm) return; // Exit if no newsletter form is found

  // Attach submit handler
  newsletterForm.addEventListener("submit", function (e) {
    e.preventDefault(); // Prevent the default form submission behavior

    // Disable the submit button and change its text to indicate sending
    const submitButton = newsletterForm.querySelector("button[type='submit']");
    submitButton.disabled = true;
    const originalBtnText = submitButton.textContent;
    submitButton.textContent = "Sending...";

    // Gather form data using the FormData object
    const formData = new FormData(newsletterForm);

    // Send the form data to the PHP script (subscribe.php) via Fetch API
    fetch("subscribe.php", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.text())
      .then((text) => {
        // Display the response from your PHP script (e.g., success or error message)
        alert(text);
        newsletterForm.reset();
        submitButton.disabled = false;
        submitButton.textContent = originalBtnText;
      })
      .catch((error) => {
        console.error("Newsletter submission error:", error);
        alert("An error occurred. Please try again.");
        submitButton.disabled = false;
        submitButton.textContent = originalBtnText;
      });
  });
}

// Team Carousel functionality
function initTeamCarousel() {
  const teamSection = document.querySelector(".team");
  if (!teamSection) return;

  // Get all team members
  const teamMembers = document.querySelectorAll(".team-member");
  if (teamMembers.length <= 1) return;

  // Create carousel container
  const teamGrid = document.querySelector(".team-grid");
  if (!teamGrid) return;

  const carouselContainer = document.createElement("div");
  carouselContainer.className = "team-carousel";

  // Create slides container
  const slidesContainer = document.createElement("div");
  slidesContainer.className = "team-slides";

  // Clone team members for infinite loop effect
  const originalMembers = Array.from(teamMembers);

  // Move team members to slides container
  teamMembers.forEach((member) => {
    teamGrid.removeChild(member);
    slidesContainer.appendChild(member);
  });

  // Clone a few items from the beginning and append to the end
  for (let i = 0; i < Math.min(3, originalMembers.length); i++) {
    const clone = originalMembers[i].cloneNode(true);
    slidesContainer.appendChild(clone);
  }

  // Clone a few items from the end and prepend to the beginning
  for (
    let i = Math.max(0, originalMembers.length - 3);
    i < originalMembers.length;
    i++
  ) {
    const clone = originalMembers[i].cloneNode(true);
    slidesContainer.prepend(clone);
  }

  // Add slides to carousel
  carouselContainer.appendChild(slidesContainer);

  // Create navigation arrows
  const prevArrow = document.createElement("div");
  prevArrow.className = "carousel-arrow carousel-prev";
  prevArrow.innerHTML = "&#10094;";

  const nextArrow = document.createElement("div");
  nextArrow.className = "carousel-arrow carousel-next";
  nextArrow.innerHTML = "&#10095;";

  // Add arrows to carousel
  carouselContainer.appendChild(prevArrow);
  carouselContainer.appendChild(nextArrow);

  // Create dots navigation
  const dotsContainer = document.createElement("div");
  dotsContainer.className = "carousel-controls";

  // Calculate the number of slides based on viewport width
  const getVisibleItems = () => {
    if (window.innerWidth >= 992) {
      return 3; // Show 3 items on larger screens
    } else if (window.innerWidth >= 768) {
      return 2; // Show 2 items on medium screens
    } else {
      return 1; // Show 1 item on small screens
    }
  };

  let visibleItems = getVisibleItems();
  const totalSlides = originalMembers.length; // Based on original count
  const preCloneCount = Math.min(3, originalMembers.length);

  for (let i = 0; i < totalSlides; i++) {
    const dot = document.createElement("div");
    dot.className = "carousel-dot";
    if (i === 0) dot.classList.add("active");
    dot.setAttribute("data-index", i);
    dotsContainer.appendChild(dot);
  }

  // Replace the team grid with carousel and dots
  teamGrid.parentNode.replaceChild(carouselContainer, teamGrid);
  carouselContainer.after(dotsContainer);

  // Carousel state
  let currentSlide = 0;
  let isTransitioning = false;

  // Set initial position to show first real item (after clones)
  const slideWidth =
    slidesContainer.querySelector(".team-member").offsetWidth + 20; // Add gap
  slidesContainer.style.transform = `translateX(${
    -preCloneCount * slideWidth
  }px)`;

  // Function to update the carousel based on current state
  const updateCarousel = (isInstant = false) => {
    if (isTransitioning && !isInstant) return;

    isTransitioning = true;
    visibleItems = getVisibleItems();

    // Calculate position (accounting for pre-cloned items)
    const offset = -((preCloneCount + currentSlide) * slideWidth);

    // Apply transition only when not instant
    slidesContainer.style.transition = isInstant
      ? "none"
      : "transform 0.5s ease-in-out";
    slidesContainer.style.transform = `translateX(${offset}px)`;

    // Update active dot
    document.querySelectorAll(".carousel-dot").forEach((dot, index) => {
      // Normalize for infinite scrolling
      const normalizedSlide = (currentSlide + totalSlides) % totalSlides;
      if (index === normalizedSlide) {
        dot.classList.add("active");
      } else {
        dot.classList.remove("active");
      }
    });

    if (!isInstant) {
      setTimeout(() => {
        isTransitioning = false;
        // Handle loop conditions
        if (currentSlide < 0) {
          currentSlide = totalSlides - 1;
          slidesContainer.style.transition = "none";
          const newOffset = -((preCloneCount + currentSlide) * slideWidth);
          slidesContainer.style.transform = `translateX(${newOffset}px)`;
        } else if (currentSlide >= totalSlides) {
          currentSlide = 0;
          slidesContainer.style.transition = "none";
          const newOffset = -((preCloneCount + currentSlide) * slideWidth);
          slidesContainer.style.transform = `translateX(${newOffset}px)`;
        }
        slidesContainer.offsetHeight;
      }, 500);
    }
  };

  // Add event listeners for arrows and dots
  prevArrow.addEventListener("click", () => {
    if (isTransitioning) return;
    currentSlide--;
    updateCarousel();
  });

  nextArrow.addEventListener("click", () => {
    if (isTransitioning) return;
    currentSlide++;
    updateCarousel();
  });

  slidesContainer.addEventListener("transitionend", function () {
    isTransitioning = false;
  });

  const dots = document.querySelectorAll(".carousel-dot");
  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      if (isTransitioning) return;
      const dotIndex = parseInt(dot.getAttribute("data-index"));
      currentSlide = dotIndex;
      updateCarousel();
    });
  });

  window.addEventListener("resize", () => {
    const oldVisibleItems = visibleItems;
    visibleItems = getVisibleItems();
    if (oldVisibleItems !== visibleItems) {
      updateCarousel(true);
    }
  });

  const autoSlideInterval = setInterval(() => {
    if (!document.hidden) {
      currentSlide++;
      updateCarousel();
    }
  }, 5000);

  carouselContainer.addEventListener("mouseenter", () => {
    clearInterval(autoSlideInterval);
  });

  // Initialize the carousel
  updateCarousel(true);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && !isTransitioning) {
      updateCarousel(true);
    }
  });
}

// Header & Navbar functionality
function initNavbar() {
  const header = document.querySelector(".header");
  const menuToggle = document.querySelector(".menu-toggle");
  const navbar = document.querySelector(".navbar");

  window.addEventListener("scroll", function () {
    if (window.scrollY > 50) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  });

  if (menuToggle) {
    menuToggle.addEventListener("click", function () {
      this.classList.toggle("active");
      navbar.classList.toggle("active");
    });
  }

  const navLinks = document.querySelectorAll(".navbar a");
  navLinks.forEach((link) => {
    link.addEventListener("click", function () {
      menuToggle.classList.remove("active");
      navbar.classList.remove("active");
    });
  });
}

// Custom cursor follower
function initCursorFollower() {
  const cursor = document.querySelector(".cursor-follower");
  if (!cursor) return;

  document.addEventListener("mousemove", function (e) {
    cursor.style.left = e.clientX + "px";
    cursor.style.top = e.clientY + "px";
  });

  const interactiveElements = document.querySelectorAll(
    "a, button, .service-card, .gallery-item"
  );
  interactiveElements.forEach((el) => {
    el.addEventListener("mouseenter", function () {
      cursor.style.transform = "translate(-50%, -50%) scale(1.5)";
      cursor.style.opacity = "0.5";
    });

    el.addEventListener("mouseleave", function () {
      cursor.style.transform = "translate(-50%, -50%) scale(1)";
      cursor.style.opacity = "1";
    });
  });
}

// Sliders functionality
function initSliders() {
  // Project slider
  initSlider(".project-slider", ".project");
  // Testimonial slider
  initSlider(".testimonial-slider", ".testimonial");
}

function initSlider(sliderSelector, slideSelector) {
  const slider = document.querySelector(sliderSelector);
  if (!slider) return;

  const slides = slider.querySelectorAll(slideSelector);
  if (slides.length <= 1) return;

  let currentSlide = 0;
  for (let i = 1; i < slides.length; i++) {
    slides[i].style.display = "none";
  }

  const prevBtn = slider.parentElement.querySelector(".prev");
  const nextBtn = slider.parentElement.querySelector(".next");

  if (prevBtn) {
    prevBtn.addEventListener("click", function () {
      slides[currentSlide].style.display = "none";
      currentSlide = currentSlide === 0 ? slides.length - 1 : currentSlide - 1;
      slides[currentSlide].style.display = "block";
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", function () {
      slides[currentSlide].style.display = "none";
      currentSlide = currentSlide === slides.length - 1 ? 0 : currentSlide + 1;
      slides[currentSlide].style.display = "block";
    });
  }

  setInterval(function () {
    if (nextBtn) {
      nextBtn.click();
    }
  }, 5000);
}

// Tabs functionality
function initTabs() {
  const tabBtns = document.querySelectorAll(".tab-btn");
  if (!tabBtns.length) return;

  tabBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      tabBtns.forEach((b) => b.classList.remove("active"));
      this.classList.add("active");
      const tabPanels = document.querySelectorAll(".tab-panel");
      tabPanels.forEach((panel) => panel.classList.remove("active"));
      const tabId = this.getAttribute("data-tab");
      document.getElementById(tabId).classList.add("active");
    });
  });
}

// Animations functionality
function initAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -100px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animate");
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  const animateElements = document.querySelectorAll(
    ".service-card, .feature, .project, .testimonial, .team-member, .achievement"
  );
  animateElements.forEach((element) => {
    element.classList.add("pre-animate");
    observer.observe(element);
  });
}

// Add CSS classes for scroll animations
document.head.insertAdjacentHTML(
  "beforeend",
  `<style>
    .pre-animate {
      opacity: 0;
      transform: translateY(30px);
      transition: opacity 0.5s ease, transform 0.5s ease;
    }
    .animate {
      opacity: 1;
      transform: translateY(0);
    }
  </style>`
);

// Contact forms handling (example provided for multiple forms)
document.addEventListener("DOMContentLoaded", function () {
  const forms = [
    { id: "contactForm", statusId: "formStatus" },
    { id: "ictContactForm", statusId: "formStatus" },
    { id: "tlbContactForm", statusId: "formStatus" },
    { id: "aboutContactForm", statusId: "formStatus" },
  ];

  forms.forEach(({ id, statusId }) => {
    const form = document.getElementById(id);
    const status = form ? form.querySelector(`#${statusId}`) : null;

    if (form && status) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();

        status.textContent = "Sending...";
        status.className = "form-status sending";
        status.style.display = "block";

        const formData = new FormData(form);
        fetch("contact.php", {
          method: "POST",
          body: formData,
        })
          .then((response) => response.text())
          .then((text) => {
            try {
              const data = JSON.parse(text);
              if (data.status === "success") {
                status.textContent = data.message;
                status.className = "form-status success";
                form.reset();
              } else {
                status.textContent = data.message || "An error occurred.";
                status.className = "form-status error";
              }
            } catch (err) {
              console.error("Invalid JSON:", text);
              status.textContent = "Unexpected response from server.";
              status.className = "form-status error";
            }
          })
          .catch((error) => {
            console.error("Fetch error:", error);
            status.textContent = "Network error. Please try again.";
            status.className = "form-status error";
          });
      });
    }
  });
});
