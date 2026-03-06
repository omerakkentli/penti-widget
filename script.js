document.addEventListener('DOMContentLoaded', () => {
    // STATE
    const state = {
        currentStep: 1,
        totalSteps: 5,
        targetStep: 5,
        inputs: {
            height: null,
            weight: null,
            age: null,
            frame: null,
            painPoint: null,
            shape: null,
            fitPref: 'relaxed' // Default
        }
    };

    // DOM ELEMENTS
    const nextBtn = document.getElementById('next-btn');
    const backBtn = document.getElementById('back-btn');
    const progressFill = document.getElementById('progress-fill');
    const steps = document.querySelectorAll('.step');

    // INPUT ELEMENTS
    const heightInput = document.getElementById('height');
    const weightInput = document.getElementById('weight');
    const ageBtns = document.querySelectorAll('.age-btn');
    const frameCards = document.querySelectorAll('.frame-card');
    const painBtns = document.querySelectorAll('.choice-btn');
    const shapeCards = document.querySelectorAll('.shape-card');
    const fitRadios = document.querySelectorAll('input[name="fitPref"]');

    // INIT
    updateProgress();
    validateStep1();

    // EVENT LISTENERS: VALIDATION & STATE UPDATES
    heightInput.addEventListener('input', (e) => { state.inputs.height = e.target.value; validateStep1(); });
    weightInput.addEventListener('input', (e) => { state.inputs.weight = e.target.value; validateStep1(); });

    ageBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            ageBtns.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            state.inputs.age = btn.dataset.value;
            validateStep1();
        });
    });

    frameCards.forEach(card => {
        card.addEventListener('click', () => {
            frameCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            state.inputs.frame = card.dataset.value;
            enableNext();
        });
    });

    painBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            painBtns.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            state.inputs.painPoint = btn.dataset.value;
            enableNext();
        });
    });

    shapeCards.forEach(card => {
        card.addEventListener('click', () => {
            shapeCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            state.inputs.shape = card.dataset.value;
            enableNext();
        });
    });

    fitRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            state.inputs.fitPref = e.target.value;
            enableNext();
        });
    });

    // PLACEHOLDER CLEAR ON FOCUS / RESTORE ON BLUR
    document.querySelectorAll('.number-input-wrapper input').forEach(input => {
        const originalPlaceholder = input.placeholder;
        input.addEventListener('focus', () => { input.placeholder = ''; });
        input.addEventListener('blur', () => {
            if (!input.value) input.placeholder = originalPlaceholder;
        });
    });

    // CM MEASUREMENT TOGGLE
    const cmToggleBtn = document.getElementById('cm-toggle-btn');
    const cmPanel = document.getElementById('cm-inputs-panel');
    const bandCmInput = document.getElementById('band-cm');
    const bustCmInput = document.getElementById('bust-cm');

    cmToggleBtn.addEventListener('click', () => {
        cmToggleBtn.classList.toggle('open');
        cmPanel.classList.toggle('open');
    });

    // When user enters CM values, override the visual frame selection
    function handleCmInput() {
        const band = parseFloat(bandCmInput.value);
        const bust = parseFloat(bustCmInput.value);

        if (band && bust) {
            // Store raw cm values in state
            state.inputs.bandCm = band;
            state.inputs.bustCm = bust;
            // Deselect visual frame cards (CM takes priority)
            frameCards.forEach(c => c.classList.remove('selected'));
            state.inputs.frame = null; // will be derived from CM in the algorithm
            enableNext();
        } else {
            state.inputs.bandCm = null;
            state.inputs.bustCm = null;
            // Re-validate: need either CM or visual selection
            if (!state.inputs.frame) disableNext();
        }
    }

    bandCmInput.addEventListener('input', handleCmInput);
    bustCmInput.addEventListener('input', handleCmInput);

    // If user selects a visual frame AFTER entering CM, clear CM inputs
    frameCards.forEach(card => {
        card.addEventListener('click', () => {
            // Clear CM inputs since user chose visual
            bandCmInput.value = '';
            bustCmInput.value = '';
            state.inputs.bandCm = null;
            state.inputs.bustCm = null;
        });
    });

    // NAVIGATION
    nextBtn.addEventListener('click', () => {
        if (nextBtn.classList.contains('disabled')) return;

        if (state.currentStep === state.totalSteps) {
            calculateResult();
        } else {
            goToStep(state.currentStep + 1);
        }
    });

    backBtn.addEventListener('click', () => {
        if (state.currentStep > 1) {
            goToStep(state.currentStep - 1);
        }
    });

    // FUNCTIONS
    function validateStep1() {
        if (state.inputs.height && state.inputs.weight && state.inputs.age) {
            enableNext();
        } else {
            disableNext();
        }
    }

    function enableNext() {
        nextBtn.classList.remove('disabled');
    }

    function disableNext() {
        nextBtn.classList.add('disabled');
    }

    function validateCurrentStep() {
        switch (state.currentStep) {
            case 1: validateStep1(); break;
            case 2: (state.inputs.frame || (state.inputs.bandCm && state.inputs.bustCm)) ? enableNext() : disableNext(); break;
            case 3: state.inputs.painPoint ? enableNext() : disableNext(); break;
            case 4: state.inputs.shape ? enableNext() : disableNext(); break;
            case 5: state.inputs.fitPref ? enableNext() : disableNext(); break;
        }
    }

    function goToStep(stepNum) {
        // Exit current
        const currentElement = document.getElementById(`step-${state.currentStep}`);
        currentElement.classList.remove('active');
        if (stepNum > state.currentStep) {
            currentElement.classList.add('exit-left');
        }

        // Enter new
        const nextElement = document.getElementById(`step-${stepNum}`);
        nextElement.classList.remove('exit-left');
        nextElement.classList.add('active');

        state.currentStep = stepNum;
        validateCurrentStep();
        updateProgress();

        // Layout updates
        if (state.currentStep === 1) {
            backBtn.classList.add('hidden');
        } else {
            backBtn.classList.remove('hidden');
        }

        if (state.currentStep === state.totalSteps) {
            nextBtn.textContent = "Sonucu Göster";
        } else {
            nextBtn.textContent = "Devam Et";
        }
    }

    function updateProgress() {
        const perf = (state.currentStep / state.totalSteps) * 100;
        progressFill.style.width = `${perf}%`;
    }

    // ALGORITHM MOCK
    function calculateResult() {
        // Hide next button and header
        document.querySelector('.widget-footer').style.display = 'none';
        document.querySelector('.widget-header').style.display = 'none';

        // Show Loading
        const currentElement = document.getElementById(`step-${state.currentStep}`);
        currentElement.classList.remove('active');
        const loadingElement = document.getElementById('step-loading');
        loadingElement.classList.add('active');

        // Simulate API / Calculation time
        setTimeout(() => {
            const loadingText = document.getElementById('loading-text');
            loadingText.textContent = "Hacim kalibrasyonu tamamlanıyor...";

            setTimeout(() => {
                showResult();
            }, 1200);
        }, 1200);
    }

    function showResult() {
        // Determine Size (Mock Logic)
        let baseBand = 75;
        let baseCup = 'B';
        let sisterSize = '80A';

        // PATH A: If user provided CM measurements directly, derive band & cup from those
        if (state.inputs.bandCm && state.inputs.bustCm) {
            const bandCm = state.inputs.bandCm;
            const bustCm = state.inputs.bustCm;
            const diff = bustCm - bandCm;

            // Round band to nearest 5
            baseBand = Math.round(bandCm / 5) * 5;

            // Cup from difference
            if (diff < 11) baseCup = 'A';
            else if (diff < 13) baseCup = 'AA';
            else if (diff < 15) baseCup = 'B';
            else if (diff < 17) baseCup = 'C';
            else if (diff < 19) baseCup = 'D';
            else if (diff < 21) baseCup = 'E';
            else baseCup = 'F';
        } else {
            // PATH B: Visual heuristic from weight + frame
            if (state.inputs.weight > 65) {
                baseBand = 80;
                baseCup = 'C';
                sisterSize = '85B';
            }
            if (state.inputs.weight > 80) {
                baseBand = 85;
                baseCup = 'D';
                sisterSize = '90C';
            }

            if (state.inputs.frame === 'broad') { baseBand += 5; }
            if (state.inputs.frame === 'narrow') { baseBand -= 5; }
        }

        if (state.inputs.painPoint === 'digs_in') { baseBand += 5; }
        if (state.inputs.shape === 'bell' || state.inputs.shape === 'round') {
            baseCup = baseCup.length === 1
                ? String.fromCharCode(baseCup.charCodeAt(0) + 1)
                : baseCup; // skip if already multi-char like AA
        }

        let finalSize = `${baseBand}${baseCup}`;

        if (state.inputs.fitPref === 'relaxed') {
            sisterSize = `${baseBand - 5}${String.fromCharCode(baseCup.charCodeAt(0) + 1)}`;
        } else {
            sisterSize = `${baseBand + 5}${String.fromCharCode(baseCup.charCodeAt(0) - 1)}`;
        }

        // Handle negative cup chars visually
        if (sisterSize.includes('@') || sisterSize.includes('?')) sisterSize = 'Alternatif Kalıp';

        // Update DOM
        document.getElementById('final-size').textContent = finalSize;
        document.getElementById('sister-size').textContent = sisterSize;

        const justText = document.getElementById('justification-text');
        const prefText = state.inputs.fitPref === 'snug' ? 'sıkı ve destekleyici' : 'rahat ve esnek';
        justText.textContent = `Ağırlık dengeniz ve ${prefText} bir his tercih etmeniz göz önüne alındığında, ${baseBand} bandı ve ${baseCup} cup hacmi size en uygun tutuşu sağlayacaktır.`;

        // Switch Screen
        const loadingElement = document.getElementById('step-loading');
        loadingElement.classList.remove('active');
        const resultElement = document.getElementById('step-result');
        resultElement.classList.add('active');
    }
});
