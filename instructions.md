# PCB Stackup Generator - User Instructions

This web-based tool allows you to visualize and generate PCB (Printed Circuit Board) layer stackups with different configurations.

## Getting Started

1. Open `index.html` in your web browser to launch the application.
2. The interface is divided into two main sections:
   - **Controls Panel** (left): Configure your PCB stackup parameters
   - **Stackup Preview** (right): Visualize the stackup layers and view details
3. In the header, you can select your preferred measurement unit (mm, μm, or mils)

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
  - Values above 10:1 may not be manufacturable by all vendors

## Understanding PCB Stackup Structure

For multi-layer PCBs, the typical stack consists of:

1. **Top Silkscreen**: Printed labels and markings
2. **Top Solder Mask**: Insulating layer with openings for component pads
3. **Top Copper (L1)**: Signal or component layer
4. **Prepreg**: Bonding material
5. **Inner Copper Layers**: Signal or plane layers
6. **Core**: Rigid insulating material with copper on one or both sides
7. **Additional prepreg and copper layers** (for boards with more than 4 layers)
8. **Bottom Copper**: Signal or component layer
9. **Bottom Solder Mask**: Insulating layer with openings for component pads
10. **Bottom Silkscreen**: Printed labels and markings

## Common Issues

1. **Unrealistic Thickness**: If the total board thickness is too small for the number of layers, the visualization may show disproportionate layer thicknesses.

2. **Aspect Ratio Warnings**: The console will display warnings if the aspect ratio exceeds manufacturing capabilities.

3. **Visualization Scale**: Very thin layers (like solder mask) are shown with a minimum height to make them visible, even though they represent a small percentage of the actual board thickness.

## Unit System

The application supports three unit systems for measurements:

### Millimeters (mm)
- Default unit for PCB industry in most regions
- Used for all dimensions when selected
- Provides precision to 0.001mm

### Micrometers (μm)
- Useful for very detailed work
- 1 μm = 0.001 mm
- Provides whole number precision (no decimal points)

### Mils (1/1000 inch)
- Common in US PCB manufacturing
- 1 mil = 0.0254 mm
- Provides precision to 0.01 mils

### Changing Units
1. Use the dropdown menu in the top-right corner to select your preferred unit
2. All input fields and measurements will automatically update to the selected unit
3. The system preserves the actual values when converting between units
4. Input min/max ranges and step values automatically adjust based on the selected unit

## Browser Compatibility

This application works best in modern browsers like:
- Chrome
- Firefox
- Safari
- Edge

If you encounter any visualization issues, try:
1. Refreshing the page
2. Clearing browser cache
3. Trying a different browser