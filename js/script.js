// PCB Stackup Generator Script

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const layerCountSelect = document.getElementById('layer-count');
    const boardThicknessInput = document.getElementById('board-thickness');
    const copperWeightSelect = document.getElementById('copper-weight');
    const viaTypeSelect = document.getElementById('via-type');
    const viaDrillDiameterInput = document.getElementById('via-drill-diameter');
    const viaPadDiameterInput = document.getElementById('via-pad-diameter');
    const viaStartLayerSelect = document.getElementById('via-start-layer');
    const viaEndLayerSelect = document.getElementById('via-end-layer');
    const staggeredViasControl = document.getElementById('staggered-vias-control');
    const staggeredViasCount = document.getElementById('staggered-vias-count');
    const generateBtn = document.getElementById('generate-btn');
    const loadSampleBtn = document.getElementById('load-sample-btn');
    const helpBtn = document.getElementById('help-btn');
    const stackupPreview = document.getElementById('stackup-preview');
    const stackupDetails = document.getElementById('stackup-details');
    const instructionsModal = document.getElementById('instructions-modal');
    const modalClose = document.querySelector('.modal-close');
    const modalContent = document.querySelector('.modal-content');
    const unitSelect = document.getElementById('unit-select');
    const unitLabels = document.querySelectorAll('.unit-label');
    
    // Unit conversion constants
    const UNIT_CONVERSION = {
        // Conversion factors to mm (base unit)
        toMm: {
            mm: 1,
            um: 0.001,
            mils: 0.0254
        },
        // Conversion factors from mm to other units
        fromMm: {
            mm: 1,
            um: 1000,
            mils: 39.37007874
        },
        // Default step values for different units
        step: {
            mm: 0.1,
            um: 100,
            mils: 5
        },
        // Precision for display (decimal places)
        precision: {
            mm: 3,
            um: 0,
            mils: 2
        },
        // Input field configuration by unit
        inputs: {
            'board-thickness': {
                mm: { min: 0.5, max: 3.2, step: 0.1, default: 1.6 },
                um: { min: 500, max: 3200, step: 100, default: 1600 },
                mils: { min: 20, max: 125, step: 5, default: 63 }
            },
            'via-drill-diameter': {
                mm: { min: 0.1, max: 1.0, step: 0.05, default: 0.3 },
                um: { min: 100, max: 1000, step: 50, default: 300 },
                mils: { min: 4, max: 40, step: 2, default: 12 }
            },
            'via-pad-diameter': {
                mm: { min: 0.2, max: 2.0, step: 0.05, default: 0.6 },
                um: { min: 200, max: 2000, step: 50, default: 600 },
                mils: { min: 8, max: 80, step: 2, default: 24 }
            }
        }
    };
    
    // Current unit
    let currentUnit = 'mm';

    // Material properties (mm)
    const materialProperties = {
        // Copper thickness in mm per oz
        copperThickness: {
            '0.5': 0.017,
            '1': 0.035,
            '2': 0.07,
            '3': 0.105
        },
        // Typical prepreg thickness
        prepregThickness: 0.1,
        // Typical core thickness for different layer counts
        coreThickness: {
            '2': 1.5, // Most of the board is core for 2 layer
            '4': 0.8,
            '6': 0.4,
            '8': 0.2,
            '10': 0.2,
            '12': 0.2
        },
        solderMaskThickness: 0.015,
        silkscreenThickness: 0.01
    };
    
    // Generate stackup when button is clicked
    generateBtn.addEventListener('click', generateStackup);
    
    // Load sample data when sample button is clicked
    loadSampleBtn.addEventListener('click', loadSampleData);
    
    // Show instructions modal when help button is clicked
    helpBtn.addEventListener('click', showInstructions);
    
    // Close modal when close button is clicked
    modalClose.addEventListener('click', hideInstructions);
    
    // Close modal when clicking outside the modal
    instructionsModal.addEventListener('click', function(e) {
        if (e.target === instructionsModal) {
            hideInstructions();
        }
    });
    
    // Handle layer count changes to update via options
    layerCountSelect.addEventListener('change', updateViaLayerOptions);
    
    // Handle via type changes to show/hide appropriate controls
    viaTypeSelect.addEventListener('change', updateViaControls);
    
    // Handle unit selection changes
    unitSelect.addEventListener('change', function() {
        const newUnit = this.value;
        updateUnits(currentUnit, newUnit);
        currentUnit = newUnit;
    });
    
    // Initial setup
    updateViaLayerOptions();
    updateViaControls();
    updateUnitLabels();
    generateStackup();
    
    // Function to convert a value from one unit to another
    function convertValue(value, fromUnit, toUnit) {
        // First convert to mm (base unit)
        const valueInMm = value * UNIT_CONVERSION.toMm[fromUnit];
        // Then convert from mm to target unit
        return valueInMm * UNIT_CONVERSION.fromMm[toUnit];
    }
    
    // Function to format a value according to the unit's precision
    function formatValueForUnit(value, unit) {
        const precision = UNIT_CONVERSION.precision[unit];
        return Number(value.toFixed(precision));
    }
    
    // Function to update input field attributes and values based on unit change
    function updateInputField(input, fromUnit, toUnit) {
        const inputId = input.id;
        const currentValue = parseFloat(input.value);
        
        // Skip if this input doesn't have unit-specific configuration
        if (!UNIT_CONVERSION.inputs[inputId]) return;
        
        // Convert current value to new unit
        const newValue = convertValue(currentValue, fromUnit, toUnit);
        
        // Update input attributes
        const config = UNIT_CONVERSION.inputs[inputId][toUnit];
        input.min = config.min;
        input.max = config.max;
        input.step = config.step;
        
        // Format and set the new value
        input.value = formatValueForUnit(newValue, toUnit);
        
        console.log(`[updateInputField] Updated ${inputId} from ${currentValue} ${fromUnit} to ${input.value} ${toUnit}`);
    }
    
    // Function to update all unit labels
    function updateUnitLabels() {
        unitLabels.forEach(label => {
            label.textContent = currentUnit;
        });
    }
    
    // Function to handle unit changes across the application
    function updateUnits(fromUnit, toUnit) {
        console.log(`[updateUnits] Changing units from ${fromUnit} to ${toUnit}`);
        
        // Update unit labels
        unitLabels.forEach(label => {
            label.textContent = toUnit;
        });
        
        // Update input fields that have unit-specific configurations
        updateInputField(boardThicknessInput, fromUnit, toUnit);
        updateInputField(viaDrillDiameterInput, fromUnit, toUnit);
        updateInputField(viaPadDiameterInput, fromUnit, toUnit);
        
        // Regenerate stackup with new units
        generateStackup();
        
        showNotification(`Units changed to ${toUnit}`);
    }
    
    // Function to load sample 4-layer data
    function loadSampleData() {
        // Set UI controls to match sample data
        layerCountSelect.value = "4";
        copperWeightSelect.value = sampleStackupData.copperWeight;
        
        // Convert sample data values to current unit
        const boardThickness = sampleStackupData.totalThickness; // Sample data is in mm
        const viaDrillDiameter = 0.3; // mm
        const viaPadDiameter = 0.6; // mm
        
        if (currentUnit === 'mm') {
            boardThicknessInput.value = boardThickness;
            viaDrillDiameterInput.value = viaDrillDiameter;
            viaPadDiameterInput.value = viaPadDiameter;
        } else {
            // Convert from mm to current unit
            boardThicknessInput.value = formatValueForUnit(
                convertValue(boardThickness, 'mm', currentUnit), 
                currentUnit
            );
            viaDrillDiameterInput.value = formatValueForUnit(
                convertValue(viaDrillDiameter, 'mm', currentUnit), 
                currentUnit
            );
            viaPadDiameterInput.value = formatValueForUnit(
                convertValue(viaPadDiameter, 'mm', currentUnit), 
                currentUnit
            );
        }
        
        // Set via options
        viaTypeSelect.value = "through";
        
        // Update via layer options
        updateViaLayerOptions();
        viaStartLayerSelect.value = "1";
        viaEndLayerSelect.value = "4";
        
        // Generate stackup
        generateStackup();
        
        // Show notification
        showNotification(`Loaded 4-layer sample data (${currentUnit})`);
    }
    
    // Function to show a temporary notification
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Fade in
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Remove after delay
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 500);
        }, 3000);
    }
    
    // Function to update via layer options based on selected layer count
    function updateViaLayerOptions() {
        const layerCount = parseInt(layerCountSelect.value);
        
        // Clear existing options
        viaStartLayerSelect.innerHTML = '';
        viaEndLayerSelect.innerHTML = '';
        
        // Add options for each copper layer
        for (let i = 1; i <= layerCount; i++) {
            let layerName = i === 1 ? `L${i} (Top)` : 
                          i === layerCount ? `L${i} (Bottom)` : `L${i}`;
            
            // Add to start layer options
            const startOption = document.createElement('option');
            startOption.value = i;
            startOption.textContent = layerName;
            viaStartLayerSelect.appendChild(startOption);
            
            // Add to end layer options
            const endOption = document.createElement('option');
            endOption.value = i;
            endOption.textContent = layerName;
            viaEndLayerSelect.appendChild(endOption);
        }
        
        // Set default values
        if (viaTypeSelect.value === 'through') {
            viaStartLayerSelect.value = '1';
            viaEndLayerSelect.value = layerCount.toString();
        } else if (viaTypeSelect.value === 'blind') {
            viaStartLayerSelect.value = '1';
            viaEndLayerSelect.value = Math.min(2, layerCount).toString();
        } else if (viaTypeSelect.value === 'buried') {
            if (layerCount >= 4) {
                viaStartLayerSelect.value = '2';
                viaEndLayerSelect.value = (layerCount - 1).toString();
            } else {
                viaStartLayerSelect.value = '1';
                viaEndLayerSelect.value = layerCount.toString();
            }
        } else if (viaTypeSelect.value === 'micro') {
            viaStartLayerSelect.value = '1';
            viaEndLayerSelect.value = Math.min(2, layerCount).toString();
        }
        
        console.log(`[updateViaLayerOptions] Updated via layer options for ${layerCount} layer PCB`);
    }
    
    // Function to update via controls based on via type
    function updateViaControls() {
        const viaType = viaTypeSelect.value;
        const layerCount = parseInt(layerCountSelect.value);
        
        // Show all controls initially
        document.querySelectorAll('.via-layers-group').forEach(el => {
            el.style.display = 'inline-block';
        });
        
        // Hide staggered via count control by default
        staggeredViasControl.style.display = 'none';
        
        // Set appropriate layer options based on via type
        if (viaType === 'through') {
            // Through hole vias always go from top to bottom
            viaStartLayerSelect.value = '1';
            viaEndLayerSelect.value = layerCount.toString();
            
            // Disable layer selection for through holes
            viaStartLayerSelect.disabled = true;
            viaEndLayerSelect.disabled = true;
        } else if (viaType === 'blind') {
            // Blind vias must start from top or bottom layer
            viaStartLayerSelect.disabled = false;
            viaEndLayerSelect.disabled = false;
            
            // Set default if not already set
            if (viaStartLayerSelect.value !== '1' && viaStartLayerSelect.value !== layerCount.toString()) {
                viaStartLayerSelect.value = '1';
                viaEndLayerSelect.value = Math.min(2, layerCount).toString();
            }
        } else if (viaType === 'buried') {
            // Buried vias cannot include top or bottom layer
            viaStartLayerSelect.disabled = false;
            viaEndLayerSelect.disabled = false;
            
            // Only enable for 4+ layer boards
            if (layerCount < 4) {
                document.querySelectorAll('.via-layers-group').forEach(el => {
                    el.style.display = 'none';
                });
                showNotification("Buried vias require at least 4 layers");
            } else {
                // Set default if current selection includes top or bottom
                if (viaStartLayerSelect.value === '1' || viaEndLayerSelect.value === layerCount.toString()) {
                    viaStartLayerSelect.value = '2';
                    viaEndLayerSelect.value = (layerCount - 1).toString();
                }
            }
        } else if (viaType === 'micro') {
            // Micro vias can only span a single layer
            viaStartLayerSelect.disabled = false;
            viaEndLayerSelect.disabled = false;
            
            // Set start layer
            if (viaStartLayerSelect.value !== '1' && viaStartLayerSelect.value !== layerCount.toString()) {
                viaStartLayerSelect.value = '1';
            }
            
            // Micro vias can only go down one layer
            const startLayer = parseInt(viaStartLayerSelect.value);
            if (startLayer === 1) {
                viaEndLayerSelect.value = '2';
            } else if (startLayer === layerCount) {
                viaEndLayerSelect.value = (layerCount - 1).toString();
            }
        } else if (viaType === 'staggered') {
            // Staggered vias need multiple layers and connect from top to bottom
            if (layerCount < 4) {
                showNotification("Staggered vias require at least 4 layers");
                viaTypeSelect.value = 'blind'; // Fallback to blind via
                updateViaControls(); // Recursive call with new type
                return;
            }
            
            // Set to go from top to bottom layers
            viaStartLayerSelect.value = '1';
            viaEndLayerSelect.value = layerCount.toString();
            
            // Disable direct layer selection as staggered vias always go from top to bottom
            viaStartLayerSelect.disabled = true;
            viaEndLayerSelect.disabled = true;
            
            // Show staggered vias count control
            staggeredViasControl.style.display = 'block';
            
            // Limit count based on layer count (need at least one layer per via segment)
            const maxSegments = Math.floor(layerCount / 2);
            staggeredViasCount.max = maxSegments;
            staggeredViasCount.value = Math.min(parseInt(staggeredViasCount.value), maxSegments);
        }
        
        console.log(`[updateViaControls] Updated controls for via type: ${viaType}`);
    }
    
    function generateStackup() {
        // Get input values
        const layerCount = parseInt(layerCountSelect.value);
        let boardThickness = parseFloat(boardThicknessInput.value);
        const copperWeight = copperWeightSelect.value;
        
        // Get via parameters
        const viaType = viaTypeSelect.value;
        let viaDrillDiameter = parseFloat(viaDrillDiameterInput.value);
        let viaPadDiameter = parseFloat(viaPadDiameterInput.value);
        const viaStartLayer = parseInt(viaStartLayerSelect.value);
        const viaEndLayer = parseInt(viaEndLayerSelect.value);
        const staggeredCount = viaType === 'staggered' ? parseInt(staggeredViasCount.value) : 0;
        
        // Convert from current unit to mm for internal calculations
        if (currentUnit !== 'mm') {
            boardThickness = convertValue(boardThickness, currentUnit, 'mm');
            viaDrillDiameter = convertValue(viaDrillDiameter, currentUnit, 'mm');
            viaPadDiameter = convertValue(viaPadDiameter, currentUnit, 'mm');
            
            console.log(`[generateStackup] Converted from ${currentUnit} to mm: boardThickness=${boardThickness.toFixed(3)}mm, viaDrillDiameter=${viaDrillDiameter.toFixed(3)}mm, viaPadDiameter=${viaPadDiameter.toFixed(3)}mm`);
        }
        
        console.log(`[generateStackup] Starting generation with ${layerCount} layers, ${boardThickness.toFixed(3)}mm thickness, ${copperWeight}oz copper`);
        console.log(`[generateStackup] Via parameters: ${viaType}, drill: ${viaDrillDiameter.toFixed(3)}mm, pad: ${viaPadDiameter.toFixed(3)}mm, from L${viaStartLayer} to L${viaEndLayer}`);
        
        // Clear previous stackup
        stackupPreview.innerHTML = '';
        stackupDetails.innerHTML = '';
        
        // Calculate stackup layers
        console.time('calculateStackup');
        const stackup = calculateStackup(layerCount, boardThickness, copperWeight);
        console.timeEnd('calculateStackup');
        
        console.log(`[generateStackup] Stackup calculated with ${stackup.length} layers`);
        
        // Render stackup preview
        console.time('renderStackupPreview');
        renderStackupPreview(stackup, {
            viaType,
            viaDrillDiameter,
            viaPadDiameter,
            viaStartLayer,
            viaEndLayer,
            staggeredCount
        });
        console.timeEnd('renderStackupPreview');
        
        // Display stackup details
        console.time('displayStackupDetails');
        displayStackupDetails(stackup, {
            viaType,
            viaDrillDiameter,
            viaPadDiameter,
            viaStartLayer,
            viaEndLayer,
            staggeredCount
        });
        console.timeEnd('displayStackupDetails');
        
        console.log('[generateStackup] Stackup generation complete');
    }
    
    function calculateStackup(layerCount, totalThickness, copperWeight) {
        console.log(`[calculateStackup] Calculating stackup for ${layerCount} layers, ${totalThickness}mm total thickness`);
        const stackup = [];
        
        // Calculate copper thickness based on weight
        const copperThickness = materialProperties.copperThickness[copperWeight];
        console.log(`[calculateStackup] Using copper thickness: ${copperThickness}mm per layer`);
        
        // Add top silkscreen
        stackup.push({
            type: 'silkscreen',
            name: 'Top Silkscreen',
            thickness: materialProperties.silkscreenThickness
        });
        
        // Add top solder mask
        stackup.push({
            type: 'solder-mask',
            name: 'Top Solder Mask',
            thickness: materialProperties.solderMaskThickness
        });
        
        // For different layer counts
        if (layerCount === 2) {
            console.log('[calculateStackup] Creating 2-layer stackup');
            
            // Add top copper
            stackup.push({
                type: 'copper',
                name: 'Top Copper (L1)',
                thickness: copperThickness
            });
            
            // Add core
            const coreThickness = totalThickness - (
                2 * copperThickness + 
                2 * materialProperties.solderMaskThickness + 
                2 * materialProperties.silkscreenThickness
            );
            
            console.log(`[calculateStackup] 2-layer calculated core thickness: ${coreThickness.toFixed(3)}mm`);
            
            stackup.push({
                type: 'core',
                name: 'Core',
                thickness: coreThickness
            });
            
            // Add bottom copper
            stackup.push({
                type: 'copper',
                name: 'Bottom Copper (L2)',
                thickness: copperThickness
            });
        } else {
            // Multi-layer PCB
            console.log(`[calculateStackup] Creating multi-layer stackup with ${layerCount} layers`);
            
            // Number of inner layers
            const innerLayers = layerCount - 2;
            // Number of cores needed
            const coreCount = Math.ceil(innerLayers / 2) + 1;
            // Number of prepreg layers (between cores)
            const prepregLayers = coreCount - 1;
            
            console.log(`[calculateStackup] Inner layers: ${innerLayers}, cores: ${coreCount}, prepregs: ${prepregLayers}`);
            
            // Base core thickness (can be adjusted based on total thickness)
            let baseCore = materialProperties.coreThickness[layerCount.toString()];
            console.log(`[calculateStackup] Base core thickness for ${layerCount} layers: ${baseCore}mm`);
            
            // Calculate remaining thickness after accounting for copper, solder mask, and silkscreen
            const remainingThickness = totalThickness - (
                layerCount * copperThickness + 
                2 * materialProperties.solderMaskThickness + 
                2 * materialProperties.silkscreenThickness
            );
            
            console.log(`[calculateStackup] Remaining thickness for cores/prepregs: ${remainingThickness.toFixed(3)}mm`);
            
            // Distribute remaining thickness between cores and prepregs
            const totalCoreThickness = remainingThickness * 0.7; // 70% to cores
            const totalPrepregThickness = remainingThickness * 0.3; // 30% to prepregs
            
            const singleCoreThickness = totalCoreThickness / coreCount;
            const singlePrepregThickness = totalPrepregThickness / (prepregLayers === 0 ? 1 : prepregLayers);
            
            console.log(`[calculateStackup] Single core thickness: ${singleCoreThickness.toFixed(3)}mm, single prepreg: ${singlePrepregThickness.toFixed(3)}mm`);
            
            // Add top copper
            stackup.push({
                type: 'copper',
                name: 'Top Copper (L1)',
                thickness: copperThickness
            });
            
            // Add prepreg, inner copper, and cores
            let currentLayer = 2;
            
            for (let i = 0; i < coreCount; i++) {
                console.log(`[calculateStackup] Processing core ${i+1} of ${coreCount}`);
                
                // Add prepreg after first copper layer
                if (i === 0) {
                    console.log(`[calculateStackup] Adding prepreg after top copper`);
                    stackup.push({
                        type: 'prepreg',
                        name: 'Prepreg',
                        thickness: singlePrepregThickness
                    });
                }
                
                // Add inner copper if not the last core
                if (i < coreCount - 1) {
                    console.log(`[calculateStackup] Adding inner copper layer L${currentLayer}`);
                    stackup.push({
                        type: 'copper',
                        name: `Inner Copper (L${currentLayer})`,
                        thickness: copperThickness
                    });
                    currentLayer++;
                }
                
                // Add core
                console.log(`[calculateStackup] Adding core ${i+1}`);
                stackup.push({
                    type: 'core',
                    name: `Core ${i+1}`,
                    thickness: singleCoreThickness
                });
                
                // Add inner copper on other side of core
                if (i < coreCount - 1) {
                    console.log(`[calculateStackup] Adding inner copper layer L${currentLayer}`);
                    stackup.push({
                        type: 'copper',
                        name: `Inner Copper (L${currentLayer})`,
                        thickness: copperThickness
                    });
                    currentLayer++;
                    
                    // Add prepreg between cores
                    if (i < coreCount - 2) {
                        console.log(`[calculateStackup] Adding prepreg between cores`);
                        stackup.push({
                            type: 'prepreg',
                            name: 'Prepreg',
                            thickness: singlePrepregThickness
                        });
                    }
                }
            }
            
            // Add bottom copper
            stackup.push({
                type: 'copper',
                name: `Bottom Copper (L${layerCount})`,
                thickness: copperThickness
            });
        }
        
        // Add bottom solder mask
        stackup.push({
            type: 'solder-mask',
            name: 'Bottom Solder Mask',
            thickness: materialProperties.solderMaskThickness
        });
        
        // Add bottom silkscreen
        stackup.push({
            type: 'silkscreen',
            name: 'Bottom Silkscreen',
            thickness: materialProperties.silkscreenThickness
        });
        
        // Log the final result
        console.log(`[calculateStackup] Completed stackup calculation with ${stackup.length} total layers`);
        console.table(stackup.map(layer => ({
            name: layer.name,
            type: layer.type,
            thickness: layer.thickness.toFixed(3) + 'mm'
        })));
        
        // Verify total thickness
        const calculatedTotal = stackup.reduce((sum, layer) => sum + layer.thickness, 0);
        console.log(`[calculateStackup] Requested thickness: ${totalThickness.toFixed(3)}mm, Calculated thickness: ${calculatedTotal.toFixed(3)}mm, Difference: ${(calculatedTotal - totalThickness).toFixed(3)}mm`);
        
        return stackup;
    }
    
    function renderStackupPreview(stackup, viaOptions = {}) {
        console.log('[renderStackupPreview] Starting stackup visualization');
        console.log('[renderStackupPreview] Via options:', viaOptions);
        console.log(`[renderStackupPreview] Using unit: ${currentUnit}`);
        
        // Create container for integrated stackup and via visualization
        const container = document.createElement('div');
        container.className = 'stackup-container';
        
        // Create via overlay for cross-section
        const viaCrossSection = document.createElement('div');
        viaCrossSection.className = 'via-cross-section';
        
        // Calculate total thickness for scaling
        const totalThickness = stackup.reduce((sum, layer) => sum + layer.thickness, 0);
        console.log(`[renderStackupPreview] Total stackup thickness for visualization: ${totalThickness.toFixed(3)}mm`);
        
        // Count number of layers
        const layerCount = stackup.length;
        console.log(`[renderStackupPreview] Total layer count: ${layerCount}`);
        
        // Calculate total available height for visualization (px)
        // We subtract some space for margins between layers
        const containerHeight = 500; // Target total height in pixels for the entire stackup
        const marginBetweenLayers = 2; // Pixels
        const totalMarginsHeight = (layerCount - 1) * marginBetweenLayers;
        const availableHeight = containerHeight - totalMarginsHeight;
        console.log(`[renderStackupPreview] Available height for rendering: ${availableHeight}px`);
        
        // Group layers by type to calculate proportional allocation
        const layerTypes = {
            'copper': { totalThickness: 0, count: 0, minHeight: 12 },
            'core': { totalThickness: 0, count: 0, minHeight: 20 },
            'prepreg': { totalThickness: 0, count: 0, minHeight: 10 },
            'solder-mask': { totalThickness: 0, count: 0, minHeight: 5 },
            'silkscreen': { totalThickness: 0, count: 0, minHeight: 5 }
        };
        
        // Calculate thickness for each layer type
        stackup.forEach(layer => {
            if (layer.type in layerTypes) {
                layerTypes[layer.type].totalThickness += layer.thickness;
                layerTypes[layer.type].count++;
            }
        });
        
        // Calculate minimum required height based on minimum heights for each type
        let minimumRequiredHeight = 0;
        for (const type in layerTypes) {
            minimumRequiredHeight += layerTypes[type].count * layerTypes[type].minHeight;
        }
        console.log(`[renderStackupPreview] Minimum required height: ${minimumRequiredHeight}px`);
        
        // Calculate how much extra height we have available for proportional scaling
        const extraAvailableHeight = Math.max(0, availableHeight - minimumRequiredHeight);
        console.log(`[renderStackupPreview] Extra height available for proportional scaling: ${extraAvailableHeight}px`);
        
        // Advanced scaling algorithm:
        // 1. Each layer gets its minimum height
        // 2. Remaining height is distributed proportionally based on physical thickness
        
        // Create stackup visualization
        stackup.forEach((layer, index) => {
            console.log(`[renderStackupPreview] Rendering layer ${index+1}: ${layer.name} (${layer.type})`);
            
            const layerElement = document.createElement('div');
            layerElement.className = 'stackup-layer';
            
            const layerVisual = document.createElement('div');
            layerVisual.className = `layer-visual layer-${layer.type}`;
            
            // Start with minimum height for this layer type
            const minHeight = layerTypes[layer.type].minHeight;
            
            // Calculate proportional height based on physical thickness
            const thicknessRatio = layer.thickness / totalThickness;
            const extraProportionalHeight = extraAvailableHeight * thicknessRatio;
            
            // Blend the minimum and proportional heights
            // For layers with very small physical thickness, the minimum height dominates
            // For thicker layers, the proportional allocation has more influence
            let scaledHeight;
            
            // Use adaptive scaling based on layer count
            if (layerCount <= 6) {
                // For fewer layers, we can use more proportional scaling (looks nicer for 2-6 layer boards)
                const scalingFactor = 1.0;  // Full proportional scaling
                scaledHeight = minHeight + (extraProportionalHeight * scalingFactor);
            } else {
                // For many layers, we need to ensure thin layers remain visible
                // Use more aggressive scaling factors for different layer types
                const typeScalingFactors = {
                    'copper': 0.8,        // Copper should be distinct
                    'core': 1.2,         // Cores can vary a lot in thickness
                    'prepreg': 0.7,      // Prepregs are usually thin
                    'solder-mask': 0.5,  // Solder mask is very thin
                    'silkscreen': 0.3    // Silkscreen is extremely thin
                };
                
                const scalingFactor = typeScalingFactors[layer.type] || 1.0;
                scaledHeight = minHeight + (extraProportionalHeight * scalingFactor);
            }
            
            // Apply a mild logarithmic scale for very thick layers to prevent them from dominating
            if (thicknessRatio > 0.2) { // If this layer is >20% of the total thickness
                scaledHeight = minHeight + (Math.log(1 + extraProportionalHeight) * 20);
            }
            
            // For very thin layers (like solder mask, silkscreen), ensure visibility
            if (layer.type === 'solder-mask' || layer.type === 'silkscreen') {
                scaledHeight = Math.max(scaledHeight, minHeight);
            }
            
            // Round to nearest pixel
            scaledHeight = Math.max(minHeight, Math.round(scaledHeight));
            
            console.log(`[renderStackupPreview] Layer ${layer.name}: actual ${layer.thickness.toFixed(3)}mm (${(thicknessRatio * 100).toFixed(1)}%), visual height: ${scaledHeight}px`);
            
            layerVisual.style.height = `${scaledHeight}px`;
            layerVisual.style.marginBottom = `${marginBetweenLayers}px`;
            layerVisual.textContent = layer.name;
            
            // Debug attribute to help with CSS troubleshooting
            layerVisual.setAttribute('data-thickness', layer.thickness.toFixed(3));
            layerVisual.setAttribute('data-percentage', (thicknessRatio * 100).toFixed(1));
            layerVisual.setAttribute('data-scaled-height', scaledHeight);
            layerVisual.setAttribute('data-layer-index', index);
            layerVisual.setAttribute('data-layer-name', layer.name);
            layerVisual.setAttribute('data-layer-type', layer.type);
            
            // Add tooltip title for hover on small layers
            layerVisual.setAttribute('title', `${layer.name} - ${layer.thickness.toFixed(3)}mm`);
            
            // Placeholder for via embeddings in layer - add these later when we know about the via
            if (layer.type === 'copper') {
                // Extract layer number for copper layers
                const layerMatch = layer.name.match(/L(\d+)/);
                if (layerMatch) {
                    const layerNum = parseInt(layerMatch[1]);
                    layerVisual.setAttribute('data-copper-layer', layerNum);
                    
                    // Add placeholder for via pad in copper layers
                    const viaPadEmbed = document.createElement('div');
                    viaPadEmbed.className = 'via-embed via-pad-embed via-embed-hidden';
                    viaPadEmbed.setAttribute('data-via-embed-type', 'pad');
                    layerVisual.appendChild(viaPadEmbed);
                }
            }
            
            // Add placeholders for via drill holes in all layer types
            const viaDrillEmbed = document.createElement('div');
            viaDrillEmbed.className = 'via-embed via-drill-embed via-embed-hidden';
            viaDrillEmbed.setAttribute('data-via-embed-type', 'drill');
            layerVisual.appendChild(viaDrillEmbed);
            
            const layerInfo = document.createElement('div');
            layerInfo.className = 'layer-info';
            
            // Convert thickness to current unit and format appropriately
            const thicknessInCurrentUnit = convertValue(layer.thickness, 'mm', currentUnit);
            layerInfo.textContent = `${formatValueForUnit(thicknessInCurrentUnit, currentUnit)} ${currentUnit}`;
            
            layerElement.appendChild(layerVisual);
            layerElement.appendChild(layerInfo);
            
            container.appendChild(layerElement);
        });
        
        // Only render via if there are options
        if (viaOptions.viaType) {
            // Find copper layers to place via pads
            const copperLayers = [];
            let totalHeightSoFar = 0;
            let layerPositions = [];
            
            // Calculate positions of all copper layers
            const allLayerElements = container.querySelectorAll('.layer-visual');
            stackup.forEach((layer, index) => {
                const element = allLayerElements[index];
                const scaledHeight = parseInt(element.getAttribute('data-scaled-height'));
                
                if (layer.type === 'copper') {
                    const layerNumber = layer.name.match(/L(\d+)/);
                    if (layerNumber) {
                        const num = parseInt(layerNumber[1]);
                        const position = totalHeightSoFar + scaledHeight / 2;
                        copperLayers.push({ num, position, element, scaledHeight });
                    }
                }
                
                totalHeightSoFar += scaledHeight + marginBetweenLayers;
                layerPositions.push({ 
                    top: totalHeightSoFar - scaledHeight - marginBetweenLayers,
                    bottom: totalHeightSoFar - marginBetweenLayers,
                    height: scaledHeight,
                    type: layer.type
                });
            });
            
            // Get via dimensions from inputs
            const viaDrillDiameter = viaOptions.viaDrillDiameter;
            const viaPadDiameter = viaOptions.viaPadDiameter;
            const viaStartLayer = viaOptions.viaStartLayer;
            const viaEndLayer = viaOptions.viaEndLayer;
            const viaType = viaOptions.viaType;
            const staggeredCount = viaOptions.staggeredCount || 2;
            
            // Visual sizing: make vias stand out clearly in cross-section
            const containerWidth = container.offsetWidth || 800; // Fallback width if not available
            const baseViaPositionX = containerWidth * 0.75; // Position via at 3/4 of the width
            
            // Scale via components - keep aspect ratio of diameter/thickness, but make visible
            const drillDiameterPx = Math.max(6, containerWidth * 0.03); // Min width 6px, or 3% of container
            const padDiameterPx = drillDiameterPx * (viaPadDiameter / viaDrillDiameter);
            
            // Render tooltip container for interactive info
            const tooltipContainer = document.createElement('div');
            tooltipContainer.className = 'via-tooltip';
            tooltipContainer.style.opacity = '0';
            document.body.appendChild(tooltipContainer);
            
            // Function to show tooltip on via element hover
            const showTooltip = (element, text) => {
                element.classList.add('via-element');
                
                element.addEventListener('mouseenter', (e) => {
                    tooltipContainer.textContent = text;
                    tooltipContainer.style.opacity = '1';
                    
                    // Position tooltip relative to mouse
                    const updateTooltipPosition = (e) => {
                        tooltipContainer.style.left = `${e.clientX + 10}px`;
                        tooltipContainer.style.top = `${e.clientY + 10}px`;
                    };
                    
                    updateTooltipPosition(e);
                    element.addEventListener('mousemove', updateTooltipPosition);
                });
                
                element.addEventListener('mouseleave', () => {
                    tooltipContainer.style.opacity = '0';
                });
            };
            
            // Render via(s) based on type
            if (viaType === 'staggered') {
                // Create multiple staggered vias
                renderStaggeredVias();
            } else {
                // Render standard single via
                renderSingleVia();
            }
            
            // Function to render standard via types (through, blind, buried, micro)
            function renderSingleVia() {
                // Find the positions of start and end layers
                const startLayerObj = copperLayers.find(l => l.num === viaStartLayer);
                const endLayerObj = copperLayers.find(l => l.num === viaEndLayer);
                
                if (!startLayerObj || !endLayerObj) {
                    console.error('[renderStackupPreview] Unable to find start or end copper layers for via');
                    return;
                }
                
                // Find copper layer thicknesses to ensure vias connect properly
                const startLayerThickness = startLayerObj.scaledHeight;
                const endLayerThickness = endLayerObj.scaledHeight;
                
                // Calculate the center of copper layers for accurate pad alignment
                const startLayerCenter = startLayerObj.position;
                const endLayerCenter = endLayerObj.position;
                
                // Create via label with type
                const viaLabel = document.createElement('div');
                viaLabel.className = 'via-label';
                viaLabel.textContent = `${viaType.charAt(0).toUpperCase() + viaType.slice(1)} Via`;
                viaLabel.style.top = `${(startLayerCenter + endLayerCenter) / 2 - 15}px`;
                viaCrossSection.appendChild(viaLabel);
                
                // Prepare barrel dimensions
                const barrelTop = startLayerCenter;
                const barrelBottom = endLayerCenter;
                const barrelHeight = barrelBottom - barrelTop;
                
                // Create a properly styled barrel based on via type
                const viaBarrel = document.createElement('div');
                viaBarrel.className = `via-barrel ${viaType}-via via-element`;  // Add via type class
                viaBarrel.style.width = `${drillDiameterPx}px`;
                viaBarrel.style.height = `${barrelHeight}px`;
                viaBarrel.style.top = `${barrelTop}px`;
                viaBarrel.style.left = `${baseViaPositionX}px`;
                viaCrossSection.appendChild(viaBarrel);
                
                // Add tooltips
                showTooltip(viaBarrel, `${viaType.charAt(0).toUpperCase() + viaType.slice(1)} via barrel - Ø${formatValueForUnit(convertValue(viaDrillDiameter, 'mm', currentUnit), currentUnit)}${currentUnit}`);
                
                // Render via pads precisely at copper layers
                // Start layer pad
                const startPad = document.createElement('div');
                startPad.className = 'via-pad start-pad via-element';  // Add start-pad class
                startPad.style.width = `${padDiameterPx}px`;
                startPad.style.height = `${startLayerThickness}px`;
                startPad.style.top = `${startLayerCenter - startLayerThickness/2}px`;
                startPad.style.left = `${baseViaPositionX}px`;
                viaCrossSection.appendChild(startPad);
                
                // Add tooltips
                showTooltip(startPad, `Start pad at layer ${viaStartLayer} - Ø${formatValueForUnit(convertValue(viaPadDiameter, 'mm', currentUnit), currentUnit)}${currentUnit}`);
                
                // End layer pad
                const endPad = document.createElement('div');
                endPad.className = 'via-pad end-pad via-element';  // Add end-pad class
                endPad.style.width = `${padDiameterPx}px`;
                endPad.style.height = `${endLayerThickness}px`;
                endPad.style.top = `${endLayerCenter - endLayerThickness/2}px`;
                endPad.style.left = `${baseViaPositionX}px`;
                viaCrossSection.appendChild(endPad);
                
                // Add tooltips
                showTooltip(endPad, `End pad at layer ${viaEndLayer} - Ø${formatValueForUnit(convertValue(viaPadDiameter, 'mm', currentUnit), currentUnit)}${currentUnit}`);
                
                // Render pad dimension label
                const padDimensionLabel = document.createElement('div');
                padDimensionLabel.className = 'via-dimension';
                const padDiameterConverted = formatValueForUnit(convertValue(viaPadDiameter, 'mm', currentUnit), currentUnit);
                padDimensionLabel.textContent = `Pad: Ø${padDiameterConverted}${currentUnit}`;
                padDimensionLabel.style.top = `${startLayerCenter - startLayerThickness}px`;
                viaCrossSection.appendChild(padDimensionLabel);
                
                // Render drill dimension label
                const drillDimensionLabel = document.createElement('div');
                drillDimensionLabel.className = 'via-dimension';
                const drillDiameterConverted = formatValueForUnit(convertValue(viaDrillDiameter, 'mm', currentUnit), currentUnit);
                drillDimensionLabel.textContent = `Drill: Ø${drillDiameterConverted}${currentUnit}`;
                drillDimensionLabel.style.top = `${startLayerObj.position + barrelHeight/2}px`;
                viaCrossSection.appendChild(drillDimensionLabel);
                
                // Add different appearances based on via type
                if (viaType === 'micro') {
                    renderMicroVia(baseViaPositionX, barrelTop, barrelHeight, drillDiameterPx);
                } else if (viaType === 'blind') {
                    renderBlindVia(baseViaPositionX, barrelTop, barrelHeight, drillDiameterPx);
                } else if (viaType === 'buried') {
                    renderBuriedVia(baseViaPositionX, barrelTop, barrelHeight, drillDiameterPx, copperLayers, viaStartLayer, viaEndLayer, padDiameterPx);
                } else {
                    // Through-hole via - standard visualization
                    const viaDrill = createViaDrill(baseViaPositionX, barrelTop, barrelHeight, drillDiameterPx);
                    viaCrossSection.appendChild(viaDrill);
                    
                    // Add tooltips
                    showTooltip(viaDrill, `Through-hole via drill - Ø${drillDiameterConverted}${currentUnit}`);
                }
                
                // Add aspect ratio label if displayed
                if (barrelHeight / drillDiameterPx > 5) {
                    const aspectRatio = (barrelHeight / drillDiameterPx).toFixed(1);
                    const aspectRatioLabel = document.createElement('div');
                    aspectRatioLabel.className = 'via-dimension';
                    aspectRatioLabel.textContent = `AR: ${aspectRatio}:1`;
                    aspectRatioLabel.style.top = `${startLayerObj.position + barrelHeight/2 - 25}px`;
                    viaCrossSection.appendChild(aspectRatioLabel);
                }
                
                // Now add via representations to the individual layers
                updateLayerEmbeds(viaType, viaStartLayer, viaEndLayer, viaDrillDiameter, viaPadDiameter);
            }
            
            // Function to create a via drill element
            function createViaDrill(posX, top, height, drillDiameterPx) {
                const viaDrill = document.createElement('div');
                viaDrill.className = 'via-drill via-element';
                viaDrill.style.width = `${drillDiameterPx * 0.9}px`; // Slightly narrower than the barrel
                viaDrill.style.height = `${height}px`;
                viaDrill.style.top = `${top}px`;
                viaDrill.style.left = `${posX}px`;
                return viaDrill;
            }
            
            // Function to render a micro via
            function renderMicroVia(posX, barrelTop, barrelHeight, drillDiameterPx) {
                // Create conical shape for micro via (laser drilled)
                const microCone = document.createElement('div');
                microCone.className = 'via-drill micro-via via-element';
                // Create a conical/tapered shape using CSS borders
                microCone.style.width = '0';
                microCone.style.height = '0';
                microCone.style.borderLeft = `${drillDiameterPx * 0.4}px solid transparent`;
                microCone.style.borderRight = `${drillDiameterPx * 0.4}px solid transparent`;
                microCone.style.borderTop = `${barrelHeight}px solid #555`;
                microCone.style.top = `${barrelTop}px`;
                microCone.style.left = `${posX}px`;
                viaCrossSection.appendChild(microCone);
                
                // Add micro via note (laser drilled)
                const microViaNote = document.createElement('div');
                microViaNote.className = 'via-dimension';
                microViaNote.textContent = 'Laser drilled';
                microViaNote.style.top = `${barrelTop + barrelHeight/2 + 20}px`;
                viaCrossSection.appendChild(microViaNote);
                
                // Add tooltips
                showTooltip(microCone, `Micro via (laser drilled) - connects adjacent layers only`);
            }
            
            // Function to render a blind via
            function renderBlindVia(posX, barrelTop, barrelHeight, drillDiameterPx) {
                // Blind via only goes partway through the board
                // Adjust drill hole length to be slightly shorter than barrel
                const viaDrill = createViaDrill(posX, barrelTop, barrelHeight * 0.9, drillDiameterPx);
                viaCrossSection.appendChild(viaDrill);
                
                // Add a rounded cap at the end of the blind via
                const blindCap = document.createElement('div');
                blindCap.className = 'via-drill via-element';
                blindCap.style.width = `${drillDiameterPx * 0.9}px`;
                blindCap.style.height = `${drillDiameterPx * 0.4}px`;
                blindCap.style.borderRadius = '0 0 50% 50%';
                blindCap.style.top = `${barrelTop + barrelHeight * 0.9 - drillDiameterPx * 0.2}px`;
                blindCap.style.left = `${posX}px`;
                viaCrossSection.appendChild(blindCap);
                
                // Add a note about blind via
                const blindViaNote = document.createElement('div');
                blindViaNote.className = 'via-dimension';
                blindViaNote.textContent = 'Partial depth';
                blindViaNote.style.top = `${barrelTop + barrelHeight/2 + 20}px`;
                viaCrossSection.appendChild(blindViaNote);
                
                // Add tooltips
                showTooltip(viaDrill, `Blind via - partial depth drill from outer layer`);
                showTooltip(blindCap, `Blind via end - does not penetrate entire board`);
            }
            
            // Function to render a buried via
            function renderBuriedVia(posX, barrelTop, barrelHeight, drillDiameterPx, copperLayers, viaStartLayer, viaEndLayer, padDiameterPx) {
                // For buried vias, add the drill hole
                const viaDrill = createViaDrill(posX, barrelTop, barrelHeight, drillDiameterPx);
                viaCrossSection.appendChild(viaDrill);
                
                // Add inner layer connection indicators
                for (let i = 0; i < copperLayers.length; i++) {
                    const layer = copperLayers[i];
                    // Only add indicators for inner layers between start and end
                    if (layer.num > viaStartLayer && layer.num < viaEndLayer) {
                        const innerConnection = document.createElement('div');
                        innerConnection.className = 'via-pad via-element';
                        innerConnection.style.width = `${padDiameterPx * 0.7}px`; // Slightly smaller than main pads
                        innerConnection.style.height = `${layer.scaledHeight}px`;
                        innerConnection.style.top = `${layer.position - layer.scaledHeight/2}px`;
                        innerConnection.style.left = `${posX}px`;
                        innerConnection.style.opacity = '0.9';
                        viaCrossSection.appendChild(innerConnection);
                        
                        // Add tooltips
                        showTooltip(innerConnection, `Inner layer ${layer.num} connection`);
                    }
                }
                
                // Add a note about buried via
                const buriedViaNote = document.createElement('div');
                buriedViaNote.className = 'via-dimension';
                buriedViaNote.textContent = 'Internal only';
                buriedViaNote.style.top = `${barrelTop + barrelHeight/2 + 20}px`;
                viaCrossSection.appendChild(buriedViaNote);
                
                // Add tooltips
                showTooltip(viaDrill, `Buried via - connects only internal layers`);
            }
            
            // Function to render staggered vias
            function renderStaggeredVias() {
                // For staggered vias, we need to create multiple segments that connect different layers
                const layerCount = parseInt(layerCountSelect.value);
                const numberOfSegments = Math.min(staggeredCount, Math.floor(layerCount / 2));
                
                // Horizontal offset between staggered vias - 5% of container width
                const horizontalOffset = containerWidth * 0.05;
                
                // Create label for staggered vias
                const viaLabel = document.createElement('div');
                viaLabel.className = 'via-label';
                viaLabel.textContent = 'Staggered Vias';
                viaLabel.style.top = '15px';
                viaCrossSection.appendChild(viaLabel);
                
                // Calculate layers involved in each segment
                const segments = calculateStaggeredSegments(layerCount, numberOfSegments);
                
                // Render each segment
                for (let i = 0; i < segments.length; i++) {
                    const segment = segments[i];
                    const segStartLayer = segment.startLayer;
                    const segEndLayer = segment.endLayer;
                    
                    // Find the positions of start and end layers for this segment
                    const startLayerObj = copperLayers.find(l => l.num === segStartLayer);
                    const endLayerObj = copperLayers.find(l => l.num === segEndLayer);
                    
                    if (!startLayerObj || !endLayerObj) {
                        console.error(`[renderStackupPreview] Unable to find copper layers for staggered segment ${i+1}`);
                        continue;
                    }
                    
                    // Calculate the center of copper layers for accurate pad alignment
                    const startLayerCenter = startLayerObj.position;
                    const endLayerCenter = endLayerObj.position;
                    
                    // Alternate horizontal positions for segments
                    let segmentPosX = baseViaPositionX;
                    if (i % 2 === 1) {
                        segmentPosX = baseViaPositionX - horizontalOffset;
                    } else if (i > 0) {
                        segmentPosX = baseViaPositionX + horizontalOffset;
                    }
                    
                    // Find copper layer thicknesses
                    const startLayerThickness = startLayerObj.scaledHeight;
                    const endLayerThickness = endLayerObj.scaledHeight;
                    
                    // Barrel dimensions
                    const barrelTop = startLayerCenter;
                    const barrelBottom = endLayerCenter;
                    const barrelHeight = barrelBottom - barrelTop;
                    
                    // Create segment barrel
                    const viaBarrel = document.createElement('div');
                    viaBarrel.className = `via-barrel staggered-via via-element`;
                    viaBarrel.style.width = `${drillDiameterPx}px`;
                    viaBarrel.style.height = `${barrelHeight}px`;
                    viaBarrel.style.top = `${barrelTop}px`;
                    viaBarrel.style.left = `${segmentPosX}px`;
                    viaCrossSection.appendChild(viaBarrel);
                    
                    // Add tooltips with segment info
                    showTooltip(viaBarrel, `Staggered via segment ${i+1}/${segments.length} - Connects L${segStartLayer} to L${segEndLayer}`);
                    
                    // Create drill for segment (if not first or last, make it fully buried)
                    const viaDrill = createViaDrill(segmentPosX, barrelTop, barrelHeight, drillDiameterPx * 0.9);
                    viaCrossSection.appendChild(viaDrill);
                    
                    // Add tooltips
                    showTooltip(viaDrill, `Drill for segment ${i+1} - Connects L${segStartLayer} to L${segEndLayer}`);
                    
                    // Start pad for segment
                    const startPad = document.createElement('div');
                    startPad.className = 'via-pad start-pad via-element';
                    startPad.style.width = `${padDiameterPx}px`;
                    startPad.style.height = `${startLayerThickness}px`;
                    startPad.style.top = `${startLayerCenter - startLayerThickness/2}px`;
                    startPad.style.left = `${segmentPosX}px`;
                    viaCrossSection.appendChild(startPad);
                    
                    // Add tooltips
                    showTooltip(startPad, `Pad at layer ${segStartLayer} - Staggered segment ${i+1}`);
                    
                    // End pad for segment
                    const endPad = document.createElement('div');
                    endPad.className = 'via-pad end-pad via-element';
                    endPad.style.width = `${padDiameterPx}px`;
                    endPad.style.height = `${endLayerThickness}px`;
                    endPad.style.top = `${endLayerCenter - endLayerThickness/2}px`;
                    endPad.style.left = `${segmentPosX}px`;
                    viaCrossSection.appendChild(endPad);
                    
                    // Add tooltips
                    showTooltip(endPad, `Pad at layer ${segEndLayer} - Staggered segment ${i+1}`);
                    
                    // Connect to next segment with traces (horizontal line in copper layer)
                    if (i < segments.length - 1) {
                        const nextSegment = segments[i + 1];
                        const nextSegmentStartLayer = nextSegment.startLayer;
                        
                        // If this segment's end layer is the next segment's start layer, add a connection
                        if (segEndLayer === nextSegmentStartLayer) {
                            const connectionLayerObj = copperLayers.find(l => l.num === segEndLayer);
                            
                            if (connectionLayerObj) {
                                // Next segment's horizontal position
                                let nextSegmentPosX = baseViaPositionX;
                                if ((i+1) % 2 === 1) {
                                    nextSegmentPosX = baseViaPositionX - horizontalOffset;
                                } else {
                                    nextSegmentPosX = baseViaPositionX + horizontalOffset;
                                }
                                
                                // Create connector trace
                                const connector = document.createElement('div');
                                connector.className = 'via-connector via-element';
                                
                                // Calculate start, end, width
                                const connectorStart = Math.min(segmentPosX, nextSegmentPosX);
                                const connectorWidth = Math.abs(nextSegmentPosX - segmentPosX);
                                
                                connector.style.width = `${connectorWidth}px`;
                                connector.style.top = `${connectionLayerObj.position}px`;
                                connector.style.left = `${connectorStart + connectorWidth/2}px`;
                                connector.style.transform = 'translateX(-50%)';
                                viaCrossSection.appendChild(connector);
                                
                                // Add tooltips
                                showTooltip(connector, `Trace connecting segments ${i+1} and ${i+2} on layer ${segEndLayer}`);
                            }
                        }
                    }
                }
                
                // Add note about staggered vias
                const staggeredNote = document.createElement('div');
                staggeredNote.className = 'via-dimension';
                staggeredNote.textContent = `${numberOfSegments} staggered segments`;
                staggeredNote.style.top = '40px';
                viaCrossSection.appendChild(staggeredNote);
                
                // Add drill/pad dimension labels to the side
                const padDimensionLabel = document.createElement('div');
                padDimensionLabel.className = 'via-dimension';
                const padDiameterConverted = formatValueForUnit(convertValue(viaPadDiameter, 'mm', currentUnit), currentUnit);
                padDimensionLabel.textContent = `Pad: Ø${padDiameterConverted}${currentUnit}`;
                padDimensionLabel.style.top = '60px';
                viaCrossSection.appendChild(padDimensionLabel);
                
                const drillDimensionLabel = document.createElement('div');
                drillDimensionLabel.className = 'via-dimension';
                const drillDiameterConverted = formatValueForUnit(convertValue(viaDrillDiameter, 'mm', currentUnit), currentUnit);
                drillDimensionLabel.textContent = `Drill: Ø${drillDiameterConverted}${currentUnit}`;
                drillDimensionLabel.style.top = '80px';
                viaCrossSection.appendChild(drillDimensionLabel);
                
                // Update the via embeds in each layer for all the segments
                segments.forEach((segment, i) => {
                    // Use a different horizontal position per segment to show them more clearly
                    let embedXOffset = 0;
                    if (i % 2 === 1) {
                        embedXOffset = -5;
                    } else if (i > 0) {
                        embedXOffset = 5;
                    }
                    
                    updateLayerEmbeds('staggered', segment.startLayer, segment.endLayer, viaDrillDiameter, viaPadDiameter, embedXOffset);
                });
            }
            
            // Calculate staggered via segments
            function calculateStaggeredSegments(layerCount, segmentCount) {
                const segments = [];
                
                if (segmentCount <= 0 || layerCount < 4) {
                    return segments;
                }
                
                // Simple strategy: divide board into equal sections
                const layersPerSegment = Math.ceil((layerCount - 1) / segmentCount);
                
                for (let i = 0; i < segmentCount; i++) {
                    // Calculate start layer for segment
                    const startLayerNum = i * layersPerSegment + 1;
                    
                    // Calculate end layer, but don't exceed total layer count
                    let endLayerNum = Math.min((i + 1) * layersPerSegment + 1, layerCount);
                    
                    // Ensure segments overlap at copper layers
                    if (i > 0) {
                        // Previous segment ended at the current segment's start
                        segments[i-1].endLayer = startLayerNum;
                    }
                    
                    segments.push({
                        startLayer: startLayerNum,
                        endLayer: endLayerNum
                    });
                }
                
                // Ensure last segment reaches the bottom layer
                if (segments.length > 0) {
                    segments[segments.length - 1].endLayer = layerCount;
                }
                
                return segments;
            }
            
            // Update embedded vias in each layer
            function updateLayerEmbeds(viaType, viaStartLayer, viaEndLayer, viaDrillDiameter, viaPadDiameter, xOffset = 0) {
                const layerVisuals = container.querySelectorAll('.layer-visual');
                
                layerVisuals.forEach(layerVisual => {
                    const layerType = layerVisual.getAttribute('data-layer-type');
                    
                    if (layerType === 'copper') {
                        const copperLayerNum = parseInt(layerVisual.getAttribute('data-copper-layer'));
                        
                        // Show pad in copper layers that are connected to the via
                        const padEmbed = layerVisual.querySelector('.via-pad-embed');
                        if (padEmbed) {
                            if (copperLayerNum === viaStartLayer || copperLayerNum === viaEndLayer) {
                                // Clone pad to ensure we have one for each via (for staggered types with multiple vias)
                                const newPadEmbed = padEmbed.cloneNode(true);
                                newPadEmbed.classList.remove('via-embed-hidden');
                                
                                // Apply x-offset if needed (for staggered vias)
                                if (xOffset !== 0) {
                                    const currentRight = parseInt(getComputedStyle(newPadEmbed).right) || 10;
                                    newPadEmbed.style.right = `${currentRight - xOffset}px`;
                                }
                                
                                const padDiameterConverted = formatValueForUnit(convertValue(viaPadDiameter, 'mm', currentUnit), currentUnit);
                                newPadEmbed.setAttribute('title', `Via pad: Ø${padDiameterConverted}${currentUnit}`);
                                
                                layerVisual.appendChild(newPadEmbed);
                            } else if ((viaType === 'buried' || viaType === 'staggered') && 
                                     copperLayerNum > viaStartLayer && 
                                     copperLayerNum < viaEndLayer) {
                                // Show smaller pads for inner layers of buried vias
                                const newPadEmbed = padEmbed.cloneNode(true);
                                newPadEmbed.classList.remove('via-embed-hidden');
                                newPadEmbed.style.width = '12px'; // Slightly smaller pad for inner connections
                                
                                // Apply x-offset if needed (for staggered vias)
                                if (xOffset !== 0) {
                                    const currentRight = parseInt(getComputedStyle(newPadEmbed).right) || 10;
                                    newPadEmbed.style.right = `${currentRight - xOffset}px`;
                                }
                                
                                newPadEmbed.setAttribute('title', 'Inner layer connection');
                                layerVisual.appendChild(newPadEmbed);
                            }
                        }
                    }
                    
                    // Show drill holes in all layers between start and end (inclusive for through and micro, exclusive for others)
                    const layerIndex = parseInt(layerVisual.getAttribute('data-layer-index'));
                    const drillEmbed = layerVisual.querySelector('.via-drill-embed');
                    
                    if (drillEmbed) {
                        const layerName = layerVisual.getAttribute('data-layer-name');
                        const startLayerObj = copperLayers.find(l => l.num === viaStartLayer);
                        const endLayerObj = copperLayers.find(l => l.num === viaEndLayer);
                        
                        if (!startLayerObj || !endLayerObj) {
                            return;
                        }
                        
                        const startLayerIndex = stackup.findIndex(l => l.name === startLayerObj.element.getAttribute('data-layer-name'));
                        const endLayerIndex = stackup.findIndex(l => l.name === endLayerObj.element.getAttribute('data-layer-name'));
                        
                        // Logic for which layers show drill holes based on via type
                        let showDrill = false;
                        
                        if (viaType === 'through') {
                            // Through holes show in all layers
                            showDrill = layerIndex >= startLayerIndex && layerIndex <= endLayerIndex;
                        } else if (viaType === 'blind' || viaType === 'staggered') {
                            // Blind vias show from start down to but not quite reaching end
                            showDrill = layerIndex >= startLayerIndex && layerIndex < endLayerIndex;
                        } else if (viaType === 'buried') {
                            // Buried vias show only in middle layers
                            showDrill = layerIndex > startLayerIndex && layerIndex < endLayerIndex;
                        } else if (viaType === 'micro') {
                            // Micro vias only show at top layer with special shape
                            if (layerIndex === startLayerIndex) {
                                // Clone to avoid affecting other vias
                                const newDrillEmbed = drillEmbed.cloneNode(true);
                                newDrillEmbed.classList.remove('via-embed-hidden');
                                newDrillEmbed.classList.add('micro-via-embed');
                                
                                // Apply x-offset if needed
                                if (xOffset !== 0) {
                                    const currentRight = parseInt(getComputedStyle(newDrillEmbed).right) || 13;
                                    newDrillEmbed.style.right = `${currentRight - xOffset}px`;
                                }
                                
                                const drillDiameterConverted = formatValueForUnit(convertValue(viaDrillDiameter, 'mm', currentUnit), currentUnit);
                                newDrillEmbed.setAttribute('title', `Micro via drill: Ø${drillDiameterConverted}${currentUnit}`);
                                layerVisual.appendChild(newDrillEmbed);
                            }
                        }
                        
                        if (showDrill) {
                            // Clone to avoid affecting other vias
                            const newDrillEmbed = drillEmbed.cloneNode(true);
                            newDrillEmbed.classList.remove('via-embed-hidden');
                            
                            // Apply x-offset if needed
                            if (xOffset !== 0) {
                                const currentRight = parseInt(getComputedStyle(newDrillEmbed).right) || 13;
                                newDrillEmbed.style.right = `${currentRight - xOffset}px`;
                            }
                            
                            const drillDiameterConverted = formatValueForUnit(convertValue(viaDrillDiameter, 'mm', currentUnit), currentUnit);
                            newDrillEmbed.setAttribute('title', `Via drill: Ø${drillDiameterConverted}${currentUnit}`);
                            layerVisual.appendChild(newDrillEmbed);
                        }
                    }
                });
            }
        }
        
        // Add the via cross-section overlay
        container.appendChild(viaCrossSection);
        
        // Add the complete container to the preview
        stackupPreview.appendChild(container);
        
        console.log('[renderStackupPreview] Stackup visualization complete with via rendering');
    }
    
    function displayStackupDetails(stackup, viaOptions = {}) {
        console.log('[displayStackupDetails] Generating stackup details');
        
        // Calculate total thickness
        const totalThickness = stackup.reduce((sum, layer) => sum + layer.thickness, 0);
        console.log(`[displayStackupDetails] Calculated total thickness: ${totalThickness.toFixed(3)}mm`);
        
        // Count layer types
        const layerCounts = {
            copper: 0,
            core: 0,
            prepreg: 0
        };
        
        // Track material distribution
        const materialDistribution = {
            copper: 0,
            core: 0,
            prepreg: 0,
            'solder-mask': 0,
            silkscreen: 0
        };
        
        stackup.forEach(layer => {
            // Count layer types
            if (layer.type in layerCounts) {
                layerCounts[layer.type]++;
            }
            
            // Track material thickness by type
            if (layer.type in materialDistribution) {
                materialDistribution[layer.type] += layer.thickness;
            }
        });
        
        // Log material distribution
        console.log('[displayStackupDetails] Material distribution:');
        for (const [material, thickness] of Object.entries(materialDistribution)) {
            const percentage = (thickness / totalThickness) * 100;
            console.log(`[displayStackupDetails] - ${material}: ${thickness.toFixed(3)}mm (${percentage.toFixed(1)}%)`);
        }
        
        // Calculate aspect ratio using drill diameter from via settings
        const drillDiameter = viaOptions.viaDrillDiameter || 0.3; // Use via drill diameter if available
        const aspectRatio = calculateAspectRatio(stackup, drillDiameter);
        console.log(`[displayStackupDetails] Aspect ratio with ${drillDiameter}mm drill: ${aspectRatio.toFixed(2)}:1`);
        
        // Convert measurements to current unit
        const totalThicknessConverted = formatValueForUnit(convertValue(totalThickness, 'mm', currentUnit), currentUnit);
        
        // Create basic details HTML
        let detailsHTML = `
            <p><strong>Total Board Thickness:</strong> ${totalThicknessConverted} ${currentUnit}</p>
            <p><strong>Copper Layers:</strong> ${layerCounts.copper}</p>
            <p><strong>Core Layers:</strong> ${layerCounts.core}</p>
            <p><strong>Prepreg Layers:</strong> ${layerCounts.prepreg}</p>
            <p><strong>Aspect Ratio:</strong> ${aspectRatio.toFixed(2)}:1</p>
        `;
        
        // Add via details if present
        if (viaOptions.viaType) {
            const viaType = viaOptions.viaType.charAt(0).toUpperCase() + viaOptions.viaType.slice(1);
            const annularRingMm = ((viaOptions.viaPadDiameter - viaOptions.viaDrillDiameter) / 2);
            const annularRingConverted = formatValueForUnit(convertValue(annularRingMm, 'mm', currentUnit), currentUnit);
            
            const drillDiameterConverted = formatValueForUnit(convertValue(viaOptions.viaDrillDiameter, 'mm', currentUnit), currentUnit);
            const padDiameterConverted = formatValueForUnit(convertValue(viaOptions.viaPadDiameter, 'mm', currentUnit), currentUnit);
            
            let viaDetails = `
                <h3>Via Specifications</h3>
                <p><strong>Via Type:</strong> ${viaType}</p>
                <p><strong>Drill Diameter:</strong> ${drillDiameterConverted} ${currentUnit}</p>
                <p><strong>Pad Diameter:</strong> ${padDiameterConverted} ${currentUnit}</p>
                <p><strong>Annular Ring:</strong> ${annularRingConverted} ${currentUnit}</p>
            `;
            
            // Different layer information depending on via type
            if (viaOptions.viaType === 'staggered') {
                viaDetails += `
                    <p><strong>Staggered Via Segments:</strong> ${viaOptions.staggeredCount}</p>
                    <p><strong>Connection:</strong> Connects L1 to L${layerCounts.copper} through segments</p>
                `;
            } else {
                viaDetails += `
                    <p><strong>Layers:</strong> L${viaOptions.viaStartLayer} to L${viaOptions.viaEndLayer}</p>
                `;
            }
            
            // Add via type specific details
            if (viaOptions.viaType === 'micro') {
                viaDetails += `
                    <p><strong>Technology:</strong> Laser drilled micro via (single layer span)</p>
                `;
            } else if (viaOptions.viaType === 'blind') {
                viaDetails += `
                    <p><strong>Technology:</strong> Partial depth via from outer layer</p>
                `;
            } else if (viaOptions.viaType === 'buried') {
                viaDetails += `
                    <p><strong>Technology:</strong> Internal via (not visible from outside)</p>
                `;
            } else if (viaOptions.viaType === 'staggered') {
                viaDetails += `
                    <p><strong>Technology:</strong> Multiple vias connected with traces</p>
                    <p><strong>Benefits:</strong> Reduced overall aspect ratio, better manufacturability</p>
                `;
            }
            
            detailsHTML += viaDetails;
            
            // Add manufacturability assessment
            let viaAssessment = "";
            
            // Check minimum annular ring (industry standard is typically 0.05mm min)
            // Always check using mm (base unit)
            if (annularRingMm < 0.05) {
                const minRingConverted = formatValueForUnit(convertValue(0.05, 'mm', currentUnit), currentUnit);
                viaAssessment += `<p class="manufacturing-warning">⚠️ Annular ring (${annularRingConverted}${currentUnit}) is below recommended minimum (${minRingConverted}${currentUnit})</p>`;
            }
            
            // Check minimum drill diameter (typically 0.15mm for standard PCBs)
            if (viaOptions.viaDrillDiameter < 0.15) {
                const minDrillConverted = formatValueForUnit(convertValue(0.15, 'mm', currentUnit), currentUnit);
                viaAssessment += `<p class="manufacturing-warning">⚠️ Drill diameter (${drillDiameterConverted}${currentUnit}) is below standard manufacturing minimum (${minDrillConverted}${currentUnit})</p>`;
            }
            
            // Check aspect ratio for manufacturability
            if (aspectRatio > 10) {
                viaAssessment += `<p class="manufacturing-warning">⚠️ Aspect ratio (${aspectRatio.toFixed(2)}:1) exceeds typical manufacturing limit of 10:1</p>`;
            } else if (aspectRatio > 8) {
                viaAssessment += `<p class="manufacturing-note">⚠️ Aspect ratio (${aspectRatio.toFixed(2)}:1) approaching manufacturing limits</p>`;
            }
            
            // Add assessment if there are any warnings
            if (viaAssessment) {
                detailsHTML += `
                    <h3>Manufacturability Assessment</h3>
                    ${viaAssessment}
                `;
            }
        }
        
        stackupDetails.innerHTML = detailsHTML;
        
        // Add styling for warnings
        const styleEl = document.createElement('style');
        styleEl.textContent = `
            .manufacturing-warning {
                color: #d32f2f;
                font-weight: bold;
            }
            .manufacturing-note {
                color: #f57c00;
                font-weight: bold;
            }
            #stackup-details h3 {
                margin-top: 1.5rem;
                font-size: 1.1rem;
                color: #28374c;
                border-bottom: 1px solid #eee;
                padding-bottom: 0.5rem;
            }
        `;
        document.head.appendChild(styleEl);
        
        console.log('[displayStackupDetails] Stackup details generated');
    }
    
    function calculateAspectRatio(stackup, customDrillDiameter) {
        console.log('[calculateAspectRatio] Calculating PCB aspect ratio');
        
        // Use custom drill diameter if provided, otherwise default to 0.3mm
        const minDrillDiameter = customDrillDiameter || 0.3;
        console.log(`[calculateAspectRatio] Using drill diameter: ${minDrillDiameter}mm`);
        
        // Calculate board thickness minus outer layers
        const innerThickness = stackup.reduce((sum, layer) => {
            // Exclude outer layers (silkscreen and solder mask) from calculation
            if (layer.type !== 'silkscreen' && layer.type !== 'solder-mask') {
                return sum + layer.thickness;
            }
            return sum;
        }, 0);
        
        console.log(`[calculateAspectRatio] Inner board thickness (excluding solder mask and silkscreen): ${innerThickness.toFixed(3)}mm`);
        
        // Calculate aspect ratio (thickness / drill diameter)
        const aspectRatio = innerThickness / minDrillDiameter;
        console.log(`[calculateAspectRatio] Aspect ratio: ${aspectRatio.toFixed(2)}:1`);
        
        // Log manufacturability assessment
        if (aspectRatio > 10) {
            console.warn(`[calculateAspectRatio] WARNING: Aspect ratio ${aspectRatio.toFixed(2)}:1 exceeds typical manufacturing limit of 10:1`);
        } else if (aspectRatio > 8) {
            console.warn(`[calculateAspectRatio] CAUTION: Aspect ratio ${aspectRatio.toFixed(2)}:1 approaching manufacturing limits`);
        } else {
            console.log(`[calculateAspectRatio] Aspect ratio ${aspectRatio.toFixed(2)}:1 within standard manufacturing capabilities`);
        }
        
        return aspectRatio;
    }
    
    // Function to show instructions modal
    function showInstructions() {
        // Hardcoded instructions content
        const instructions = `# PCB Stackup Generator - User Instructions

This web-based tool allows you to visualize and generate PCB (Printed Circuit Board) layer stackups with different configurations.

## Getting Started

1. Open the application in your web browser
2. The interface is divided into two main sections:
   - **Controls Panel** (left): Configure your PCB stackup parameters
   - **Stackup Preview** (right): Visualize the stackup layers and view details

## Input Parameters

### Number of Layers
- Select the number of copper layers for your PCB from the dropdown menu
- Options range from 2 to 12 layers (even numbers only)
- Common configurations are:
  - **2 layers**: Simple double-sided boards
  - **4 layers**: Standard complexity boards with ground/power planes
  - **6-12 layers**: Complex boards for high-speed designs

### Board Thickness
- Enter the total desired board thickness in millimeters
- Standard thickness values:
  - **1.6mm**: Most common PCB thickness
  - **0.8mm**: Thin PCBs
  - **2.4mm**: Thicker PCBs for power applications
- Valid range: 0.5mm to 3.2mm

### Copper Weight
- Select the copper weight (thickness) in ounces
- Options:
  - **0.5oz**: Thin copper for fine-pitch components
  - **1oz**: Standard for most applications
  - **2oz**: Heavier copper for power or high-current applications
  - **3oz**: Specialized high-current applications
- Note: The copper weight applies to all copper layers in the stackup

## Generating the Stackup

1. After setting your parameters, click the **Generate Stackup** button
2. The stackup will be calculated and displayed in the preview area
3. The preview shows:
   - Visual representation of all layers with proportional thickness
   - Layer names and types (copper, core, prepreg, etc.)
   - Individual thickness of each layer in millimeters

## Sample Data

- To quickly see a realistic example, click the **Load 4-Layer Sample** button in the bottom right
- This loads a standard 4-layer configuration with typical industrial values
- Use this as a starting point to understand the stackup structure

## Understanding the Results

### Stackup Preview
- Layers are shown from top (silkscreen) to bottom
- Each layer is color-coded by type:
  - **Copper layers**: Bronze/orange
  - **Core layers**: Gray
  - **Prepreg layers**: Light yellow
  - **Solder mask**: Green
  - **Silkscreen**: White

### Stackup Details
Below the visual preview, you'll find important information:

- **Total Board Thickness**: The calculated thickness of all layers combined
- **Copper Layers**: The number of copper layers in the stackup
- **Core Layers**: The number of rigid core layers
- **Prepreg Layers**: The number of prepreg (pre-impregnated) bonding layers
- **Aspect Ratio**: The ratio of board thickness to minimum drill diameter (important for manufacturability)
  - Values below 8:1 are generally easy to manufacture
  - Values between 8:1 and 10:1 may require special processing
  - Values above 10:1 may not be manufacturable by all vendors`;
            
        // Simple markdown to HTML conversion for basic elements
        const html = convertMarkdownToHtml(instructions);
        
        // Set modal content
        modalContent.innerHTML = html;
        
        // Show modal
        instructionsModal.classList.add('show');
        
        console.log('[showInstructions] Instructions modal displayed');
    }
    
    // Function to hide instructions modal
    function hideInstructions() {
        instructionsModal.classList.remove('show');
        console.log('[hideInstructions] Instructions modal hidden');
    }
    
    // Simple markdown to HTML converter for basic elements
    function convertMarkdownToHtml(markdown) {
        let html = '';
        
        // Split by lines
        const lines = markdown.split('\n');
        
        let inList = false;
        
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            
            // Headers
            if (line.startsWith('# ')) {
                html += `<h1>${line.substring(2)}</h1>`;
            } else if (line.startsWith('## ')) {
                html += `<h2>${line.substring(3)}</h2>`;
            } else if (line.startsWith('### ')) {
                html += `<h3>${line.substring(4)}</h3>`;
            } 
            // Lists
            else if (line.startsWith('- ')) {
                if (!inList) {
                    html += '<ul>';
                    inList = true;
                }
                html += `<li>${line.substring(2)}</li>`;
                
                // Check if next line is not a list item
                if (i === lines.length - 1 || !lines[i + 1].startsWith('- ')) {
                    html += '</ul>';
                    inList = false;
                }
            }
            // Numbered Lists
            else if (/^\d+\.\s/.test(line)) {
                if (!inList) {
                    html += '<ol>';
                    inList = true;
                }
                html += `<li>${line.replace(/^\d+\.\s/, '')}</li>`;
                
                // Check if next line is not a list item
                if (i === lines.length - 1 || !/^\d+\.\s/.test(lines[i + 1])) {
                    html += '</ol>';
                    inList = false;
                }
            }
            // Bold text
            else if (line.includes('**')) {
                line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                html += `<p>${line}</p>`;
            }
            // Normal paragraph
            else if (line.trim() !== '') {
                html += `<p>${line}</p>`;
            }
            // Empty line
            else {
                html += '<br>';
            }
        }
        
        return html;
    }
});