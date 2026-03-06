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

    // ===== PENTI OFFICIAL SIZING CHART =====
    // Göğüs Altı Ölçüsü (cm) → Band | Kup Ölçüsü (bust cm) → Cup
    const SIZE_CHART = {
        70: { range: [68, 72], cups: { A: [82, 84], B: [84, 86], C: [86, 88], D: [88, 90] } },
        75: { range: [73, 77], cups: { A: [87, 89], B: [89, 91], C: [91, 93], D: [93, 95], E: [95, 97] } },
        80: { range: [78, 82], cups: { A: [92, 94], B: [94, 96], C: [96, 98], D: [98, 100], E: [100, 102] } },
        85: { range: [83, 87], cups: { A: [97, 99], B: [99, 101], C: [101, 103], D: [103, 105], E: [105, 107] } },
        90: { range: [88, 92], cups: { B: [104, 106], C: [106, 108], D: [108, 110], E: [110, 112] } },
        95: { range: [93, 97], cups: { B: [109, 111], C: [111, 113], D: [113, 115], E: [115, 117] } },
    };

    const CUP_ORDER = ['A', 'B', 'C', 'D', 'E'];
    const BAND_ORDER = [70, 75, 80, 85, 90, 95];

    function findBandFromCm(underbustCm) {
        // Find the band whose range contains the measurement
        for (const band of BAND_ORDER) {
            const [lo, hi] = SIZE_CHART[band].range;
            if (underbustCm >= lo && underbustCm <= hi) return band;
        }
        // Fallback: snap to nearest band
        let closest = BAND_ORDER[0];
        let minDist = Infinity;
        for (const band of BAND_ORDER) {
            const mid = (SIZE_CHART[band].range[0] + SIZE_CHART[band].range[1]) / 2;
            const dist = Math.abs(underbustCm - mid);
            if (dist < minDist) { minDist = dist; closest = band; }
        }
        return closest;
    }

    function findCupFromChart(band, bustCm) {
        const cups = SIZE_CHART[band]?.cups;
        if (!cups) return 'B'; // fallback
        for (const [cup, [lo, hi]] of Object.entries(cups)) {
            if (bustCm >= lo && bustCm <= hi) return cup;
        }
        // Bust is between two ranges (e.g. exactly on a boundary) — find closest
        let bestCup = Object.keys(cups)[0];
        let minDist = Infinity;
        for (const [cup, [lo, hi]] of Object.entries(cups)) {
            const mid = (lo + hi) / 2;
            const dist = Math.abs(bustCm - mid);
            if (dist < minDist) { minDist = dist; bestCup = cup; }
        }
        return bestCup;
    }

    /**
     * Sister Sizing (lingerie industry standard):
     * Same cup VOLUME, different band tightness.
     * - Tighter sister: band DOWN 5, cup UP 1 letter  (e.g. 85B → 80C)
     * - Looser sister:  band UP 5,   cup DOWN 1 letter (e.g. 85B → 90A)
     */
    function getSisterSize(band, cup, direction) {
        const cupIdx = CUP_ORDER.indexOf(cup);
        if (cupIdx === -1) return null;

        if (direction === 'tighter') {
            const newBand = band - 5;
            const newCupIdx = cupIdx + 1;
            if (!BAND_ORDER.includes(newBand) || newCupIdx >= CUP_ORDER.length) return null;
            const newCup = CUP_ORDER[newCupIdx];
            // Verify this combination exists in the chart
            if (SIZE_CHART[newBand]?.cups[newCup]) return `${newBand}${newCup}`;
            return null;
        } else {
            const newBand = band + 5;
            const newCupIdx = cupIdx - 1;
            if (!BAND_ORDER.includes(newBand) || newCupIdx < 0) return null;
            const newCup = CUP_ORDER[newCupIdx];
            if (SIZE_CHART[newBand]?.cups[newCup]) return `${newBand}${newCup}`;
            return null;
        }
    }

    function showResult() {
        let baseBand = 75;
        let baseCup = 'B';

        // PATH A: CM measurements → exact chart lookup
        if (state.inputs.bandCm && state.inputs.bustCm) {
            baseBand = findBandFromCm(state.inputs.bandCm);
            baseCup = findCupFromChart(baseBand, state.inputs.bustCm);
        } else {
            // PATH B: Visual heuristic from weight + frame
            if (state.inputs.weight > 65) { baseBand = 80; baseCup = 'C'; }
            if (state.inputs.weight > 80) { baseBand = 85; baseCup = 'D'; }
            if (state.inputs.frame === 'broad') { baseBand += 5; }
            if (state.inputs.frame === 'narrow') { baseBand -= 5; }
            // Clamp band to valid values
            baseBand = BAND_ORDER.reduce((prev, curr) =>
                Math.abs(curr - baseBand) < Math.abs(prev - baseBand) ? curr : prev
            );
        }

        // Apply pain point modifier
        if (state.inputs.painPoint === 'digs_in') {
            const bandIdx = BAND_ORDER.indexOf(baseBand);
            if (bandIdx < BAND_ORDER.length - 1) baseBand = BAND_ORDER[bandIdx + 1];
        }
        if (state.inputs.painPoint === 'rides_up') {
            const bandIdx = BAND_ORDER.indexOf(baseBand);
            if (bandIdx > 0) baseBand = BAND_ORDER[bandIdx - 1];
        }

        // Apply breast shape modifier (fuller shapes → cup up)
        if (state.inputs.shape === 'bell' || state.inputs.shape === 'round') {
            const cupIdx = CUP_ORDER.indexOf(baseCup);
            if (cupIdx !== -1 && cupIdx < CUP_ORDER.length - 1) {
                baseCup = CUP_ORDER[cupIdx + 1];
            }
        }

        let finalSize = `${baseBand}${baseCup}`;

        // SISTER SIZE LOGIC:
        // Show the OPPOSITE direction as alternative based on fit preference.
        // If user chose "snug" → they want tight → show the LOOSER sister as fallback
        // If user chose "relaxed" → they want comfort → show the TIGHTER sister as fallback
        let sisterSize;
        let sisterLabel;
        if (state.inputs.fitPref === 'snug') {
            sisterSize = getSisterSize(baseBand, baseCup, 'looser');
            sisterLabel = 'Eğer çok sıkı hissederseniz';
        } else {
            sisterSize = getSisterSize(baseBand, baseCup, 'tighter');
            sisterLabel = 'Daha fazla destek isterseniz';
        }

        // Update DOM
        document.getElementById('final-size').textContent = finalSize;

        const sisterSizeEl = document.getElementById('sister-size');
        const sisterBox = document.querySelector('.sister-size-box');
        const sisterCopy = document.getElementById('sister-copy');

        if (sisterSize) {
            sisterSizeEl.textContent = sisterSize;
            sisterCopy.textContent = `${sisterLabel}, `;
            sisterBox.style.display = 'block';
        } else {
            sisterBox.style.display = 'none';
        }

        const justText = document.getElementById('justification-text');
        const prefText = state.inputs.fitPref === 'snug' ? 'sıkı ve destekleyici' : 'rahat ve esnek';
        const methodText = state.inputs.bandCm ? 'ölçümleriniz' : 'vücut yapınız';
        justText.textContent = `${methodText.charAt(0).toUpperCase() + methodText.slice(1)} ve ${prefText} bir his tercih etmeniz göz önüne alındığında, ${baseBand} bandı ve ${baseCup} cup hacmi size en uygun tutuşu sağlayacaktır.`;

        // Switch Screen
        const loadingElement = document.getElementById('step-loading');
        loadingElement.classList.remove('active');
        const resultElement = document.getElementById('step-result');
        resultElement.classList.add('active');
    }
});
