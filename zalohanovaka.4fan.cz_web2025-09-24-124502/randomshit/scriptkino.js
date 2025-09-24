let selectedSeats = new Set();
const ADMIN_PASSWORD = "PES";
let isCovidMode = false;
let reservedSeats = new Set();

const characterImages = [
    'JA-removebg-preview.png',
    'VOJTA-removebg-preview.png',
    'MATY-removebg-preview.png',
    'vojtisek-removebg-preview.png',
    'borec-removebg-preview.png'
];

function getRandomCharacterImage() {
    const randomIndex = Math.floor(Math.random() * characterImages.length);
    return characterImages[randomIndex];
}

function createSeatingGrid(rows, seats, isCovid = false) {
    const grid = document.getElementById('seating-grid');
    grid.innerHTML = '';
    grid.style.gridTemplateColumns = `repeat(${seats}, 1fr)`;

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < seats; j++) {
            const seat = document.createElement('div');
            seat.className = 'seat';
            const seatId = `seat-${i}-${j}`;
            seat.id = seatId;

            if (reservedSeats.has(seatId)) {
                seat.classList.add('reserved');
                const characterImg = document.createElement('img');
                characterImg.src = seat.dataset.characterImage || getRandomCharacterImage();
                characterImg.alt = 'Character';
                characterImg.className = 'character-image';
                seat.dataset.characterImage = characterImg.src;
                seat.appendChild(characterImg);
            } else if (isCovid && shouldDisableForCovid(i, j)) {
                seat.classList.add('disabled');
            } else {
                seat.addEventListener('click', () => toggleSeat(seatId));
            }

            if (selectedSeats.has(seatId)) {
                if (isCovid && shouldDisableForCovid(i, j)) {
                    selectedSeats.delete(seatId);
                } else {
                    seat.classList.add('selected');
                    const characterImg = document.createElement('img');
                    characterImg.src = seat.dataset.characterImage || getRandomCharacterImage();
                    characterImg.alt = 'Character';
                    characterImg.className = 'character-image';
                    seat.dataset.characterImage = characterImg.src;
                    seat.appendChild(characterImg);
                }
            }

            grid.appendChild(seat);
        }
    }
    updateReserveButton();
}

function shouldDisableForCovid(row, col) {
    return (row + col) % 2 === 1;
}

function toggleSeat(seatId) {
    const seat = document.getElementById(seatId);
    if (seat.classList.contains('disabled') || seat.classList.contains('reserved')) return;

    if (selectedSeats.has(seatId)) {
        selectedSeats.delete(seatId);
        seat.classList.remove('selected');
        seat.innerHTML = '';
        delete seat.dataset.characterImage;
    } else {
        if (isCovidMode && hasAdjacentSelectedSeats(seatId)) {
            alert('V COVID módu není možné vybrat sousední sedadla!');
            return;
        }
        selectedSeats.add(seatId);
        seat.classList.add('selected');
        
        const characterImg = document.createElement('img');
        characterImg.src = getRandomCharacterImage();
        characterImg.alt = 'Character';
        characterImg.className = 'character-image';
        seat.dataset.characterImage = characterImg.src;
        seat.appendChild(characterImg);
    }
    updateReserveButton();
}

function updateReserveButton() {
    const reserveButton = document.getElementById('reserveButton');
    reserveButton.disabled = selectedSeats.size === 0;
}

function reserveSelectedSeats() {
    if (selectedSeats.size === 0) return;

    selectedSeats.forEach(seatId => {
        const seat = document.getElementById(seatId);
        seat.classList.remove('selected');
        seat.classList.add('reserved');
        reservedSeats.add(seatId);
        
        seat.replaceWith(seat.cloneNode(true));
    });

    selectedSeats.clear();
    updateReserveButton();
    
    alert('Sedadla byla úspěšně zarezervována!');
}

function hasAdjacentSelectedSeats(seatId) {
    const [row, col] = seatId.replace('seat-', '').split('-').map(Number);
    const adjacentPositions = [
        `seat-${row}-${col-1}`,
        `seat-${row}-${col+1}`,
        `seat-${row-1}-${col}`,
        `seat-${row+1}-${col}`
    ];

    return adjacentPositions.some(pos => selectedSeats.has(pos));
}

function updateSeating() {
    const rows = parseInt(document.getElementById('rows').value);
    const seats = parseInt(document.getElementById('seats').value);
    createSeatingGrid(rows, seats, isCovidMode);
}

function showCovidModal() {
    const modal = document.getElementById('covidModal');
    modal.classList.add('show');
    document.getElementById('adminPassword').value = '';
    document.getElementById('adminPassword').focus();
}

function closeCovidModal() {
    const modal = document.getElementById('covidModal');
    modal.classList.remove('show');
}

function validateAndApplyCovid() {
    const password = document.getElementById('adminPassword').value;
    if (password === ADMIN_PASSWORD) {
        isCovidMode = !isCovidMode;
        updateSeating();
        closeCovidModal();
        alert(isCovidMode ? 'COVID mód byl aktivován' : 'COVID mód byl deaktivován');
    } else {
        alert('Nesprávné heslo!');
    }
}

window.onclick = function(event) {
    const modal = document.getElementById('covidModal');
    if (event.target === modal) {
        closeCovidModal();
    }
}

window.onload = () => {
    updateSeating();
};