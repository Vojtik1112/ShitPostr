// Three.js inicializace
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('three-container').appendChild(renderer.domElement);

// Objects setup
const knot = new THREE.Mesh(
    new THREE.TorusKnotGeometry(1, 0.3, 128, 32),
    new THREE.MeshBasicMaterial({ color: 0x800080, wireframe: true })
);
knot.position.z = -2;
scene.add(knot);

// Vytvoření částic
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 5000;
const posArray = new Float32Array(particlesCount * 3);

for(let i = 0; i < particlesCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 5;
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

// Materiál pro částice
const particlesMaterial = new THREE.PointsMaterial({
    size: 0.005,
    color: 0xffffff
});

// Vytvoření částicového systému
const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particlesMesh);

// Pozice kamery
camera.position.z = 2;

// Resize handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animace
function animate() {
    requestAnimationFrame(animate);
    knot.rotation.x += 0.005;
    knot.rotation.y += 0.005;
    particlesMesh.rotation.x += 0.0005;
    particlesMesh.rotation.y += 0.0005;
    renderer.render(scene, camera);
}

animate();

// Navigace
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
        const list = item.querySelector('.list');
        if (list) {
            list.style.display = list.style.display === 'block' ? 'none' : 'block';
        }
    });
});

// Zavření listu při kliknutí mimo
document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-item')) {
        document.querySelectorAll('.list').forEach(list => {
            list.style.display = 'none';
        });
    }
});

// Toggle content
function toggleContent(show) {
    const overlay = document.querySelector('.overlay');
    const content = document.querySelector('.hidden-content');
    
    if (show) {
        overlay.classList.add('hidden');
        content.classList.add('visible');
    } else {
        overlay.classList.remove('hidden');
        content.classList.remove('visible');
    }
}

// Smooth scroll behavior
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Scroll animations
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            if (entry.target.classList.contains('timeline-item')) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateX(0)';
            }
        }
    });
}, observerOptions);

// Observe timeline items
document.querySelectorAll('.timeline-item').forEach(item => {
    item.style.opacity = '0';
    item.style.transform = 'translateX(-50px)';
    item.style.transition = 'all 0.5s ease';
    observer.observe(item);
}); 