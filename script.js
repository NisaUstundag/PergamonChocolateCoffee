document.addEventListener('DOMContentLoaded', () => {
    // Hero Section Görsel Değişimi
    const heroImages = document.querySelectorAll('.hero-image');
    let currentImageIndex = 0;

    function changeHeroImage() {
        heroImages.forEach(img => img.classList.remove('active'));
        currentImageIndex = (currentImageIndex + 1) % heroImages.length;
        heroImages[currentImageIndex].classList.add('active');
    }

    if (heroImages.length > 0) {
        heroImages[currentImageIndex].classList.add('active');
        setInterval(changeHeroImage, 5000);
    }

    // Bölümler Görünür Olunca Fade-in Animasyonu (Intersection Observer)
    const fadinSections = document.querySelectorAll('.info-sections, .sweet-gallery-section, .contact-map-section');

    const observerOptions = {
        root: null, // viewport'u kök olarak kullan
        rootMargin: '0px',
        threshold: 0.1 // %10'u görünür olduğunda tetikle
    };

    const sectionObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target); // Animasyon bir kez oynasın diye gözlemeyi durdur
            }
        });
    }, observerOptions);

    fadinSections.forEach(section => {
        section.classList.add('fade-in-section'); // Başlangıçta gizli ve animasyona hazır hale getir
        sectionObserver.observe(section);
    });

    // Hero content başlık ve paragraf animasyonu (Sayfa yüklendiğinde hemen başlar)
    const heroContent = document.querySelector('.hero-content');
    setTimeout(() => {
        heroContent.classList.add('hero-content-animate');
    }, 100); // 100ms gecikme


    // Sayfa Kaydırıldığında Navigasyon Barı Efekti
    const mainHeader = document.querySelector('.main-header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) { // 50px aşağı kaydırıldığında
            mainHeader.classList.add('scrolled');
        } else {
            mainHeader.classList.remove('scrolled');
        }
    });

    // Tatlı Galerisi Görselleri İçin Hover Animasyonları (CSS ile zaten var, JS ile tetiklemeye gerek yok)
    // Sadece .gallery-item ve .gallery-item img için CSS'te transform: scale() eklenmiş durumda.
    // Bu JS tarafında ek bir kod gerektirmez.

    // Butonlar İçin Mikro-Etkileşimler (CSS transition ile zaten var, JS ile tetiklemeye gerek yok)
    // .stores-button, .cta-button, .info-button, .load-more-button, .newsletter button stillerine
    // transform: translateY(-Xpx) ve background-color geçişleri eklenmiştir.
});

