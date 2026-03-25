document.addEventListener("DOMContentLoaded", () => {
    const video = document.querySelector(".carousel-video");
    const images = document.querySelectorAll(".carousel-image");
    let currentImageIndex = 0;
    let imageInterval = null;
    function PrimeraImagen(index) {
    images.forEach((img, i) => {
            img.classList.toggle("active", i === index);
        });
    }
    function ImagenesEnSecuencia(callback) {
        PrimeraImagen(currentImageIndex);

        imageInterval = setInterval(() => {
            currentImageIndex = (currentImageIndex + 1) % images.length;
            PrimeraImagen(currentImageIndex);

            if (currentImageIndex === images.length - 1) {
                clearInterval(imageInterval);
                setTimeout(callback, 15000);
            }
        }, 12000);
    }

    function ArrancarVideo(callback) {
        images.forEach(img => img.classList.remove("active"));
        video.classList.add("active");
        video.currentTime = 0;
        video.play();
        setTimeout(() => {
            video.pause();
            video.classList.remove("active");
            callback();
        }, 136000);
    }

    function IniciarCarrusel() {
        ImagenesEnSecuencia(() => {
            ArrancarVideo(() => {
                currentImageIndex = 0;
                IniciarCarrusel();
            });
        });
    }

    IniciarCarrusel();
});