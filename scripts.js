// Configuración de tu proyecto Firebase
const firebaseConfig = {
    apiKey: "AIzaSyA6Kg7f_kB-lYKKZ6JAlKn6AaOs4VDXEZE",
    authDomain: "carteleratt.firebaseapp.com",
    projectId: "carteleratt",
    storageBucket: "carteleratt.firebasestorage.app",
    messagingSenderId: "761188410322",
    appId: "1:761188410322:web:651747547fefb78812de0b",
    measurementId: "G-JCPXHX5DYD"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

document.addEventListener("DOMContentLoaded", () => {
    const video1 = document.querySelector(".carousel-video1");
    const video2 = document.querySelector(".carousel-video2");
    const carouselContent = document.getElementById("carousel-content");
    let initialLoad = true;

    // --- SISTEMA ANTIFALLOS PARA TV VIEJA ---
    // Recarga la página completa todos los días a las 3:00 AM para liberar la memoria RAM
    function programarReinicioDiario() {
        const ahora = new Date();
        const reinicio = new Date();
        reinicio.setHours(3, 0, 0, 0); // 3:00 AM
        
        // Si ya pasaron las 3 AM hoy, programar para mañana
        if (ahora.getTime() > reinicio.getTime()) {
            reinicio.setDate(reinicio.getDate() + 1);
        }
        
        const tiempoFaltante = reinicio.getTime() - ahora.getTime();
        setTimeout(() => {
            window.location.reload(true);
        }, tiempoFaltante);
    }
    programarReinicioDiario();
    // ----------------------------------------

    // Escuchar cambios en la base de datos en tiempo real
    database.ref('tv_data').on('value', (snapshot) => {
        const data = snapshot.val();
        
        if (!initialLoad) {
            console.log("Nuevas ofertas detectadas. Recargando TV...");
            window.location.reload();
            return;
        }

        initialLoad = false;
        let imagenes = [];
        if (data && data.images) {
            imagenes = data.images;
        } else {
            imagenes = ["img/1.jpg"]; // Imagen de respaldo
        }

        // Crear elementos de imagen
        imagenes.forEach((src, index) => {
            if (src) {
                const imgEl = document.createElement("img");
                imgEl.src = src;
                imgEl.alt = "Oferta " + (index + 1);
                imgEl.className = "carousel-image";
                carouselContent.appendChild(imgEl);
            }
        });

        // Iniciar el carrusel
        iniciarLogicaCarrusel();
    });

    function iniciarLogicaCarrusel() {
        const images = document.querySelectorAll(".carousel-image");
        let currentImageIndex = 0;
        let imageInterval = null;

        function mostrarImagen(index) {
            images.forEach((img, i) => {
                img.classList.toggle("active", i === index);
            });
        }

        function mostrarImagenes(callback) {
            if (images.length === 0) {
                callback();
                return;
            }

            mostrarImagen(currentImageIndex);

            imageInterval = setInterval(() => {
                currentImageIndex = (currentImageIndex + 1) % images.length;
                mostrarImagen(currentImageIndex);

                if (currentImageIndex === images.length - 1) {
                    clearInterval(imageInterval);
                    setTimeout(callback, 15000); // Mismo tiempo que tenías originalmente
                }
            }, 10000);
        }

        function reproducirVideo(videoElement, duracion, callback) {
            if (!videoElement) {
                callback();
                return;
            }

            // Ocultar todo lo demás
            images.forEach(img => img.classList.remove("active"));
            if(video1) video1.classList.remove("active");
            if(video2) video2.classList.remove("active");

            // Mostrar el video actual
            videoElement.classList.add("active");
            
            // TRUCO TV VIEJA: Darle 200 milisegundos a la TV para que procese el cambio visual antes de exigirle reproducir
            setTimeout(() => {
                videoElement.currentTime = 0;
                let playPromise = videoElement.play();
                
                // Evitar errores si el navegador es tan viejo que no soporta Promesas
                if (playPromise !== undefined && typeof playPromise.catch === 'function') {
                    playPromise.catch(error => console.log("Auto-play bloqueado o error en TV vieja:", error));
                }
            }, 200);

            setTimeout(() => {
                videoElement.pause();
                videoElement.classList.remove("active");
                callback();
            }, duracion);
        }

        function iniciarCarrusel() {
            mostrarImagenes(() => {
                reproducirVideo(video1, 150000, () => {
                    reproducirVideo(video2, 67000, () => {
                        currentImageIndex = 0;
                        iniciarCarrusel();
                    });
                });
            });
        }

        iniciarCarrusel();
    }
});