(function () {
    const selector = document.getElementById('level-selector');
    const startButton = document.getElementById('start-btn');
    const manifestUrl = 'levels/index.json';

    if (!selector || !startButton || typeof LEVELS_DATA === 'undefined' || !Array.isArray(LEVELS_DATA) || typeof currentLevelIndex === 'undefined' || typeof winGame !== 'function') {
        return;
    }

    function renderLevelSelector() {
        selector.innerHTML = '';
        LEVELS_DATA.forEach((levelData, index) => {
            const option = document.createElement('option');
            option.value = String(index);
            option.textContent = `Nivel ${levelData.level}: ${levelData.name}`;
            selector.appendChild(option);
        });
        selector.value = String(currentLevelIndex);
    }

    selector.addEventListener('change', () => {
        currentLevelIndex = Number(selector.value) || 0;
    });

    const originalWinGame = winGame;
    winGame = function () {
        originalWinGame();
        selector.value = String(currentLevelIndex);
    };

    startButton.disabled = true;
    startButton.innerText = 'CARGANDO...';

    fetch(manifestUrl)
        .then(response => {
            if (!response.ok) throw new Error(`No se pudo cargar ${manifestUrl}`);
            return response.json();
        })
        .then(manifest => Promise.all((manifest.levels || []).map(levelFile => (
            fetch(`levels/${levelFile.file}`).then(response => {
                if (!response.ok) throw new Error(`No se pudo cargar levels/${levelFile.file}`);
                return response.json();
            })
        ))))
        .then(loadedLevels => {
            loadedLevels.sort((a, b) => a.level - b.level);
            LEVELS_DATA.splice(0, LEVELS_DATA.length, ...loadedLevels);
            currentLevelIndex = 0;
            renderLevelSelector();
            startButton.disabled = false;
            startButton.innerText = 'INICIAR';
        })
        .catch(error => {
            console.error(error);
            renderLevelSelector();
            startButton.disabled = false;
            startButton.innerText = 'INICIAR';
        });
}());
