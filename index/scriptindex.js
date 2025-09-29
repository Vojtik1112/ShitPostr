// Three.js inicializace
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(window.devicePixelRatio || 1);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding;
document.getElementById('three-container').appendChild(renderer.domElement);
renderer.domElement.style.cursor = 'pointer';

// Objects setup
const knot = new THREE.Mesh(
    new THREE.TorusKnotGeometry(1, 0.3, 128, 32),
    new THREE.MeshBasicMaterial({ color: 0x800080, wireframe: true })
);
knot.position.z = -2;
scene.add(knot);

// Vytvoření částic
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 10000;
const posArray = new Float32Array(particlesCount * 1);

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

// Světla pro model
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x222244, 1.0);
scene.add(hemiLight);
const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
dirLight.position.set(3, 5, 2);
scene.add(dirLight);

// Načtení astronauta (GLB)
let astronaut = null;
const loader = new THREE.GLTFLoader();
const clickableObjects = [];
loader.load(
    'https://modelviewer.dev/shared-assets/models/Astronaut.glb',
    (gltf) => {
        astronaut = gltf.scene;
        astronaut.scale.set(1, 1, 1);
        astronaut.position.set(-4, -1.2, -2);
        scene.add(astronaut);
        clickableObjects.push(astronaut);

        // Textový štítek "O mně" nad astronautem
        const labelCanvas = document.createElement('canvas');
        const labelCtx = labelCanvas.getContext('2d');
        const pr = Math.min(window.devicePixelRatio || 1, 2);
        const cw = 256 * pr;
        const ch = 128 * pr;
        labelCanvas.width = cw;
        labelCanvas.height = ch;
        labelCtx.clearRect(0, 0, cw, ch);
        labelCtx.font = `${Math.round(56 * pr)}px 'Courier New', monospace`;
        labelCtx.textAlign = 'center';
        labelCtx.textBaseline = 'middle';
        labelCtx.fillStyle = 'white';
        labelCtx.shadowColor = 'rgba(0,0,0,0.6)';
        labelCtx.shadowBlur = 8 * pr;
        labelCtx.shadowOffsetX = 0;
        labelCtx.shadowOffsetY = 2 * pr;
        labelCtx.fillText('Kontakt', cw / 2, ch / 2);

        const labelTexture = new THREE.CanvasTexture(labelCanvas);
        labelTexture.needsUpdate = true;
        const labelMaterial = new THREE.SpriteMaterial({ map: labelTexture, transparent: true });
        const labelSprite = new THREE.Sprite(labelMaterial);
        labelSprite.scale.set(0.9, 0.45, 1);

        const bbox = new THREE.Box3().setFromObject(astronaut);
        const size = new THREE.Vector3();
        bbox.getSize(size);
        const yOffset = size.y > 0 ? size.y * 1.1 : 1.6;
        labelSprite.position.set(0, yOffset, 0);
        astronaut.add(labelSprite);
    },
    undefined,
    (error) => {
        console.error('Chyba při načítání modelu Astronaut:', error);
    }
);

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
    if (astronaut) {
        astronaut.rotation.y += 0.003;
    }
    renderer.render(scene, camera);
}

animate();

// Raycaster pro kliknutí na astronauta
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onCanvasClick(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    const x = ( (event.clientX - rect.left) / rect.width ) * 2 - 1;
    const y = - ( (event.clientY - rect.top) / rect.height ) * 2 + 1;
    mouse.set(x, y);
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(clickableObjects, true);
    if (intersects.length > 0) {
        toggleContent(true);
    }
}

renderer.domElement.addEventListener('click', onCanvasClick);

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
    const clickedInsideNav = e.target.closest('nav');
    if (!clickedInsideNav) {
        document.querySelectorAll('nav .list').forEach(list => {
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

document.addEventListener('contextmenu', function(event) {
    event.preventDefault();
  });
