// Sample PCB Stackup Data for Testing
// 4-layer standard PCB with 1.6mm thickness and 1oz copper

const sampleStackupData = {
  // Board specifications
  name: "Standard 4-Layer PCB",
  totalThickness: 1.6, // mm
  copperWeight: "1", // oz
  layerCount: 4,
  
  // Material properties
  materials: {
    // Copper thickness (mm per oz)
    copper: {
      '0.5': 0.017,
      '1': 0.035,
      '2': 0.07,
      '3': 0.105
    },
    // FR4 properties
    fr4: {
      dielectricConstant: 4.5,
      lossTangent: 0.02
    },
    // Solder mask properties
    solderMask: {
      thickness: 0.015, // mm
      color: "green",
      dielectricConstant: 3.8
    },
    // Silkscreen properties
    silkscreen: {
      thickness: 0.01, // mm
      color: "white"
    }
  },
  
  // Detailed layer stack
  layers: [
    {
      type: "silkscreen",
      name: "Top Silkscreen",
      thickness: 0.01,
      material: "epoxy ink",
      color: "white"
    },
    {
      type: "solder-mask",
      name: "Top Solder Mask",
      thickness: 0.015,
      material: "epoxy",
      color: "green"
    },
    {
      type: "copper",
      name: "Top Copper (L1)",
      thickness: 0.035,
      material: "copper",
      function: "signal",
      plating: false,
      impedance: {
        controlledImpedance: true,
        targetImpedance: 50, // ohms
        tolerance: 10 // percent
      }
    },
    {
      type: "prepreg",
      name: "Prepreg",
      thickness: 0.2,
      material: "FR4",
      dielectricConstant: 4.5,
      designation: "2116"
    },
    {
      type: "copper",
      name: "Inner Layer 1 (L2)",
      thickness: 0.035,
      material: "copper",
      function: "ground plane",
      plating: false
    },
    {
      type: "core",
      name: "Core",
      thickness: 1.0,
      material: "FR4",
      dielectricConstant: 4.5,
      designation: "Standard TG 140"
    },
    {
      type: "copper",
      name: "Inner Layer 2 (L3)",
      thickness: 0.035,
      material: "copper",
      function: "power plane",
      plating: false
    },
    {
      type: "prepreg",
      name: "Prepreg",
      thickness: 0.2,
      material: "FR4",
      dielectricConstant: 4.5,
      designation: "2116"
    },
    {
      type: "copper",
      name: "Bottom Copper (L4)",
      thickness: 0.035,
      material: "copper",
      function: "signal",
      plating: false,
      impedance: {
        controlledImpedance: true,
        targetImpedance: 50, // ohms
        tolerance: 10 // percent
      }
    },
    {
      type: "solder-mask",
      name: "Bottom Solder Mask",
      thickness: 0.015,
      material: "epoxy",
      color: "green"
    },
    {
      type: "silkscreen",
      name: "Bottom Silkscreen",
      thickness: 0.01,
      material: "epoxy ink",
      color: "white"
    }
  ],
  
  // Manufacturing specifications
  manufacturingSpecs: {
    minTraceWidth: 0.15, // mm
    minTraceSpacing: 0.15, // mm
    minDrillDiameter: 0.3, // mm
    aspectRatio: 5.33, // thickness/drill diameter
    viaCappingRequired: false,
    finishType: "ENIG", // Electroless Nickel Immersion Gold
    ipcClass: "Class 2", // IPC-6012 Class
    impedanceControlled: true,
    impedanceTolerance: "±10%"
  },
  
  // Electrical specifications
  electricalSpecs: {
    signalIntegrity: {
      maxSignalSpeed: 1, // GHz
      maxClockFrequency: 100, // MHz
      requiresImpedanceControl: true
    },
    power: {
      voltages: [3.3, 5.0], // V
      groundNets: ["GND"],
      powerNets: ["3.3V", "5V"]
    }
  }
};

// Example of how to use this data
function loadSampleStackup() {
  // This function could be used to load the sample data into the UI
  console.log("Loading sample 4-layer PCB stackup data...");
  console.log(`Total thickness: ${sampleStackupData.totalThickness}mm`);
  console.log(`Layer count: ${sampleStackupData.layerCount}`);
  
  // Return the stackup data for use in the application
  return sampleStackupData;
}

// Export the sample data and utility function
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    sampleStackupData,
    loadSampleStackup
  };
}