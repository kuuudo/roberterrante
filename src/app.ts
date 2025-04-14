import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import Stats from 'three/addons/libs/stats.module.js';
import { gsap } from "gsap";
import { Howl } from 'howler';

// Interfaces for type safety
interface ModalContent {
  [key: string]: {
    title: string;
    content: string | string[];
    link?: string;
  };
}

// App configuration
export function initApp(isMobile: boolean) {
  console.log(`Initializing app for ${isMobile ? 'mobile' : 'desktop'} device`);
  
  // Setup Renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  document.body.appendChild(renderer.domElement);

  // Scene Setup
  const scene = new THREE.Scene();
  new RGBELoader().load('img/venice_sunset_1k.hdr', function (texture) {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;
    scene.background = texture;
    scene.backgroundBlurriness = 1.0;
  });

  // Camera & Controls - adjusted for device type
  const camera = new THREE.PerspectiveCamera(
    isMobile ? 85 : 75, // Wider FOV for mobile
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.set(-2, 1, 2);
  
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(-1, 2, 0);
  controls.update();
  controls.enabled = !isMobile; // Disabled for mobile, enabled for desktop

  // Lighting
  const light = new THREE.DirectionalLight(0xffffff, 2);
  light.position.set(2, 5, 10);
  light.castShadow = true;
  scene.add(light);
  scene.add(new THREE.AmbientLight(0xffffff, 0.1));

  // Floor
  const floorGeometry = new THREE.PlaneGeometry(25, 20);
  const floorMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
  const floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
  floorMesh.rotation.x = -Math.PI / 2;
  floorMesh.receiveShadow = true;
  scene.add(floorMesh);

  // Character movement variables
  let character: THREE.Object3D | null = null;
  let moveForward = false;
  let moveBackward = false;
  let moveLeft = false;
  let moveRight = false;
  let characterSpeed = 0.05;
  
  // Mobile controls handler
  let mobileControlsHandler: any;
  
  // Window resize listener
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // GLTF Model Loader
  const gltfLoader = new GLTFLoader();
  
  // Load the maze model
  gltfLoader.load('./models/Robert/2_Robert\'s_Maze_Portfolio.glb', (gltf) => {
    gltf.scene.position.set(0, 0, 0);
    scene.add(gltf.scene);
  });

  // Load the wall model
  gltfLoader.load('./models/Robert/wall.glb', (gltf) => {
    gltf.scene.position.set(0, 0, 0);
    scene.add(gltf.scene);
    console.log("Wall loaded successfully");
  });

  // Load the character model
  gltfLoader.load('./models/Robert/main character.glb', (gltf) => {
    character = gltf.scene;
    character.position.set(-0.7, 0, 0);
    scene.add(character);
    console.log("Character loaded successfully");
   
    // Optional: Add a box helper to visualize character's bounding box
    const box = new THREE.Box3().setFromObject(character);
    const helper = new THREE.Box3Helper(box, 0xffff00);
    scene.add(helper);
    
    // Initialize mobile controls if on mobile
    if (isMobile) {
      setupMobileControls();
    }
  });

  // Modal content
  const modalContent: ModalContent = {
    "(Export) Monster": {
      title: "My Nightmare Story ",
      content:
        "Growing up, Halloween  was my favorite time of year. I'd eat my weight in candy, stuffing my face with chocolate and sweets without a second thought. But when the costumes were packed away, cheese became my next addiction--pizza , grilled cheese, and every dairy-loaded snack I could find. Sugar wasn't just a treat; it was my comfort. Cheese was my escape from stress , sadness, and insecurity. I constantly battled allergies, asthma, and bronchitis, never realizing my diet was making it worse. By my 40s, my body was in crisis. Heart disease, cluster headaches, kidney stones, arthritis, acid reflux—even early cancer cells. I was exhausted, in pain, and trapped in a cycle of medications that only masked the symptoms. Doctors told me it was just part of aging, but deep down, I knew there had to be another way."
    },
   
    "(Export) Robert": {
      title: "Welcome to the Maze Adventure! ",
      content:
       "Welcome, adventurer! You're about to embark on a journey that will not only challenge your mind but also reveal a powerful secret about transforming your health. Your mission: Find the hidden book within this maze to unlock your prize and discover the secret to feeling healthier and more energized! Along the way, you'll learn about my journey. Struggling with heart disease, low energy, and aging too fast? I've been there. The answer? A lifestyle focused on whole foods, movement, love, stress reduction, and quality sleep. Ready to start? Follow the maze and uncover the secrets!"
      },
   
    "(Export) Mystical book": {
      title: "Mystical book: The Sweet Treasure Waiting for You on Your Journey",
      content:
        "Congratulations, adventurer! You've made it this far, and I have something special for you—a book I wrote just for you! This isn't just any book. It's your map to a healthier, happier body. Inside, you'll discover the secrets of healthy sugar alternatives—ways to satisfy your sweet tooth without harming your body. You'll learn how to fuel yourself with energy, feel amazing, and enjoy delicious, guilt-free sweetness! Thank you for being part of this journey! But this adventure is far from over—there's just one more step to take! Click the link to claim your special prize and continue on your journey to better health!",
      link: "https://docs.google.com/document/d/18UhaFmIamdZFhgUhJDOrPKwlfrxcwnJa/edit?usp=sharing&ouid=118031045054104823716&rtpof=true&sd=true"
    },
   
    // Include all the other modal contents from your files...
    "(Export) Unique Mechanism": {
      title: "My Unique Mechanism ",
      content:
      [
        "This isn't about generic diets or one-size-fits-all plans. It's a personalized journey designed to meet your body's needs. Unlike rigid routines, we simplify the process so you can focus on real results—I do the heavy lifting for you!",
        "I've struggled with heart disease, weight gain, and failed solutions. But I discovered the real answer—a smart, holistic approach that makes success inevitable. Now, I'm sharing it with you!",
        "Day 1-3: Gut bacteria start rebalancing for healing.",
        "Day 10: Leaky gut heals, improving digestion and well-being.",
        "Day 12: Energy surges as your body becomes more efficient.",
        "Week 2: Plaque starts clearing, naturally stabilizing blood pressure.",
        "Week 3: Brain fog lifts, restoring clarity and focus.",
        "Week 4: You could lose 20+ lbs, showing deep internal healing.",
        "Your transformation starts NOW! Are you ready?"
      ]
    },
   
    "(Export) broken heart why people fail": {
      title: "Why Nothing Has Worked for You",
      content:
        "Are you tired of struggling with your health and feeling like nothing works? Chances are, you've tried diet plans, workouts, or treatments that promised change but ended up failing you. You've spent time, energy, and hope on solutions that didn't deliver—and you're left wondering if anything will ever truly work. Trust me, I've been there. But here's the truth: The reason those past solutions didn't work is because they were the wrong approach from the start. They weren't tailored to your body's unique needs 🧬. They followed cookie-cutter plans that didn't respect your personal journey"
    },
   
    "(Export) tv VSL": {
      title: "VSL",
      content:
        "Inside This Video, You'll Discover: The truth about restoring your health—without fad diets or extreme restrictions. How I helped myself, my mother, and countless others overcome chronic illness. A simple, step-by-step approach that transforms your body from the inside out! Watch Now & Take Control of Your Health! Here's What Happens When You Commit to This Process. Day 3: Gut bacteria begin to rebalance. Day 10: Leaky gut starts to heal, improving digestion. Day 12: Energy surges. Week 2: Early-stage plaque begins to clear naturally. Week 3: Brain fog lifts, restoring mental clarity. Week 4: 20+ lbs lost—reflecting deep, lasting healing! This isn't just another program—it's a proven holistic system based on science and real results! Click Below & Watch the Video Now!",
      link: "https://youtu.be/oQy4yBqAmAs"
    },
   
    "(Export)healing stick transformation": {
      title: "My Journey to Health and Transformation",
      content:
        "At 52, I made the hardest but most important decision of my life—I cut out refined sugar and dairy completely. At first, I had no idea what to eat or how to start. I struggled with cravings, social pressure, and years of bad habits. But I was determined to take back my health. By switching to a plant-based, whole-food lifestyle, everything changed. Chronic illnesses disappeared one by one. My energy skyrocketed, my mind felt clear, and I finally felt alive again. Today, I no longer suffer from any of the diseases that once controlled my life. The Secret? It wasn't just about cutting out sugar and dairy—it was about adopting a lifestyle built on movement, love, stress reduction, and quality sleep. These five pillars transformed my health."
    },
   
    "(Export) NPC CASE STUDY": {
      title: "Case Studies: Proof That This Works!",
      content:
        "From chronic pain to vibrant health—no more meds, just energy & mobility! Goodbye acid reflux & digestive issues—better gut, better life! Aging in reverse—wake up refreshed, pain-free & full of life! Click the link to see case studies!",
      link: "https://youtu.be/rCugn_YhSVQ"
    },
   
    "(Export)Free Gift": {
      title: "Free Gift",
      content:
        "I'm giving you FREE access to my 3-day Health Coaching workshop! Live Q&A. Get your health questions answered in real time! Personalized Guidance. FREE consultations to help you start your journey! Health & Wellness Education. Learn how to heal your body naturally! This is your chance to connect with me LIVE, ask your biggest health concerns, and get expert advice—for FREE! Mark Your Calendar & Join Me This Friday at 9 PM EST!",
        link: "https://calendly.com/centenarianlifestylerob"
    },
   
    "(Export) Next Step": {
      title: "NEXT STEP: BOOK A CONSULTATION!",
      content:
        "This system reveals the truth behind restoring your body, proven by holistic experts and real results! No more relying on expensive medications or dealing with frustrating side effects. It's time for a real solution that works for YOU. Are you ready to take control of your health? Book a call with me today and let's start your transformation! Your adventure begins now—good luck, and let's make it happen!",
      link: "https://calendly.com/centenarianlifestylerob"
    }
  };

  // Create a mapping between text elements and their parent export objects
  const textToExportMapping = {
    // "(Export) Wall" mapping
    "Plane001_2": "(Export) Wall",
   
    // "(Export) Robert" mapping
    "Text168": "(Export) Robert",
    "Text165": "(Export) Robert",
    "Text164": "(Export) Robert",
    "Text169": "(Export) Robert",
    "Text069": "(Export) Robert",
    "Text055": "(Export) Robert",
   
    // All the other text mappings...
    // "(Export) The Problem" mapping
    "Text388": "(Export) The Problem",
    "Text396": "(Export) The Problem",
   
    // "(Export) Monster" mapping
    "Text187": "(Export) Monster",
    "Text185": "(Export) Monster",
    "Text186": "(Export) Monster",
    "Text183": "(Export) Monster",
    "Text182": "(Export) Monster",
    "Text206": "(Export) Monster",
    "Text216": "(Export) Monster",
    "Text215": "(Export) Monster",
    "Text197": "(Export) Monster",
    "Text188": "(Export) Monster",
    "Plane001_68": "(Export) Monster",
   
    // "(Export)healing stick transformation" mapping
    "Text286": "(Export)healing stick transformation",
    "Text302": "(Export)healing stick transformation",
    "Text289": "(Export)healing stick transformation",
   
    // "(Export) tv VSL" mapping
    "Text537": "(Export) tv VSL",
    "Text536": "(Export) tv VSL",
    "Text534": "(Export) tv VSL",
   
    // "(Export) NPC CASE STUDY" mapping
    "Text415": "(Export) NPC CASE STUDY",
    "Text427": "(Export) NPC CASE STUDY",
    "Text414": "(Export) NPC CASE STUDY",
    "Text420": "(Export) NPC CASE STUDY",
    "Text419": "(Export) NPC CASE STUDY",
    "Text416": "(Export) NPC CASE STUDY",
    "Text429": "(Export) NPC CASE STUDY",
    "Text433": "(Export) NPC CASE STUDY",
   
    // "(Export)Free Gift" mapping
    "Text449": "(Export)Free Gift",
    "Text453": "(Export)Free Gift",
    "Text447": "(Export)Free Gift",
   
    // "(Export)Go find my Book" mapping
    "Text364": "(Export)Go find my Book",
    "Text368": "(Export)Go find my Book",
    "Text367": "(Export)Go find my Book",
    "Text372": "(Export)Go find my Book",
   
    // "(Export) broken heart why people fail" mapping
    "Text507": "(Export) broken heart why people fail",
    "Text521": "(Export) broken heart why people fail",
    "Text508": "(Export) broken heart why people fail",
    
    // "(Export) Unique Mechanism" mapping
    "Text322": "(Export) Unique Mechanism",
    "Text323": "(Export) Unique Mechanism",
    "Text310": "(Export) Unique Mechanism",
   
    // "(Export) Mystical book" mapping
    "Text459": "(Export) Mystical book",
    "Text458": "(Export) Mystical book",
    "Text455": "(Export) Mystical book",
   
    // "(Export) Next Step" mapping
    "Text357": "(Export) Next Step",
    "Text359": "(Export) Next Step",
    "Text354": "(Export) Next Step",
    "Text351": "(Export) Next Step",
    "Text349": "(Export) Next Step",
    "Text355": "(Export) Next Step"
  };

  // Variable to track modal state
  let isModalOpen = false;
  const modal = document.querySelector(".modal");
  const modalbgOverlay = document.querySelector(".modal-bg-overlay");
  const modalTitle = document.querySelector(".modal-title");
  const modalProjectDescription = document.querySelector(".modal-project-description");
  const modalExitButton = document.querySelector(".modal-exit-button");
  const modalVisitProjectButton = document.querySelector(".modal-project-visit-button");
  
  // Add event listeners for modal
  if (modalExitButton) {
    modalExitButton.addEventListener('click', hideModal);
  }
  if (modalbgOverlay) {
    modalbgOverlay.addEventListener('click', hideModal);
  }

  // Setup UI based on device type
  setupUI(isMobile);

  // Our Intersecting objects
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let intersectObject = "";

  // Show modal function
  function showModal(id: string) {
    const content = modalContent[id];
    if (content) {
      if (modalTitle) {
        modalTitle.textContent = content.title;
      }
      if (modalProjectDescription) {
        modalProjectDescription.textContent = Array.isArray(content.content) 
          ? content.content.join(' ') 
          : content.content;
      }
      if (content.link) {
        (modalVisitProjectButton as HTMLAnchorElement).href = content.link;
        if (modalVisitProjectButton) {
          modalVisitProjectButton.classList.remove("hidden");
        }
      } else {
        if (modalVisitProjectButton) {
          modalVisitProjectButton.classList.add("hidden");
        }
      }
      if (modal) {
        modal.classList.remove("hidden");
      }
      if (modalbgOverlay) {
        modalbgOverlay.classList.remove("hidden");
      }
      isModalOpen = true;
    }
  }

  // Hide modal function
  function hideModal() {
    isModalOpen = false;
    if (modal) {
      modal.classList.add("hidden");
    }
    if (modalbgOverlay) {
      modalbgOverlay.classList.add("hidden");
    }
    console.log("Modal hidden");
  }

  // Jump animation function
  function triggerJump() {
    if (character && character.position.y <= 0.1) { // Ensure character is on the ground
      const jumpHeight = 0.5; // Adjust jump height as needed
      gsap.to(character.position, {
        y: jumpHeight,
        duration: 0.2,
        yoyo: true,
        repeat: 1,
        ease: "power1.out"
      });
    }
  }

  // Handle key down events for desktop
  function onKeyDown(event: KeyboardEvent) {
    const movementSound = new Howl({
      src: ["models/Robert/sfx/jumpsfx.ogg"],
      volume: 1
    });

    switch (event.code) {
      case 'KeyW':
        moveForward = true;
        if (character) {
          character.position.z -= characterSpeed; // Move forward
          movementSound.play(); // Play sound effect
        }
        triggerJump(); // Trigger jump
        break;
      case 'KeyS':
        moveBackward = true;
        if (character) {
          character.position.z += characterSpeed; // Move backward
          movementSound.play(); // Play sound effect
        }
        triggerJump(); // Trigger jump
        break;
      case 'KeyA':
        moveLeft = true;
        if (character) {
          character.position.x -= characterSpeed; // Move left
          movementSound.play(); // Play sound effect
        }
        triggerJump(); // Trigger jump
        break;
      case 'KeyD':
        moveRight = true;
        if (character) {
          character.position.x += characterSpeed; // Move right
          movementSound.play(); // Play sound effect
        }
        triggerJump(); // Trigger jump
        break;
      case 'KeyQ': // Rotate left 90 degrees
        if (character) {
          character.rotation.y += Math.PI / 2; // Rotate around Y-axis
          movementSound.play(); // Play sound effect
          triggerJump(); // Trigger jump
        }
        break;
      case 'KeyE': // Rotate right 90 degrees
        if (character) {
          character.rotation.y -= Math.PI / 2; // Rotate around Y-axis
          movementSound.play(); // Play sound effect
          triggerJump(); // Trigger jump
        }
        break;
      case 'Space': // Jump
        triggerJump(); // Trigger jump
        movementSound.play(); // Play sound effect
        break;
    }
  }

  // Handle key up events for desktop
  function onKeyUp(event: KeyboardEvent) {
    if (!character || !character.position) return; // Ensure character is defined and has a position
    switch (event.code) {
      case 'KeyW':
        moveForward = false;
        break;
      case 'KeyS':
        moveBackward = false;
        break;
      case 'KeyA':
        moveLeft = false;
        break;
      case 'KeyD':
        moveRight = false;
        break;
    }
  }

  // Setup mobile controls
  function setupMobileControls() {
    // Make window.mobileControls available globally
    if (typeof window !== 'undefined') {
      // Initialize mobileControls if it doesn't exist
      (window as any).mobileControls = {
        moveForward: false,
        moveBackward: false,
        moveLeft: false,
        moveRight: false
      };
    }

    // Create container for mobile controls
    const mobileControlsContainer = document.createElement('div');
    mobileControlsContainer.id = 'mobile-controls';
    mobileControlsContainer.style.position = 'absolute';
    mobileControlsContainer.style.bottom = '20px';
    mobileControlsContainer.style.right = '20px';
    mobileControlsContainer.style.display = 'flex';
    mobileControlsContainer.style.flexDirection = 'column';
    mobileControlsContainer.style.gap = '10px';
    mobileControlsContainer.style.zIndex = '1000';
    document.body.appendChild(mobileControlsContainer);

    // Create directional buttons container
    const directionContainer = document.createElement('div');
    directionContainer.style.display = 'grid';
    directionContainer.style.gridTemplateColumns = 'repeat(3, 60px)';
    directionContainer.style.gridTemplateRows = 'repeat(3, 60px)';
    directionContainer.style.gap = '5px';
    mobileControlsContainer.appendChild(directionContainer);

    // Create empty placeholders for the grid where buttons aren't needed
    for (let i = 0; i < 9; i++) {
      const cell = document.createElement('div');
      
      // Only create buttons for specific positions (top, right, bottom, left)
      if (i === 1) { // Top (Up button)
        createArrowButton(cell, '↑', 'up');
      } else if (i === 3) { // Left
        createArrowButton(cell, '←', 'left');
      } else if (i === 5) { // Right
        createArrowButton(cell, '→', 'right');
      } else if (i === 7) { // Bottom (Down button)
        createArrowButton(cell, '↓', 'down');
      }
      
      directionContainer.appendChild(cell);
    }

    // Create rotation buttons container
    const rotationContainer = document.createElement('div');
    rotationContainer.style.display = 'flex';
    rotationContainer.style.justifyContent = 'space-between';
    rotationContainer.style.marginTop = '10px';
    mobileControlsContainer.appendChild(rotationContainer);

    // Create left rotation button
    const leftRotateBtn = document.createElement('button');
    leftRotateBtn.textContent = "↺";
    leftRotateBtn.style.width = '90px';
    leftRotateBtn.style.height = '50px';
    leftRotateBtn.style.backgroundColor = "#8B4513";
    leftRotateBtn.style.color = "#ffffff";
    leftRotateBtn.style.border = "4px solid #000000";
    leftRotateBtn.style.fontFamily = "'Press Start 2P', cursive";
    leftRotateBtn.style.fontSize = "20px";
    leftRotateBtn.style.boxShadow = "4px 4px 0px #000000";
    leftRotateBtn.style.outline = "none";
    rotationContainer.appendChild(leftRotateBtn);

    // Create right rotation button
    const rightRotateBtn = document.createElement('button');
    rightRotateBtn.textContent = "↻";
    rightRotateBtn.style.width = '90px';
    rightRotateBtn.style.height = '50px';
    rightRotateBtn.style.backgroundColor = "#8B4513";
    rightRotateBtn.style.color = "#ffffff";
    rightRotateBtn.style.border = "4px solid #000000";
    rightRotateBtn.style.fontFamily = "'Press Start 2P', cursive";
    rightRotateBtn.style.fontSize = "20px";
    rightRotateBtn.style.boxShadow = "4px 4px 0px #000000";
    rightRotateBtn.style.outline = "none";
    rotationContainer.appendChild(rightRotateBtn);

    // Helper function to create arrow buttons
    function createArrowButton(container: HTMLDivElement, symbol: string, direction: string) {
      const btn = document.createElement('button');
      btn.textContent = symbol;
      btn.style.width = '100%';
      btn.style.height = '100%';
      btn.style.backgroundColor = "#8B4513";
      btn.style.color = "#ffffff";
      btn.style.border = "4px solid #000000";
      btn.style.fontFamily = "'Press Start 2P', cursive";
      btn.style.fontSize = "24px";
      btn.style.boxShadow = "4px 4px 0px #000000";
      btn.style.outline = "none";
      btn.style.display = "flex";
      btn.style.justifyContent = "center";
      btn.style.alignItems = "center";
      
      // Touch event handlers
      btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const movementSound = new Howl({
          src: ["models/Robert/sfx/jumpsfx.ogg"],
          volume: 1
        });
        
        // Update movement flags based on direction
        if (direction === 'up') {
          (window as any).mobileControls.moveForward = true;
        } else if (direction === 'down') {
          (window as any).mobileControls.moveBackward = true;
        } else if (direction === 'left') {
          (window as any).mobileControls.moveLeft = true;
        } else if (direction === 'right') {
          (window as any).mobileControls.moveRight = true;
        }
        
        // Play movement sound
        movementSound.play();
        
        // Trigger jump animation for feedback
        if (character) {
          triggerJump();
        }
      });
      
      btn.addEventListener('touchend', (e) => {
        e.preventDefault();
        
        // Reset movement flags based on direction
        if (direction === 'up') {
          (window as any).mobileControls.moveForward = false;
        } else if (direction === 'down') {
          (window as any).mobileControls.moveBackward = false;
        } else if (direction === 'left') {
          (window as any).mobileControls.moveLeft = false;
        } else if (direction === 'right') {
          (window as any).mobileControls.moveRight = false;
        }
      });
      
      container.appendChild(btn);
    }

    // Handle rotation buttons
    leftRotateBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const movementSound = new Howl({
        src: ["models/Robert/sfx/jumpsfx.ogg"],
        volume: 1
      });
      
      if (character) {
        character.rotation.y += Math.PI / 2; // Rotate around Y-axis
        movementSound.play(); // Play sound effect
        triggerJump(); // Trigger jump
      }
    });

    rightRotateBtn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const movementSound = new Howl({
        src: ["models/Robert/sfx/jumpsfx.ogg"],
        volume: 1
      });
      
      if (character) {
        character.rotation.y -= Math.PI / 2; // Rotate around Y-axis
        movementSound.play(); // Play sound effect
        triggerJump(); // Trigger jump
      }
    });

    // Setup touch handlers for object interaction
    document.addEventListener('touchstart', (event: TouchEvent) => {
      // Skip processing if modal is open
      if (isModalOpen) {
        return;
      }
      
      if (event.touches.length > 0) {
        const touch = event.touches[0];
        
        // Calculate normalized device coordinates
        mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;
        
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(scene.children, true);
        
        if (intersects.length > 0) {
          const objectName = intersects[0].object.name;
          
          // Check if this is one of our mapped text objects
          if (textToExportMapping[objectName as keyof typeof textToExportMapping]) {
            const exportName = textToExportMapping[objectName as keyof typeof textToExportMapping];
            console.log(`Touched: ${objectName} mapped to ${exportName}`);
            
            // Play sound when clicking on interactive objects
            const clickSound = new Howl({
              src: ["models/Robert/sfx/projects1.ogg"],
              volume: 0.5
            });
            clickSound.play();
            
            showModal(exportName);
          }
        }
      }
    });

    // Return the updater function
    return {
      updateMovement: () => {
        // Return current movement state
        return (window as any).mobileControls;
      }
    };
  }

  // Setup UI elements
  function setupUI(isMobile: boolean) {
    // Create a button to toggle between day and night
    const toggleDayNightButton = document.createElement('button');
    toggleDayNightButton.textContent = "Day/Night";
    toggleDayNightButton.style.position = "absolute";
    toggleDayNightButton.style.top = isMobile ? "130px" : "90px";
    toggleDayNightButton.style.right = "10px";
    toggleDayNightButton.style.padding = isMobile ? "15px" : "10px 20px";
    toggleDayNightButton.style.backgroundColor = "#8B4513";
    toggleDayNightButton.style.color = "#ffffff";
    toggleDayNightButton.style.border = "4px solid #000000";
    toggleDayNightButton.style.fontFamily = "'Press Start 2P', cursive";
    toggleDayNightButton.style.fontSize = isMobile ? "14px" : "12px";
    toggleDayNightButton.style.textTransform = "uppercase";
    toggleDayNightButton.style.cursor = "pointer";
    toggleDayNightButton.style.boxShadow = "4px 4px 0px #000000";
    toggleDayNightButton.style.outline = "none";
    toggleDayNightButton.style.transition = "transform 0.1s";

    // Add hover effect
    toggleDayNightButton.addEventListener('mouseover', () => {
      toggleDayNightButton.style.transform = "scale(1.1)";
    });
    toggleDayNightButton.addEventListener('mouseout', () => {
      toggleDayNightButton.style.transform = "scale(1)";
    });

    // Add event listener to toggle between day and night and play sound
    let isDay = true;
    toggleDayNightButton.addEventListener('click', () => {
      const toggleSound = new Howl({
        src: ["models/Robert/sfx/projects1.ogg"],
        volume: 0.5
      });
      toggleSound.play(); // Play the sound effect

      if (isDay) {
        // Set background to a dark gradient for night
        scene.background = new THREE.Color(0x0a0a2a); // Dark blue for night
        scene.environment = null; // Remove environment map for night

        // Adjust lighting for night
        light.intensity = 0.5; // Dim the directional light
        light.color.set(0x5555ff); // Slight blue tint for moonlight
        scene.add(new THREE.AmbientLight(0x222244, 0.5)); // Add soft ambient light for night

        // Add a moonlight effect
        const moonLight = new THREE.PointLight(0xaaaaee, 0.8, 50);
        moonLight.position.set(10, 20, -10);
        scene.add(moonLight);

        // Optional: Add stars to the night sky
        const starGeometry = new THREE.BufferGeometry();
        const starMaterial = new THREE.PointsMaterial({ color: 0xffffff });
        const starVertices = [];
        for (let i = 0; i < 500; i++) {
          starVertices.push(
            (Math.random() - 0.5) * 100,
            Math.random() * 50 + 10,
            (Math.random() - 0.5) * 100
          );
        }
        starGeometry.setAttribute(
          "position",
          new THREE.Float32BufferAttribute(starVertices, 3)
        );
        const stars = new THREE.Points(starGeometry, starMaterial);
        scene.add(stars);
      } else {
        // Restore the day scene
        new RGBELoader().load('./img/venice_sunset_1k.hdr', function (texture) {
          texture.mapping = THREE.EquirectangularReflectionMapping;
          scene.environment = texture;
          scene.background = texture;
        });
        light.intensity = 2; // Restore the directional light intensity
        light.color.set(0xffffff); // Reset light color to white

        // Remove additional night elements
        scene.children = scene.children.filter(
          (child) => !(child instanceof THREE.PointLight || child instanceof THREE.Points)
        );
      }
      isDay = !isDay; // Toggle the state
    });

    // Append the toggle button to the document body
    document.body.appendChild(toggleDayNightButton);

    // Load the music using Howler.js
    const music = new Howl({
      src: ["models/Robert/sfx/Apotos.mp3"],
      loop: true,
      volume: 0.2
    });

    // Play the music when the page loads
    music.play();

    // Create a button to play the music
    const playMusicButton = document.createElement('button');
    playMusicButton.textContent = "Play Music";
    playMusicButton.style.position = "absolute";
    playMusicButton.style.top = "10px";
    playMusicButton.style.right = "10px";
    playMusicButton.style.padding = isMobile ? "15px" : "10px 20px";
    playMusicButton.style.backgroundColor = "#8B4513";
    playMusicButton.style.color = "#ffffff";
    playMusicButton.style.border = "4px solid #000000";
    playMusicButton.style.fontFamily = "'Press Start 2P', cursive";
    playMusicButton.style.fontSize = isMobile ? "14px" : "12px";
    playMusicButton.style.textTransform = "uppercase";
    playMusicButton.style.cursor = "pointer";
    playMusicButton.style.boxShadow = "4px 4px 0px #000000";
    playMusicButton.style.outline = "none";
    playMusicButton.style.transition = "transform 0.1s";

    // Add hover effect
    playMusicButton.addEventListener('mouseover', () => {
      playMusicButton.style.transform = "scale(1.1)";
    });
    playMusicButton.addEventListener('mouseout', () => {
      playMusicButton.style.transform = "scale(1)";
    });

    // Load the sound effect using Howler.js
    const buttonClickSound = new Howl({
      src: ["models/Robert/sfx/projects1.ogg"],
      volume: 0.5
    });

    // Add event listener to play the sound effect and music when the play button is clicked
    playMusicButton.addEventListener('click', () => {
      buttonClickSound.play();
      music.play();
    });

    // Append the play button to the document body
    document.body.appendChild(playMusicButton);

    // Create a button to stop the music
    const stopMusicButton = document.createElement('button');
    stopMusicButton.textContent = "Stop Music";
    stopMusicButton.style.position = "absolute";
    stopMusicButton.style.top = isMobile ? "70px" : "50px";
    stopMusicButton.style.right = "10px";
    stopMusicButton.style.padding = isMobile ? "15px" : "10px 20px";
    stopMusicButton.style.backgroundColor = "#8B4513";
    stopMusicButton.style.color = "#ffffff";
    stopMusicButton.style.border = "4px solid #000000";
    stopMusicButton.style.fontFamily = "'Press Start 2P', cursive";
    stopMusicButton.style.fontSize = isMobile ? "14px" : "12px";
    stopMusicButton.style.textTransform = "uppercase";
    stopMusicButton.style.cursor = "pointer";
    stopMusicButton.style.boxShadow = "4px 4px 0px #000000";
    stopMusicButton.style.outline = "none";
    stopMusicButton.style.transition = "transform 0.1s";

    // Add hover effect
    stopMusicButton.addEventListener('mouseover', () => {
      stopMusicButton.style.transform = "scale(1.1)";
    });
    stopMusicButton.addEventListener('mouseout', () => {
      stopMusicButton.style.transform = "scale(1)";
    });

    // Add event listener to play the sound effect and stop the music when the stop button is clicked
    stopMusicButton.addEventListener('click', () => {
      buttonClickSound.play();
      music.stop();
    });

    // Append the stop button to the document body
    document.body.appendChild(stopMusicButton);

    // Create a button for VSL
    const vslButton = document.createElement('button');
    vslButton.textContent = "VSL";
    vslButton.style.position = "absolute";
    vslButton.style.bottom = isMobile ? "220px" : "110px";
    vslButton.style.left = "10px";
    vslButton.style.padding = isMobile ? "15px" : "10px 20px";
    vslButton.style.backgroundColor = "#8B4513";
    vslButton.style.color = "#ffffff";
    vslButton.style.border = "4px solid #000000";
    vslButton.style.fontFamily = "'Press Start 2P', cursive";
    vslButton.style.fontSize = isMobile ? "14px" : "12px";
    vslButton.style.textTransform = "uppercase";
    vslButton.style.cursor = "pointer";
    vslButton.style.boxShadow = "4px 4px 0px #000000";
    vslButton.style.outline = "none";
    vslButton.style.transition = "transform 0.1s";

    // Add hover effect
    vslButton.addEventListener('mouseover', () => {
      vslButton.style.transform = "scale(1.1)";
    });
    vslButton.addEventListener('mouseout', () => {
      vslButton.style.transform = "scale(1)";
    });

    // Add event listener to open the VSL link and play sound
    vslButton.addEventListener('click', () => {
      const vslClickSound = new Howl({
        src: ["models/Robert/sfx/projects1.ogg"],
        volume: 0.5
      });
      vslClickSound.play(); // Play the sound effect
      window.open("https://roberterranteofficial.systeme.io/105f2ad3", "_blank"); // Open the VSL link in a new tab
    });

    // Append the VSL button to the document body
    document.body.appendChild(vslButton);

    // Create an "Instruction" button
    const instructionButton = document.createElement('button');
    instructionButton.textContent = "Instruction";
    instructionButton.style.position = "absolute";
    instructionButton.style.bottom = isMobile ? "170px" : "60px";
    instructionButton.style.left = "10px";
    instructionButton.style.padding = isMobile ? "15px" : "10px 20px";
    instructionButton.style.backgroundColor = "#8B4513";
    instructionButton.style.color = "#ffffff";
    instructionButton.style.border = "4px solid #000000";
    instructionButton.style.fontFamily = "'Press Start 2P', cursive";
    instructionButton.style.fontSize = isMobile ? "14px" : "12px";
    instructionButton.style.textTransform = "uppercase";
    instructionButton.style.cursor = "pointer";
    instructionButton.style.boxShadow = "4px 4px 0px #000000";
    instructionButton.style.outline = "none";
    instructionButton.style.transition = "transform 0.1s";

    // Add hover effect
    instructionButton.addEventListener('mouseover', () => {
      instructionButton.style.transform = "scale(1.1)";
    });
    instructionButton.addEventListener('mouseout', () => {
      instructionButton.style.transform = "scale(1)";
    });

    // Add event listener to show the modal with instructions and play sound
    instructionButton.addEventListener('click', () => {
      const instructionSound = new Howl({
        src: ["models/Robert/sfx/projects1.ogg"],
        volume: 0.5
      });
      instructionSound.play(); // Play the sound effect

      if (modalTitle) {
        modalTitle.textContent = "Welcome to the Maze Adventure!";
      }
      if (modalProjectDescription) {
        modalProjectDescription.textContent = 
          "W, A, S, D to move.\n" +
          "Q, E to turn left and right.\n" +
          "Go find my mystery book and free gift!";
      }
      if (modalVisitProjectButton) {
        modalVisitProjectButton.classList.add("hidden"); // Hide the visit button
      }
      if (modal) {
        modal.classList.remove("hidden");
      }
      if (modalbgOverlay) {
        modalbgOverlay.classList.remove("hidden");
      }
      isModalOpen = true;
    });

    // Append the instruction button to the document body
    document.body.appendChild(instructionButton);

    // Create a button to book a consultation
    const bookConsultationButton = document.createElement('button');
    bookConsultationButton.textContent = "Book a Consultation";
    bookConsultationButton.style.position = "absolute";
    bookConsultationButton.style.bottom = isMobile ? "120px" : "10px";
    bookConsultationButton.style.left = "10px";
    bookConsultationButton.style.padding = isMobile ? "15px" : "10px 20px";
    bookConsultationButton.style.backgroundColor = "#8B4513";
    bookConsultationButton.style.color = "#ffffff";
    bookConsultationButton.style.border = "4px solid #000000";
    bookConsultationButton.style.fontFamily = "'Press Start 2P', cursive";
    bookConsultationButton.style.fontSize = isMobile ? "14px" : "12px";
    bookConsultationButton.style.textTransform = "uppercase";
    bookConsultationButton.style.cursor = "pointer";
    bookConsultationButton.style.boxShadow = "4px 4px 0px #000000";
    bookConsultationButton.style.outline = "none";
    bookConsultationButton.style.transition = "transform 0.1s";

    // Add hover effect
    bookConsultationButton.addEventListener('mouseover', () => {
      bookConsultationButton.style.transform = "scale(1.1)";
    });
    bookConsultationButton.addEventListener('mouseout', () => {
      bookConsultationButton.style.transform = "scale(1)";
    });

    // Add event listener to show the modal and play sound when the button is clicked
    bookConsultationButton.addEventListener('click', () => {
      const clickSound = new Howl({
        src: ["models/Robert/sfx/projects1.ogg"],
        volume: 0.5
      });
      clickSound.play(); // Play the sound effect

      if (modalTitle) {
        modalTitle.textContent = "Book a Consultation";
      }
      if (modalProjectDescription) {
        modalProjectDescription.textContent = 
          "This system reveals the truth behind restoring your body, proven by holistic experts and real results! " +
          "No more relying on expensive medications or dealing with frustrating side effects. " +
          "It's time for a real solution that works for YOU. " +
          "Are you ready to take control of your health? " +
          "Book a call with me today and let's start your transformation! " +
          "Your adventure begins now—good luck, and let's make it happen!";
      }
      if (modalVisitProjectButton) {
        modalVisitProjectButton.textContent = "Follow Link";
        modalVisitProjectButton.classList.remove("hidden");
        (modalVisitProjectButton as HTMLAnchorElement).href = "https://calendly.com/centenarianlifestylerob"; // Replace with your booking page URL
      }
      if (modal) {
        modal.classList.remove("hidden");
      }
      if (modalbgOverlay) {
        modalbgOverlay.classList.remove("hidden");
      }
      isModalOpen = true;
    });

    // Append the book consultation button to the document body
    document.body.appendChild(bookConsultationButton);

    // Automatically show the modal with instructions when the page loads
    window.addEventListener('load', () => {
      if (modalTitle) {
        modalTitle.textContent = "Welcome to the Maze Adventure!";
      }
      if (modalProjectDescription) {
        if (isMobile) {
          modalProjectDescription.textContent = 
            "Use the arrow buttons to move.\n" +
            "Use the rotation buttons to turn left and right.\n" +
            "Go find my mystery book and free gift!";
        } else {
          modalProjectDescription.textContent = 
            "W, A, S, D to move.\n" +
            "Q, E to turn left and right.\n" +
            "Go find my mystery book and free gift!";
        }
      }
      if (modalVisitProjectButton) {
        modalVisitProjectButton.classList.add("hidden"); // Hide the visit button
      }
      if (modal) {
        modal.classList.remove("hidden");
      }
      if (modalbgOverlay) {
        modalbgOverlay.classList.remove("hidden");
      }
      isModalOpen = true;
    });
  }

  // Mouse and Click interactions for desktop
  function setupDesktopInteractions() {
    // Mouse movement handler
    function onMouseMove(event: MouseEvent) {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      if (intersects.length > 0) {
        const objectName = intersects[0].object.name;
       
        // Check if this is one of our mapped text objects
        if (textToExportMapping[objectName as keyof typeof textToExportMapping]) {
          document.body.style.cursor = "pointer";
          intersectObject = textToExportMapping[objectName as keyof typeof textToExportMapping];
          console.log(`Hovering over: ${objectName} mapped to ${intersectObject}`);
        } else {
          document.body.style.cursor = "default";
          intersectObject = "";
        }
      } else {
        document.body.style.cursor = "default";
        intersectObject = "";
      }
    }

    // Mouse click handler
    function onMouseClick(event: MouseEvent) {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
     
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      if (intersects.length > 0) {
        const objectName = intersects[0].object.name;
       
        // Check if this is one of our mapped text objects
        if (textToExportMapping[objectName as keyof typeof textToExportMapping]) {
          const exportName = textToExportMapping[objectName as keyof typeof textToExportMapping];
          console.log(`Clicked on: ${objectName} mapped to ${exportName}`);
          
          // Play sound for specific exports
          const allowedExports = [
            "(Export) Robert",
            "(Export) The Problem",
            "(Export) Monster",
            "(Export)healing stick transformation",
            "(Export) tv VSL",
            "(Export) NPC CASE STUDY",
            "(Export)Free Gift",
            "(Export) broken heart why people fail",
            "(Export) Unique Mechanism",
            "(Export) Mystical book",
            "(Export) Next Step"
          ];

          if (allowedExports.includes(exportName)) {
            const clickSound = new Howl({
              src: ["models/Robert/sfx/projects1.ogg"],
              volume: 0.5
            });
            clickSound.play(); // Play the click sound effect
          }
          
          showModal(exportName);
        }
      }
    }

    // Set up event listeners
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('click', onMouseClick);
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
  }

  // Initialize correct interactions based on device type
  if (isMobile) {
    // For mobile, we don't need desktop mouse interactions
    // Mobile interactions are set up in setupMobileControls()
  } else {
    // For desktop, set up mouse and keyboard interactions
    setupDesktopInteractions();
  }

  // Performance Monitoring
  const stats = new Stats();
  document.body.appendChild(stats.dom);

  // Animation Loop
  function animate() {
    requestAnimationFrame(animate);
   
    // Handle character movement if character is loaded
    if (character) {
      // For mobile, update movement from mobile controls
      if (isMobile && typeof window !== 'undefined' && (window as any).mobileControls) {
        moveForward = (window as any).mobileControls.moveForward;
        moveBackward = (window as any).mobileControls.moveBackward;
        moveLeft = (window as any).mobileControls.moveLeft;
        moveRight = (window as any).mobileControls.moveRight;
      }
      
      // Create a copy of the current position for collision detection
      const potentialPosition = character.position.clone();
     
      // Get the camera direction for relative movement
      const cameraDirection = new THREE.Vector3();
      camera.getWorldDirection(cameraDirection);
      cameraDirection.y = 0; // Keep movement on the ground plane
      cameraDirection.normalize();
     
      // Calculate right vector from camera's direction
      const rightVector = new THREE.Vector3();
      rightVector.crossVectors(cameraDirection, camera.up).normalize();
     
      // Apply movement based on key states
      if (moveForward) {
        potentialPosition.addScaledVector(cameraDirection, characterSpeed);
      }
      if (moveBackward) {
        potentialPosition.addScaledVector(cameraDirection, -characterSpeed);
      }
      if (moveLeft) {
        potentialPosition.addScaledVector(rightVector, -characterSpeed);
      }
      if (moveRight) {
        potentialPosition.addScaledVector(rightVector, characterSpeed);
      }
     
      // Update character position
      character.position.copy(potentialPosition);

      // Adjust camera position based on device type
      if (isMobile) {
        // Mobile camera position (higher and closer)
        const mobileOffset = { x: 0, y: 6, z: 8 };
        const targetCameraPosition = new THREE.Vector3(
          character.position.x + mobileOffset.x,
          character.position.y + mobileOffset.y,
          character.position.z + mobileOffset.z
        );
        camera.position.copy(targetCameraPosition);
        camera.lookAt(
          character.position.x,
          character.position.y,
          character.position.z
        );
      } else {
        // Desktop camera position
        const cameraOffset = { x: 0, y: 5, z: 10 };
        const targetCameraPosition = new THREE.Vector3(
          character.position.x + cameraOffset.x + -1,
          cameraOffset.y + 4,
          character.position.z + cameraOffset.z + 3.6
        );
        camera.position.copy(targetCameraPosition);
        camera.lookAt(
          character.position.x + 4,
          camera.position.y - 4,
          character.position.z + 4
        );

        // Set desktop zoom level
        camera.zoom = 2.7;
        camera.updateProjectionMatrix();
      }
    }
   
    controls.update();
    stats.update();
    renderer.render(scene, camera);
  }

  // Start the animation loop
  animate();
}
