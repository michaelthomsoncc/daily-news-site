    const CORRECT = {
      "ep1-1": "Useful energy output ÷ total energy input",
      "ep1-2": "P = I × V",
      "ep1-3": ["Solar", "Wind"],
      "ep1-4": "Energy cannot be created or destroyed — only transferred",
      "ep1-5": "Specific heat capacity (E = m c Δθ)",
      "ep1-6": "Total energy input",
      "ep2-1": "V = I × R",
      "ep2-2": "The same everywhere",
      "ep2-3": ["About 230 V", "Alternating current (AC)", "50 Hz"],
      "ep2-4": "The same across each branch",
      "ep2-5": "P = I × V",
      "ep2-6": "They repel",
      "ep3-1": "Mass ÷ volume",
      "ep3-2": "Far apart with random rapid motion",
      "ep3-3": ["Kinetic energy of particles", "Potential energy of particles"],
      "ep3-4": "E = m c Δθ",
      "ep3-5": "Energy changes state without temperature change (latent heat)",
      "ep3-6": "Collisions of particles with the container walls",
      "ep4-1": "Same number of protons, different number of neutrons",
      "ep4-2": "Stopped by paper or skin",
      "ep4-3": ["Most penetrating", "Least ionising"],
      "ep4-4": "Time for half the radioactive nuclei (or activity) to decay",
      "ep4-5": "A neutron changes into a proton and an electron",
      "ep4-6": "A large nucleus splits into smaller nuclei",
      "ep5-1": "F = m × a",
      "ep5-2": "Acceleration",
      "ep5-3": "Constant velocity (including zero) when forces are balanced",
      "ep5-4": "Thinking distance + braking distance",
      "ep5-5": "Equal in size, opposite in direction, on different objects",
      "ep5-6": "Air resistance (drag) equals weight — no net force",
      "ep6-1": "W = m × g",
      "ep6-2": "p = F ÷ A",
      "ep6-3": "Force × perpendicular distance from pivot",
      "ep6-4": "Total clockwise moments = total anticlockwise moments",
      "ep6-5": "F = k × e (up to the limit of proportionality)",
      "ep6-6": "Lower centre of mass and wider base",
      "ep7-1": "v = f × λ",
      "ep7-2": "Oscillations perpendicular to wave travel direction",
      "ep7-3": ["Microwaves", "Visible light", "Ultraviolet", "Gamma rays"],
      "ep7-4": "Longitudinal",
      "ep7-5": "3.0 × 10⁸ m/s",
      "ep7-6": "Longitudinal",
      "ep8-1": "Sound cannot travel in a vacuum — needs a medium",
      "ep8-2": "Frequencies above 20 000 Hz",
      "ep8-3": "Always virtual, upright, and diminished",
      "ep8-4": "Angle of incidence exceeds the critical angle",
      "ep8-5": "Distance = (speed × time) ÷ 2",
      "ep8-6": "Wavelength increases / shifts towards red",
      "ep9-1": "Fleming's left-hand rule (motor effect)",
      "ep9-2": "Vₚ / Vₛ = Nₚ / Nₛ",
      "ep9-3": "A changing magnetic field through a coil induces a p.d.",
      "ep9-4": "Increases transmission voltage and reduces current — less energy wasted as heat",
      "ep9-5": "Coil of wire around an iron core with current",
      "ep9-6": "Step-up transformers at power stations; step-down near homes",
      "ep10-1": "Orbital period of 24 hours above the equator",
      "ep10-2": ["The astronaut and spacecraft fall together around Earth", "It is continuous free fall"],
      "ep10-3": "The universe is expanding",
      "ep10-4": "V = I × R",
      "ep10-5": "Neutron star or black hole (after a supernova)",
      "ep10-6": "Useful energy output ÷ total energy input"
    };

    const episodes = [
      {
        id: "ep1", num: 1, file: "01-energy.mp3", script: "1-energy.txt",
        title: "Energy",
        desc: "Stores, transfers, efficiency, power, and energy resources.",
        quiz: [
          { id: "ep1-1", type: "single", text: "Efficiency is defined as…", options: ["Useful energy output ÷ total energy input", "Total energy input ÷ useful output", "Useful output − wasted energy", "Useful output × total input"] },
          { id: "ep1-2", type: "single", text: "Electrical power is also written as…", options: ["P = I × V", "P = I ÷ V", "P = V ÷ I", "P = I + V"] },
          { id: "ep1-3", type: "multiple", text: "Which are renewable energy resources? (Select all that apply)", options: ["Solar", "Wind", "Coal", "Natural gas"] },
          { id: "ep1-4", type: "single", text: "The law of conservation of energy means…", options: ["Energy cannot be created or destroyed — only transferred", "Energy is always lost completely", "Only thermal energy is conserved", "Energy is created in power stations"] },
          { id: "ep1-5", type: "single", text: "E = m c Δθ involves…", options: ["Specific heat capacity (E = m c Δθ)", "Latent heat of fusion only", "Electrical power", "Density"] },
          { id: "ep1-6", type: "single", text: "On a Sankey diagram, useful plus wasted energy equals…", options: ["Total energy input", "Useful output only", "Wasted energy only", "Zero"] }
        ]
      },
      {
        id: "ep2", num: 2, file: "02-electricity.mp3", script: "2-electricity.txt",
        title: "Electricity",
        desc: "Current, voltage, resistance, circuits, and mains electricity.",
        quiz: [
          { id: "ep2-1", type: "single", text: "Ohm's law is…", options: ["V = I × R", "V = I ÷ R", "V = I + R", "V = R ÷ I"] },
          { id: "ep2-2", type: "single", text: "In a series circuit, the current is…", options: ["The same everywhere", "Split between components", "Zero at the battery", "Different in each wire colour"] },
          { id: "ep2-3", type: "multiple", text: "UK mains electricity is… (Select all that apply)", options: ["About 230 V", "Alternating current (AC)", "50 Hz", "12 V direct current only"] },
          { id: "ep2-4", type: "single", text: "In a parallel circuit, the potential difference across each branch is…", options: ["The same across each branch", "Shared equally as fractions", "Always zero", "Added to give supply voltage"] },
          { id: "ep2-5", type: "single", text: "Power in an electrical circuit can be calculated with…", options: ["P = I × V", "P = I ÷ V", "P = V − I", "P = R × I only with no V"] },
          { id: "ep2-6", type: "single", text: "Two like electric charges…", options: ["They repel", "They attract", "Have no effect", "Cancel to zero charge always"] }
        ]
      },
      {
        id: "ep3", num: 3, file: "03-particle-model.mp3", script: "3-particle-model.txt",
        title: "Particle Model",
        desc: "Density, states of matter, specific heat, and gas pressure.",
        quiz: [
          { id: "ep3-1", type: "single", text: "Density is calculated as…", options: ["Mass ÷ volume", "Volume ÷ mass", "Mass × volume", "Mass + volume"] },
          { id: "ep3-2", type: "single", text: "Gas particles are best described as…", options: ["Far apart with random rapid motion", "Fixed in a lattice vibrating only", "Touching in rows sliding past", "Stationary with no kinetic energy"] },
          { id: "ep3-3", type: "multiple", text: "Internal energy is the sum of… (Select all that apply)", options: ["Kinetic energy of particles", "Potential energy of particles", "Only chemical bond energy in fuels", "Only gravitational energy"] },
          { id: "ep3-4", type: "single", text: "The equation E = m c Δθ is used for…", options: ["E = m c Δθ", "Latent heat with no temperature change", "Wave speed", "Electrical resistance"] },
          { id: "ep3-5", type: "single", text: "During a change of state at constant temperature…", options: ["Energy changes state without temperature change (latent heat)", "Temperature always rises quickly", "No energy is transferred", "Density always halves"] },
          { id: "ep3-6", type: "single", text: "Gas pressure is caused by…", options: ["Collisions of particles with the container walls", "Gravity pulling particles to the base only", "Magnetic fields in the gas", "Particles expanding in size"] }
        ]
      },
      {
        id: "ep4", num: 4, file: "04-atomic-radioactivity.mp3", script: "4-atomic-radioactivity.txt",
        title: "Atomic Structure & Radioactivity",
        desc: "Isotopes, radiation types, half-life, and nuclear changes.",
        quiz: [
          { id: "ep4-1", type: "single", text: "Isotopes of an element have…", options: ["Same number of protons, different number of neutrons", "Same number of neutrons, different protons", "No electrons", "Identical mass numbers always"] },
          { id: "ep4-2", type: "single", text: "Alpha radiation is stopped by…", options: ["Stopped by paper or skin", "Stopped only by thick lead", "Stopped by air only — never solids", "Nothing — infinite penetration"] },
          { id: "ep4-3", type: "multiple", text: "Gamma radiation is… (Select all that apply)", options: ["Most penetrating", "Least ionising", "A helium nucleus", "Stopped easily by paper"] },
          { id: "ep4-4", type: "single", text: "Half-life is…", options: ["Time for half the radioactive nuclei (or activity) to decay", "Half the time for all nuclei to decay", "Twice the decay constant", "The age of a radioactive sample"] },
          { id: "ep4-5", type: "single", text: "Beta-minus decay involves…", options: ["A neutron changes into a proton and an electron", "A proton becomes two neutrons", "Emission of a helium nucleus", "Only gamma emission"] },
          { id: "ep4-6", type: "single", text: "Nuclear fission is when…", options: ["A large nucleus splits into smaller nuclei", "Small nuclei fuse into a larger nucleus", "Electrons are shared between atoms", "An atom gains one neutron only"] }
        ]
      },
      {
        id: "ep5", num: 5, file: "05-forces-motion.mp3", script: "5-forces-motion.txt",
        title: "Forces & Motion",
        desc: "Speed, acceleration, Newton's laws, graphs, and stopping.",
        quiz: [
          { id: "ep5-1", type: "single", text: "Newton's second law is…", options: ["F = m × a", "F = m ÷ a", "F = m + a", "F = a ÷ m only when at rest"] },
          { id: "ep5-2", type: "single", text: "On a velocity–time graph, the gradient represents…", options: ["Acceleration", "Distance travelled", "Speed only with no direction", "Mass of the object"] },
          { id: "ep5-3", type: "single", text: "Newton's first law says an object continues at…", options: ["Constant velocity (including zero) when forces are balanced", "Always accelerating", "Rest only — never steady motion", "Maximum speed always"] },
          { id: "ep5-4", type: "single", text: "Stopping distance equals…", options: ["Thinking distance + braking distance", "Braking distance only", "Thinking distance only", "Reaction time × mass"] },
          { id: "ep5-5", type: "single", text: "Newton's third law pairs are…", options: ["Equal in size, opposite in direction, on different objects", "Unequal forces on the same object", "Only for contact forces", "Only when objects are stationary"] },
          { id: "ep5-6", type: "single", text: "Terminal velocity is reached when…", options: ["Air resistance (drag) equals weight — no net force", "Weight becomes zero", "Driving force is maximum", "Friction is removed completely"] }
        ]
      },
      {
        id: "ep6", num: 6, file: "06-forces-pressure.mp3", script: "6-forces-pressure.txt",
        title: "Weight, Pressure & Moments",
        desc: "Weight, pressure, moments, springs, and stability.",
        quiz: [
          { id: "ep6-1", type: "single", text: "Weight is calculated as…", options: ["W = m × g", "W = m ÷ g", "W = m + g", "W = g only"] },
          { id: "ep6-2", type: "single", text: "Pressure is…", options: ["p = F ÷ A", "p = F × A", "p = A ÷ F", "p = F + A"] },
          { id: "ep6-3", type: "single", text: "Moment of a force = …", options: ["Force × perpendicular distance from pivot", "Force ÷ distance", "Mass × acceleration only", "Pressure × area"] },
          { id: "ep6-4", type: "single", text: "A body in equilibrium on a pivot has…", options: ["Total clockwise moments = total anticlockwise moments", "No forces acting", "Only weight acting", "Moments always zero without mass"] },
          { id: "ep6-5", type: "single", text: "Hooke's law states (within elastic limit)…", options: ["F = k × e (up to the limit of proportionality)", "F is independent of extension", "Extension is always permanent", "k decreases as extension increases linearly forever"] },
          { id: "ep6-6", type: "single", text: "An object is more stable when it has…", options: ["Lower centre of mass and wider base", "Higher centre of mass and narrow base", "No friction", "Maximum top-heavy mass"] }
        ]
      },
      {
        id: "ep7", num: 7, file: "07-waves.mp3", script: "7-waves.txt",
        title: "Waves",
        desc: "Wave properties, EM spectrum, and seismic waves.",
        quiz: [
          { id: "ep7-1", type: "single", text: "The wave equation is…", options: ["v = f × λ", "v = f ÷ λ", "v = λ ÷ f only", "v = f + λ"] },
          { id: "ep7-2", type: "single", text: "A transverse wave has oscillations…", options: ["Oscillations perpendicular to wave travel direction", "Parallel to wave travel direction", "With no amplitude", "Only in solids never fluids"] },
          { id: "ep7-3", type: "multiple", text: "Which are electromagnetic waves? (Select all that apply)", options: ["Microwaves", "Visible light", "Ultraviolet", "Sound waves", "Water ripples on a pond", "Gamma rays"] },
          { id: "ep7-4", type: "single", text: "Sound waves are…", options: ["Longitudinal", "Transverse", "Electromagnetic", "Only visible light"] },
          { id: "ep7-5", type: "single", text: "All EM waves travel in a vacuum at…", options: ["3.0 × 10⁸ m/s", "340 m/s", "3.0 × 10⁶ m/s", "Speed depends on frequency in vacuum"] },
          { id: "ep7-6", type: "single", text: "P-waves (primary seismic waves) are…", options: ["Longitudinal", "Transverse only", "Surface waves only", "Electromagnetic"] }
        ]
      },
      {
        id: "ep8", num: 8, file: "08-light-sound.mp3", script: "8-light-sound.txt",
        title: "Light & Sound",
        desc: "Lenses, reflection, refraction, sound, and red shift.",
        quiz: [
          { id: "ep8-1", type: "single", text: "Sound cannot travel through…", options: ["Sound cannot travel in a vacuum — needs a medium", "Water only", "Solids only", "Air but travels in vacuum"] },
          { id: "ep8-2", type: "single", text: "Ultrasound is defined as sound with…", options: ["Frequencies above 20 000 Hz", "Frequencies below 20 Hz", "No frequency — only amplitude", "Exactly 440 Hz"] },
          { id: "ep8-3", type: "single", text: "A diverging lens always produces an image that is…", options: ["Always virtual, upright, and diminished", "Real and inverted", "Always magnified", "On the opposite side always real"] },
          { id: "ep8-4", type: "single", text: "Total internal reflection happens when…", options: ["Angle of incidence exceeds the critical angle", "Light enters a denser medium at any angle", "Light is absorbed completely", "Angle equals zero only"] },
          { id: "ep8-5", type: "single", text: "To find distance from an echo use…", options: ["Distance = (speed × time) ÷ 2", "Distance = speed × time with no division", "Distance = time ÷ speed", "Distance = speed + time"] },
          { id: "ep8-6", type: "single", text: "Red shift from distant galaxies indicates…", options: ["Wavelength increases / shifts towards red", "Galaxies are moving closer", "Light slows below c in space", "Universe is contracting"] }
        ]
      },
      {
        id: "ep9", num: 9, file: "09-magnetism.mp3", script: "9-magnetism.txt",
        title: "Magnetism & Electromagnetism",
        desc: "Motors, generators, transformers, and the national grid.",
        quiz: [
          { id: "ep9-1", type: "single", text: "The force on a current-carrying wire in a magnetic field uses…", options: ["Fleming's left-hand rule (motor effect)", "Fleming's right-hand rule for motors", "Ohm's law only", "Hooke's law"] },
          { id: "ep9-2", type: "single", text: "For an ideal transformer…", options: ["Vₚ / Vₛ = Nₚ / Nₛ", "Vₚ = Nₚ only with no secondary", "Power always doubles", "Current is the same in both coils"] },
          { id: "ep9-3", type: "single", text: "Electromagnetic induction occurs when…", options: ["A changing magnetic field through a coil induces a p.d.", "A constant field always induces maximum current", "Only permanent magnets without coils", "Only when wire is stationary"] },
          { id: "ep9-4", type: "single", text: "High-voltage transmission on the national grid helps because…", options: ["Increases transmission voltage and reduces current — less energy wasted as heat", "Increases current in cables", "Removes the need for transformers", "Makes resistance zero in cables"] },
          { id: "ep9-5", type: "single", text: "An electromagnet is typically…", options: ["Coil of wire around an iron core with current", "A permanent bar magnet only", "A battery with no coil", "An uncharged metal rod"] },
          { id: "ep9-6", type: "single", text: "On the national grid, step-up transformers are used…", options: ["Step-up transformers at power stations; step-down near homes", "Only in homes before appliances", "Only underground with no overhead lines", "To reduce voltage for long cables"] }
        ]
      },
      {
        id: "ep10", num: 10, file: "10-space-mixed.mp3", script: "10-space-mixed.txt",
        title: "Space & Mixed Recall",
        desc: "Orbits, stars, red shift, and rapid cross-topic recall.",
        quiz: [
          { id: "ep10-1", type: "single", text: "A geostationary satellite has…", options: ["Orbital period of 24 hours above the equator", "Period of one hour over the poles", "No orbit — fixed above London only", "Same speed as the Moon"] },
          { id: "ep10-2", type: "multiple", text: "Weightlessness in orbit is because… (Select all that apply)", options: ["The astronaut and spacecraft fall together around Earth", "It is continuous free fall", "Gravity is zero everywhere in space", "There is no mass in orbit"] },
          { id: "ep10-3", type: "single", text: "Red shift of light from distant galaxies supports…", options: ["The universe is expanding", "Stars are getting hotter only", "Earth is the centre of the universe", "Light travels slower over cosmic distances"] },
          { id: "ep10-4", type: "single", text: "Ohm's law (mixed recall) is…", options: ["V = I × R", "V = I ÷ R", "P = m × a", "v = f × λ"] },
          { id: "ep10-5", type: "single", text: "A very massive star may end as a…", options: ["Neutron star or black hole (after a supernova)", "White dwarf only always", "Planet", "Stable main-sequence star forever"] },
          { id: "ep10-6", type: "single", text: "Efficiency (mixed recall) equals…", options: ["Useful energy output ÷ total energy input", "Total input × useful output", "Wasted energy only", "Useful output + wasted energy"] }
        ]
      }
    ];