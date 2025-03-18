// // Main game class
// class SpeedsterGame {
//     constructor() {
//         // Core Three.js components
//         this.scene = null;
//         this.camera = null;
//         this.renderer = null;
        
//         // Game state
//         this.player = null;
//         this.playerCharacter = null;
//         this.playerId = null;
//         this.socket = null;
//         this.otherPlayers = {};
//         this.trails = {};
//         this.abilityPoints = 0;
        
//         // Controls
//         this.controls = {
//             forward: false,
//             backward: false,
//             left: false,
//             right: false
//         };
        
//         // Game settings
//         this.gridSize = 1000;
//         this.trailHeight = 5;
//         this.baseSpeed = 30;
//         this.gameRunning = false;
        
//         // Character definitions
//         this.characters = {
//             A: {
//                 name: "Character A",
//                 color: 0xff0000, // Red
//                 baseSpeed: 1.00,
//                 specialName: "Speed Boost"
//             },
//             B: {
//                 name: "Character B",
//                 color: 0xffff00, // Yellow
//                 baseSpeed: 1.02,
//                 specialName: "Speed Dampener"
//             },
//             C: {
//                 name: "Character C",
//                 color: 0x00ff00, // Green
//                 baseSpeed: 1.00, // Varies between 0.9 and 1.1
//                 specialName: "Jump"
//             }
//         };
        
//         this.clock = new THREE.Clock();
//     }
    
//     init() {
//         // Set up Three.js scene
//         this.setupScene();
//         this.setupEventListeners();
//         this.showCharacterSelection();
//         this.animate();
//     }
    
//     setupScene() {
//         // Create the Three.js scene, camera, renderer
//         this.scene = new THREE.Scene();
//         this.scene.background = new THREE.Color(0x000011);
//         this.scene.fog = new THREE.Fog(0x000011, 50, 200);
        
//         // Camera setup
//         this.camera = new THREE.PerspectiveCamera(
//             75, window.innerWidth / window.innerHeight, 0.1, 1000
//         );
//         this.camera.position.set(0, 15, -30);
        
//         // Renderer setup
//         this.renderer = new THREE.WebGLRenderer({ antialias: true });
//         this.renderer.setSize(window.innerWidth, window.innerHeight);
//         this.renderer.shadowMap.enabled = true;
//         document.body.appendChild(this.renderer.domElement);
        
//         // Lights
//         const ambientLight = new THREE.AmbientLight(0x222233);
//         this.scene.add(ambientLight);
        
//         const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
//         directionalLight.position.set(100, 100, 100);
//         directionalLight.castShadow = true;
//         this.scene.add(directionalLight);
        
//         // Grid floor
//         this.createGrid();
        
//         // Handle window resize
//         window.addEventListener('resize', () => {
//             this.camera.aspect = window.innerWidth / window.innerHeight;
//             this.camera.updateProjectionMatrix();
//             this.renderer.setSize(window.innerWidth, window.innerHeight);
//         });
//     }
    
//     createGrid() {
//         // Create the Tron-like grid
//         const gridHelper = new THREE.GridHelper(this.gridSize, 100, 0x0088ff, 0x004488);
//         this.scene.add(gridHelper);
        
//         // Ground plane
//         const groundGeo = new THREE.PlaneGeometry(this.gridSize, this.gridSize);
//         const groundMat = new THREE.MeshStandardMaterial({
//             color: 0x000022,
//             roughness: 0.8,
//             metalness: 0.2
//         });
//         const ground = new THREE.Mesh(groundGeo, groundMat);
//         ground.rotation.x = -Math.PI / 2;
//         ground.receiveShadow = true;
//         this.scene.add(ground);
        
//         // Boundary walls
//         this.createBoundaryWalls();
//     }
    
//     createBoundaryWalls() {
//         // Create walls around the edge of the grid
//         const wallHeight = 20;
//         const wallMaterial = new THREE.MeshStandardMaterial({
//             color: 0x0088ff,
//             emissive: 0x001133
//         });
        
//         // North wall
//         const northWall = new THREE.Mesh(
//             new THREE.BoxGeometry(this.gridSize, wallHeight, 2),
//             wallMaterial
//         );
//         northWall.position.set(0, wallHeight/2, -this.gridSize/2);
//         this.scene.add(northWall);
        
//         // South wall
//         const southWall = new THREE.Mesh(
//             new THREE.BoxGeometry(this.gridSize, wallHeight, 2),
//             wallMaterial
//         );
//         southWall.position.set(0, wallHeight/2, this.gridSize/2);
//         this.scene.add(southWall);
        
//         // East wall
//         const eastWall = new THREE.Mesh(
//             new THREE.BoxGeometry(2, wallHeight, this.gridSize),
//             wallMaterial
//         );
//         eastWall.position.set(this.gridSize/2, wallHeight/2, 0);
//         this.scene.add(eastWall);
        
//         // West wall
//         const westWall = new THREE.Mesh(
//             new THREE.BoxGeometry(2, wallHeight, this.gridSize),
//             wallMaterial
//         );
//         westWall.position.set(-this.gridSize/2, wallHeight/2, 0);
//         this.scene.add(westWall);
//     }
    
//     createPlayer(characterType) {
//         // Create the player character
//         const charData = this.characters[characterType];
        
//         // Player mesh (cone shape pointing forward)
//         const geometry = new THREE.ConeGeometry(2, 5, 16);
//         const material = new THREE.MeshStandardMaterial({
//             color: charData.color,
//             emissive: new THREE.Color(charData.color).multiplyScalar(0.5)
//         });
        
//         this.player = new THREE.Mesh(geometry, material);
//         this.player.rotation.x = Math.PI / 2;
//         this.player.castShadow = true;
        
//         // Add light to player
//         const playerLight = new THREE.PointLight(charData.color, 1, 20);
//         playerLight.position.set(0, 3, 0);
//         this.player.add(playerLight);
        
//         // Set starting position based on character
//         if (characterType === 'A') {
//             this.player.position.set(0, 2.5, 0);
//         } else if (characterType === 'B') {
//             this.player.position.set(10, 2.5, 10);
//         } else if (characterType === 'C') {
//             this.player.position.set(-10, 2.5, -10);
//         }
        
//         this.scene.add(this.player);
//         this.lastTrailPosition = this.player.position.clone();
        
//         // Create HUD
//         this.updateHUD();
//     }
    
//     updateHUD() {
//         const hud = document.getElementById('game-hud');
//         hud.innerHTML = `
//             <div style="background-color: rgba(0, 0, 50, 0.7); padding: 10px; border-radius: 5px;">
//                 <div>Character: ${this.characters[this.playerCharacter].name}</div>
//                 <div>Ability Points: ${this.abilityPoints}</div>
//                 <div>Controls: W/A/S/D to move, Space to use ability</div>
//             </div>
//         `;
//     }
    
//     setupEventListeners() {
//         // Keyboard controls
//         window.addEventListener('keydown', (e) => {
//             switch (e.key) {
//                 case 'w': case 'ArrowUp': this.controls.forward = true; break;
//                 case 's': case 'ArrowDown': this.controls.backward = true; break;
//                 case 'a': case 'ArrowLeft': this.controls.left = true; break;
//                 case 'd': case 'ArrowRight': this.controls.right = true; break;
//                 case ' ': this.useSpecialAbility(); break;
//             }
//         });
        
//         window.addEventListener('keyup', (e) => {
//             switch (e.key) {
//                 case 'w': case 'ArrowUp': this.controls.forward = false; break;
//                 case 's': case 'ArrowDown': this.controls.backward = false; break;
//                 case 'a': case 'ArrowLeft': this.controls.left = false; break;
//                 case 'd': case 'ArrowRight': this.controls.right = false; break;
//             }
//         });
//     }
    
//     showCharacterSelection() {
//         // Create character selection UI
//         const selectionDiv = document.createElement('div');
//         selectionDiv.id = 'character-selection';
//         selectionDiv.style.position = 'absolute';
//         selectionDiv.style.width = '400px';
//         selectionDiv.style.padding = '20px';
//         selectionDiv.style.backgroundColor = 'rgba(0, 0, 50, 0.8)';
//         selectionDiv.style.color = 'white';
//         selectionDiv.style.borderRadius = '10px';
//         selectionDiv.style.top = '50%';
//         selectionDiv.style.left = '50%';
//         selectionDiv.style.transform = 'translate(-50%, -50%)';
        
//         selectionDiv.innerHTML = `
//             <h2 style="text-align: center; color: #00aaff;">Select Your Speedster</h2>
//             <div style="margin: 20px 0;">
//                 <div style="display: flex; margin-bottom: 20px; cursor: pointer; padding: 10px; border-radius: 5px;" 
//                      onmouseover="this.style.backgroundColor='rgba(255, 0, 0, 0.3)'" 
//                      onmouseout="this.style.backgroundColor='transparent'"
//                      onclick="window.selectCharacter('A')">
//                     <div style="width: 50px; height: 50px; background-color: red; border-radius: 50%;"></div>
//                     <div style="margin-left: 15px;">
//                         <h3 style="margin: 0;">Character A (Red)</h3>
//                         <p style="margin: 5px 0;">Speed: 100%</p>
//                         <p style="margin: 5px 0;">Special: Speed boost to 150% for 10 seconds</p>
//                     </div>
//                 </div>
                
//                 <div style="display: flex; margin-bottom: 20px; cursor: pointer; padding: 10px; border-radius: 5px;" 
//                      onmouseover="this.style.backgroundColor='rgba(255, 255, 0, 0.3)'" 
//                      onmouseout="this.style.backgroundColor='transparent'"
//                      onclick="window.selectCharacter('B')">
//                     <div style="width: 50px; height: 50px; background-color: yellow; border-radius: 50%;"></div>
//                     <div style="margin-left: 15px;">
//                         <h3 style="margin: 0;">Character B (Yellow)</h3>
//                         <p style="margin: 5px 0;">Speed: 102% (97% near Character A)</p>
//                         <p style="margin: 5px 0;">Special: Reduces all others to 90% speed</p>
//                     </div>
//                 </div>
                
//                 <div style="display: flex; margin-bottom: 20px; cursor: pointer; padding: 10px; border-radius: 5px;" 
//                      onmouseover="this.style.backgroundColor='rgba(0, 255, 0, 0.3)'" 
//                      onmouseout="this.style.backgroundColor='transparent'"
//                      onclick="window.selectCharacter('C')">
//                     <div style="width: 50px; height: 50px; background-color: green; border-radius: 50%;"></div>
//                     <div style="margin-left: 15px;">
//                         <h3 style="margin: 0;">Character C (Green)</h3>
//                         <p style="margin: 5px 0;">Speed: Alternates 110% ↔ 90% every 10 seconds</p>
//                         <p style="margin: 5px 0;">Special: Jump 10 meters into the air</p>
//                     </div>
//                 </div>
//             </div>
//         `;
        
//         document.body.appendChild(selectionDiv);
        
//         // Global function to handle selection
//         window.selectCharacter = (char) => {
//             this.connectToServer(char);
//             document.body.removeChild(selectionDiv);
//         };
//     }
    
//     connectToServer(characterType) {
//         // Generate player ID and connect to WebSocket
//         this.playerId = 'player_' + Math.random().toString(36).substring(2, 9);
//         this.playerCharacter = characterType;
        
//         // Create WebSocket connection - use explicit backend URL
//         const wsUrl = `ws://localhost:8000/ws/${this.playerId}`;
//         console.log(`Connecting to WebSocket at ${wsUrl}`);
        
//         this.socket = new WebSocket(wsUrl);
        
//         this.socket.onopen = () => {
//             console.log('WebSocket connection established');
//             // Send character selection
//             this.socket.send(JSON.stringify({
//                 type: 'character_select',
//                 character: characterType
//             }));
            
//             // Create player character
//             this.createPlayer(characterType);
//             this.gameRunning = true;
//         };
        
//         this.socket.onmessage = (event) => {
//             const message = JSON.parse(event.data);
//             this.handleServerMessage(message);
//         };
        
//         this.socket.onerror = (error) => {
//             console.error('WebSocket error:', error);
//         };
        
//         this.socket.onclose = () => {
//             console.log('WebSocket connection closed');
//             // Maybe show reconnect option
//         };
//     }
    
//     sendPositionUpdate() {
//         if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return;
        
//         this.socket.send(JSON.stringify({
//             type: 'position_update',
//             position: [
//                 this.player.position.x,
//                 this.player.position.y,
//                 this.player.position.z
//             ],
//             rotation: this.player.rotation.y
//         }));
//     }
    
//     handleServerMessage(message) {
//         if (message.type === 'game_update') {
//             // Update player data including ability points
//             if (this.playerId in message.players) {
//                 const myData = message.players[this.playerId];
//                 this.abilityPoints = myData.ability_points;
//                 this.updateHUD();
//             }
            
//             // Update other players
//             for (const playerId in message.players) {
//                 // Skip our own player, we handle it locally
//                 if (playerId === this.playerId) continue;
                
//                 const playerData = message.players[playerId];
                
//                 // Create or update other player
//                 if (!this.otherPlayers[playerId]) {
//                     // Create new player mesh
//                     const playerGeometry = new THREE.ConeGeometry(2, 5, 16);
//                     const playerMaterial = new THREE.MeshStandardMaterial({
//                         color: this.getPlayerColor(playerData.character),
//                         emissive: this.getPlayerColor(playerData.character, 0.5)
//                     });
                    
//                     const playerMesh = new THREE.Mesh(playerGeometry, playerMaterial);
//                     playerMesh.rotation.x = Math.PI / 2;
//                     playerMesh.castShadow = true;
                    
//                     // Add light to player
//                     const playerLight = new THREE.PointLight(
//                         this.getPlayerColor(playerData.character), 
//                         1, 
//                         20
//                     );
//                     playerLight.position.set(0, 3, 0);
//                     playerMesh.add(playerLight);
                    
//                     this.scene.add(playerMesh);
//                     this.otherPlayers[playerId] = {
//                         mesh: playerMesh,
//                         lastPosition: new THREE.Vector3(
//                             playerData.position[0],
//                             playerData.position[1],
//                             playerData.position[2]
//                         )
//                     };
//                 }
                
//                 // Update player position and rotation
//                 const position = playerData.position;
//                 const mesh = this.otherPlayers[playerId].mesh;
                
//                 // Set position
//                 mesh.position.set(position[0], position[1], position[2]);
                
//                 // Set rotation
//                 mesh.rotation.y = playerData.rotation;
//             }
            
//             // Handle player trail updates from server
//             for (const playerId in message.trails) {
//                 if (playerId === this.playerId) continue; // Skip own trails
                
//                 // Process new trail segments
//                 const serverTrails = message.trails[playerId];
                
//                 if (!this.trails[playerId]) {
//                     this.trails[playerId] = [];
//                 }
                
//                 // Find segments we haven't visualized yet
//                 for (const segment of serverTrails) {
//                     // Skip if we already have this trail segment (simple check)
//                     if (this.trails[playerId].some(t => 
//                         t.serverData && 
//                         t.serverData.created_at === segment.created_at
//                     )) continue;
                    
//                     // Create visual trail segment for the position
//                     const trailGeometry = new THREE.BoxGeometry(0.5, this.trailHeight, 2);
//                     const trailMaterial = new THREE.MeshStandardMaterial({
//                         color: this.getPlayerColor(message.players[playerId]?.character || 'A'),
//                         emissive: this.getPlayerColor(message.players[playerId]?.character || 'A', 0.5),
//                         transparent: true,
//                         opacity: 0.8
//                     });
                    
//                     const trail = new THREE.Mesh(trailGeometry, trailMaterial);
                    
//                     // Position trail
//                     const position = segment.position;
//                     trail.position.set(position[0], this.trailHeight/2, position[2]);
                    
//                     this.scene.add(trail);
                    
//                     // Add to trails collection
//                     this.trails[playerId].push({
//                         mesh: trail,
//                         serverData: segment
//                     });
//                 }
//             }
            
//             // Handle game events
//             if (message.event && message.event.type === 'player_killed') {
//                 const deadPlayerId = message.event.dead_player;
//                 const killerId = message.event.killer;
                
//                 // If we were killed
//                 if (deadPlayerId === this.playerId) {
//                     this.showGameOver(killerId);
//                 }
                
//                 // Visual effect for killed player
//                 if (this.otherPlayers[deadPlayerId]) {
//                     // Add explosion effect
//                     this.createExplosion(this.otherPlayers[deadPlayerId].mesh.position);
                    
//                     // Remove player mesh
//                     this.scene.remove(this.otherPlayers[deadPlayerId].mesh);
//                     delete this.otherPlayers[deadPlayerId];
//                 }
//             }
//         } else if (message.type === 'special_ability_response') {
//             if (message.success) {
//                 // Show special ability effect
//                 if (this.playerCharacter === 'A') {
//                     // Speed boost effect
//                     this.createSpeedBoostEffect();
//                 } else if (this.playerCharacter === 'B') {
//                     // Slow others effect
//                     this.createSlowEffect();
//                 }
//                 // Character C's jump is handled locally
//             }
//         }
//     }
    
//     updatePlayer(delta) {
//         if (!this.player || !this.gameRunning) return;
        
//         // Calculate speed based on character
//         let speed = this.baseSpeed * this.characters[this.playerCharacter].baseSpeed * delta;
        
//         // Apply movement based on controls
//         let moved = false;
//         let rotation = 0;
        
//         if (this.controls.forward) {
//             // Move in the direction the player is facing
//             const direction = new THREE.Vector3(0, 0, 1);
//             direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.player.rotation.y);
            
//             this.player.position.x += direction.x * speed;
//             this.player.position.z += direction.z * speed;
//             moved = true;
//         }
        
//         if (this.controls.backward) {
//             // Move backward at half speed
//             const direction = new THREE.Vector3(0, 0, 1);
//             direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.player.rotation.y);
            
//             this.player.position.x -= direction.x * speed * 0.5;
//             this.player.position.z -= direction.z * speed * 0.5;
//             moved = true;
//         }
        
//         // Handle rotation
//         if (this.controls.left) rotation += 0.05;
//         if (this.controls.right) rotation -= 0.05;
        
//         if (rotation !== 0) {
//             this.player.rotation.y += rotation;
//         }
        
//         // Create trail segments as the player moves
//         if (moved) {
//             this.createTrail();
//             this.updateCamera();
//         }
        
//         // Keep player within boundaries
//         const halfGridSize = this.gridSize / 2;
//         this.player.position.x = Math.max(-halfGridSize + 5, Math.min(halfGridSize - 5, this.player.position.x));
//         this.player.position.z = Math.max(-halfGridSize + 5, Math.min(halfGridSize - 5, this.player.position.z));
//     }
    
//     createTrail() {
//         const currentPos = new THREE.Vector3().copy(this.player.position);
//         const distance = currentPos.distanceTo(this.lastTrailPosition);
        
//         // Create trail segment if moved enough distance
//         if (distance > 2) {
//             // Create visual trail segment
//             const trailGeometry = new THREE.BoxGeometry(0.5, this.trailHeight, distance);
//             const trailMaterial = new THREE.MeshStandardMaterial({
//                 color: this.characters[this.playerCharacter].color,
//                 emissive: new THREE.Color(this.characters[this.playerCharacter].color).multiplyScalar(0.5),
//                 transparent: true,
//                 opacity: 0.8
//             });
            
//             const trail = new THREE.Mesh(trailGeometry, trailMaterial);
            
//             // Position and orient trail
//             const direction = new THREE.Vector3().subVectors(currentPos, this.lastTrailPosition);
//             const midpoint = new THREE.Vector3().addVectors(
//                 this.lastTrailPosition,
//                 direction.clone().multiplyScalar(0.5)
//             );
            
//             trail.position.set(midpoint.x, this.trailHeight/2, midpoint.z);
//             trail.lookAt(currentPos.clone().setY(this.trailHeight/2));
            
//             this.scene.add(trail);
            
//             // Add to trails collection
//             if (!this.trails[this.playerId]) {
//                 this.trails[this.playerId] = [];
//             }
            
//             this.trails[this.playerId].push({
//                 mesh: trail,
//                 createdAt: Date.now(),
//                 expiresAt: Date.now() + 60000 // 1 minute lifespan
//             });
            
//             // Update last trail position
//             this.lastTrailPosition = currentPos.clone();
            
//             // Send position update to server
//             this.sendPositionUpdate();
//         }
//     }
    
//     updateCamera() {
//         // Position camera behind player
//         const direction = new THREE.Vector3(0, 0, 1);
//         direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.player.rotation.y);
        
//         const targetPosition = new THREE.Vector3(
//             this.player.position.x - direction.x * 20,
//             this.player.position.y + 10,
//             this.player.position.z - direction.z * 20
//         );
        
//         this.camera.position.lerp(targetPosition, 0.1);
//         this.camera.lookAt(this.player.position);
//     }
    
//     useSpecialAbility() {
//         if (!this.socket || this.socket.readyState !== WebSocket.OPEN || !this.gameRunning) return;
        
//         if (this.abilityPoints <= 0) {
//             console.log("No ability points available");
//             return;
//         }
        
//         console.log("Using special ability");
//         this.socket.send(JSON.stringify({
//             type: 'use_special'
//         }));
        
//         // For Character C, handle jump locally
//         if (this.playerCharacter === 'C') {
//             // Jump animation
//             const jumpHeight = 10;
//             const jumpDuration = 1.5; // seconds
            
//             // Store original height
//             const originalHeight = this.player.position.y;
            
//             // Create jump animation
//             const startTime = Date.now();
            
//             const jumpAnimation = () => {
//                 const elapsedTime = (Date.now() - startTime) / 1000;
                
//                 if (elapsedTime < jumpDuration) {
//                     // Parabolic jump
//                     const jumpProgress = elapsedTime / jumpDuration;
//                     const height = originalHeight + jumpHeight * Math.sin(jumpProgress * Math.PI);
                    
//                     this.player.position.y = height;
//                     requestAnimationFrame(jumpAnimation);
//                 } else {
//                     // End jump
//                     this.player.position.y = originalHeight;
//                 }
//             };
            
//             requestAnimationFrame(jumpAnimation);
//         }
//     }
    
//     cleanExpiredTrails() {
//         // Remove expired trail segments
//         const currentTime = Date.now();
        
//         for (const playerId in this.trails) {
//             if (!this.trails[playerId]) continue;
            
//             this.trails[playerId] = this.trails[playerId].filter(trail => {
//                 if (trail.expiresAt && trail.expiresAt < currentTime) {
//                     // Remove from scene
//                     this.scene.remove(trail.mesh);
//                     return false;
//                 }
//                 return true;
//             });
//         }
//     }
    
//     // Helper function to get color based on character type
//     getPlayerColor(characterType, multiplier = 1) {
//         const colors = {
//             'A': 0xff0000, // Red
//             'B': 0xffff00, // Yellow
//             'C': 0x00ff00  // Green
//         };
        
//         if (multiplier === 1) {
//             return colors[characterType] || 0xffffff;
//         } else {
//             // For emissive color with multiplier
//             return new THREE.Color(colors[characterType] || 0xffffff)
//                 .multiplyScalar(multiplier);
//         }
//     }
    
//     // Effects
//     createExplosion(position) {
//         console.log("Explosion at", position);
        
//         // Simple particle effect
//         const particleCount = 50;
//         const particles = new THREE.Group();
        
//         for (let i = 0; i < particleCount; i++) {
//             const size = Math.random() * 0.5 + 0.5;
//             const particle = new THREE.Mesh(
//                 new THREE.SphereGeometry(size, 8, 8),
//                 new THREE.MeshBasicMaterial({
//                     color: 0xffaa00,
//                     transparent: true,
//                     opacity: 0.8
//                 })
//             );
            
//             // Random position offset
//             particle.position.set(
//                 position.x + (Math.random() - 0.5) * 2,
//                 position.y + (Math.random() - 0.5) * 2,
//                 position.z + (Math.random() - 0.5) * 2
//             );
            
//             // Random velocity
//             particle.userData.velocity = new THREE.Vector3(
//                 (Math.random() - 0.5) * 10,
//                 Math.random() * 10,
//                 (Math.random() - 0.5) * 10
//             );
            
//             particles.add(particle);
//         }
        
//         this.scene.add(particles);
        
//         // Animate particles
//         const startTime = Date.now();
//         const duration = 1000; // 1 second
        
//         const animateExplosion = () => {
//             const elapsed = Date.now() - startTime;
//             const progress = elapsed / duration;
            
//             if (progress < 1) {
//                 // Update each particle
//                 particles.children.forEach(particle => {
//                     particle.position.add(particle.userData.velocity.clone().multiplyScalar(0.01));
//                     particle.material.opacity = 0.8 * (1 - progress);
//                 });
                
//                 requestAnimationFrame(animateExplosion);
//             } else {
//                 this.scene.remove(particles);
//                 particles.children.forEach(p => p.geometry.dispose());
//             }
//         };
        
//         requestAnimationFrame(animateExplosion);
//     }
    
//     createSpeedBoostEffect() {
//         console.log("Speed boost activated");
        
//         // Add motion blur effect
//         const speedLines = new THREE.Group();
        
//         for (let i = 0; i < 10; i++) {
//             const line = new THREE.Mesh(
//                 new THREE.BoxGeometry(0.1, 0.1, 10),
//                 new THREE.MeshBasicMaterial({
//                     color: 0xff3333,
//                     transparent: true,
//                     opacity: 0.7
//                 })
//             );
            
//             // Position behind player
//             const angle = Math.random() * Math.PI * 2;
//             const distance = Math.random() * 5 + 5;
            
//             line.position.set(
//                 this.player.position.x + Math.cos(angle) * distance,
//                 this.player.position.y + Math.random() * 5,
//                 this.player.position.z + Math.sin(angle) * distance
//             );
            
//             // Random rotation
//             line.rotation.y = Math.random() * Math.PI * 2;
            
//             speedLines.add(line);
//         }
        
//         this.scene.add(speedLines);
        
//         // Animate for 10 seconds
//         const startTime = Date.now();
//         const duration = 10000;
        
//         const animateSpeedBoost = () => {
//             const elapsed = Date.now() - startTime;
            
//             if (elapsed < duration) {
//                 // Update speed lines
//                 speedLines.children.forEach(line => {
//                     line.rotation.y += 0.1;
                    
//                     // Follow player
//                     const direction = new THREE.Vector3(0, 0, 1);
//                     direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.player.rotation.y);
                    
//                     line.position.x = this.player.position.x - direction.x * (Math.random() * 5 + 5);
//                     line.position.z = this.player.position.z - direction.z * (Math.random() * 5 + 5);
//                 });
                
//                 requestAnimationFrame(animateSpeedBoost);
//             } else {
//                 this.scene.remove(speedLines);
//                 speedLines.children.forEach(line => line.geometry.dispose());
//             }
//         };
        
//         requestAnimationFrame(animateSpeedBoost);
//     }
    
//     createSlowEffect() {
//         console.log("Slow effect activated");
        
//         // Visual effect showing others being slowed
//         const slowWave = new THREE.Mesh(
//             new THREE.RingGeometry(1, 2, 32),
//             new THREE.MeshBasicMaterial({
//                 color: 0xffff00,
//                 transparent: true,
//                 opacity: 0.5,
//                 side: THREE.DoubleSide
//             })
//         );
        
//         slowWave.rotation.x = Math.PI / 2;
//         slowWave.position.copy(this.player.position);
        
//         this.scene.add(slowWave);
        
//         // Animate wave expanding
//         const startTime = Date.now();
//         const duration = 2000; // 2 seconds for animation
        
//         const animateSlowWave = () => {
//             const elapsed = Date.now() - startTime;
//             const progress = elapsed / duration;
            
//             if (progress < 1) {
//                 // Scale up ring
//                 const scale = 1 + progress * 30;
//                 slowWave.scale.set(scale, scale, 1);
                
//                 // Fade out
//                 slowWave.material.opacity = 0.5 * (1 - progress);
                
//                 requestAnimationFrame(animateSlowWave);
//             } else {
//                 this.scene.remove(slowWave);
//                 slowWave.geometry.dispose();
//                 slowWave.material.dispose();
//             }
//         };
        
//         requestAnimationFrame(animateSlowWave);
//     }
    
//     showGameOver(killerId) {
//         this.gameRunning = false;
        
//         // Create game over UI
//         const gameOverDiv = document.createElement('div');
//         gameOverDiv.className = 'game-over-screen';
        
//         gameOverDiv.innerHTML = `
//             <h2>GAME OVER</h2>
//             <p>You were eliminated!</p>
//             <button onclick="location.reload()">
//                 Play Again
//             </button>
//         `;
        
//         document.body.appendChild(gameOverDiv);
//     }
    
//     animate() {
//         requestAnimationFrame(() => this.animate());
        
//         const delta = this.clock.getDelta();
        
//         if (this.gameRunning) {
//             this.updatePlayer(delta);
//             this.cleanExpiredTrails();
            
//             // Update other players with interpolation
//             for (const playerId in this.otherPlayers) {
//                 const otherPlayer = this.otherPlayers[playerId];
                
//                 if (otherPlayer.mesh.userData.targetPosition) {
//                     otherPlayer.mesh.position.lerp(otherPlayer.mesh.userData.targetPosition, 0.1);
//                 }
                
//                 if (otherPlayer.mesh.userData.targetRotation !== undefined) {
//                     // Simple rotation interpolation
//                     otherPlayer.mesh.rotation.y += 
//                         (otherPlayer.mesh.userData.targetRotation - otherPlayer.mesh.rotation.y) * 0.1;
//                 }
//             }
//         }
        
//         this.renderer.render(this.scene, this.camera);
//     }
// }

// // Start game when page loads
// window.onload = () => {
//     const game = new SpeedsterGame();
//     game.init();
// };

// Main game class
class SpeedsterGame {
    constructor() {
        // Core Three.js components
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        
        // Game state
        this.player = null;
        this.playerCharacter = null;
        this.playerId = null;
        this.socket = null;
        this.otherPlayers = {};
        this.trails = {};
        this.abilityPoints = 0;
        this.direction = new THREE.Vector3(0, 0, 1); // Initial direction is forward
        
        // Controls
        this.controls = {
            left: false,
            right: false,
            turning: false
        };
        
        // Game settings
        this.gridSize = 1000;
        this.trailHeight = 5;
        this.baseSpeed = 25;  // Adjusted base speed
        this.gameRunning = false;
        
        // Character definitions
        this.characters = {
            A: {
                name: "Character A",
                color: 0xff0000, // Red
                baseSpeed: 1.00,
                specialName: "Speed Boost"
            },
            B: {
                name: "Character B",
                color: 0xffff00, // Yellow
                baseSpeed: 1.02,
                specialName: "Speed Dampener"
            },
            C: {
                name: "Character C",
                color: 0x00ff00, // Green
                baseSpeed: 1.00, // Varies between 0.9 and 1.1
                specialName: "Jump"
            }
        };
        
        this.clock = new THREE.Clock();
    }
    
    init() {
        // Set up Three.js scene
        this.setupScene();
        this.setupEventListeners();
        this.showCharacterSelection();
        this.animate();
    }
    
    setupScene() {
        // Create the Three.js scene, camera, renderer
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000011);
        this.scene.fog = new THREE.Fog(0x000011, 50, 200);
        
        // Camera setup
        this.camera = new THREE.PerspectiveCamera(
            75, window.innerWidth / window.innerHeight, 0.1, 1000
        );
        this.camera.position.set(0, 15, -30);
        
        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        document.body.appendChild(this.renderer.domElement);
        
        // Lights
        const ambientLight = new THREE.AmbientLight(0x222233);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(100, 100, 100);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);
        
        // Grid floor
        this.createGrid();
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }
    
    // Grid and boundary wall methods remain the same...
    // createGrid() and createBoundaryWalls() remain unchanged
    createGrid() {
        // Create the Tron-like grid
        const gridHelper = new THREE.GridHelper(this.gridSize, 100, 0x0088ff, 0x004488);
        this.scene.add(gridHelper);
        
        // Ground plane
        const groundGeo = new THREE.PlaneGeometry(this.gridSize, this.gridSize);
        const groundMat = new THREE.MeshStandardMaterial({
            color: 0x000022,
            roughness: 0.8,
            metalness: 0.2
        });
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);
        
        // Boundary walls
        this.createBoundaryWalls();
    }
    
    createBoundaryWalls() {
        // Create walls around the edge of the grid
        const wallHeight = 20;
        const wallMaterial = new THREE.MeshStandardMaterial({
            color: 0x0088ff,
            emissive: 0x001133
        });
        
        // North wall
        const northWall = new THREE.Mesh(
            new THREE.BoxGeometry(this.gridSize, wallHeight, 2),
            wallMaterial
        );
        northWall.position.set(0, wallHeight/2, -this.gridSize/2);
        this.scene.add(northWall);
        
        // South wall
        const southWall = new THREE.Mesh(
            new THREE.BoxGeometry(this.gridSize, wallHeight, 2),
            wallMaterial
        );
        southWall.position.set(0, wallHeight/2, this.gridSize/2);
        this.scene.add(southWall);
        
        // East wall
        const eastWall = new THREE.Mesh(
            new THREE.BoxGeometry(2, wallHeight, this.gridSize),
            wallMaterial
        );
        eastWall.position.set(this.gridSize/2, wallHeight/2, 0);
        this.scene.add(eastWall);
        
        // West wall
        const westWall = new THREE.Mesh(
            new THREE.BoxGeometry(2, wallHeight, this.gridSize),
            wallMaterial
        );
        westWall.position.set(-this.gridSize/2, wallHeight/2, 0);
        this.scene.add(westWall);
    }
    
    createPlayer(characterType) {
        // Create the player character
        const charData = this.characters[characterType];
        
        // Player mesh (cone shape pointing forward)
        const geometry = new THREE.ConeGeometry(2, 5, 16);
        const material = new THREE.MeshStandardMaterial({
            color: charData.color,
            emissive: new THREE.Color(charData.color).multiplyScalar(0.5)
        });
        
        this.player = new THREE.Mesh(geometry, material);
        this.player.rotation.x = Math.PI / 2;
        this.player.castShadow = true;
        
        // Add light to player
        const playerLight = new THREE.PointLight(charData.color, 1, 20);
        playerLight.position.set(0, 3, 0);
        this.player.add(playerLight);
        
        // Set starting position based on character
        if (characterType === 'A') {
            this.player.position.set(0, 2.5, 0);
        } else if (characterType === 'B') {
            this.player.position.set(10, 2.5, 10);
            this.player.rotation.y = Math.PI / 4; // 45 degrees
            this.direction = new THREE.Vector3(
                Math.sin(Math.PI / 4), 
                0, 
                Math.cos(Math.PI / 4)
            );
        } else if (characterType === 'C') {
            this.player.position.set(-10, 2.5, -10);
            this.player.rotation.y = -Math.PI / 4; // -45 degrees
            this.direction = new THREE.Vector3(
                Math.sin(-Math.PI / 4), 
                0, 
                Math.cos(-Math.PI / 4)
            );
        }
        
        this.scene.add(this.player);
        this.lastTrailPosition = this.player.position.clone();
        
        // Create HUD
        this.updateHUD();
    }
    
    updateHUD() {
        const hud = document.getElementById('game-hud');
        hud.innerHTML = `
            <div style="background-color: rgba(0, 0, 50, 0.7); padding: 10px; border-radius: 5px;">
                <div>Character: ${this.characters[this.playerCharacter].name}</div>
                <div>Ability Points: ${this.abilityPoints}</div>
                <div>Controls: A/D or ←/→ to turn, Space to use ability</div>
            </div>
        `;
    }
    
    setupEventListeners() {
        // Keyboard controls - simplified for Tron-style movement
        window.addEventListener('keydown', (e) => {
            switch (e.key) {
                case 'a': case 'ArrowLeft': 
                    this.controls.left = true; 
                    break;
                case 'd': case 'ArrowRight': 
                    this.controls.right = true; 
                    break;
                case ' ': 
                    this.useSpecialAbility(); 
                    break;
            }
        });
        
        window.addEventListener('keyup', (e) => {
            switch (e.key) {
                case 'a': case 'ArrowLeft': 
                    this.controls.left = false; 
                    break;
                case 'd': case 'ArrowRight': 
                    this.controls.right = false; 
                    break;
            }
        });
    }
    
    // Character selection, WebSocket connection, server message handling remain mostly the same
    showCharacterSelection() {
        // Create character selection UI
        const selectionDiv = document.createElement('div');
        selectionDiv.id = 'character-selection';
        selectionDiv.style.position = 'absolute';
        selectionDiv.style.width = '400px';
        selectionDiv.style.padding = '20px';
        selectionDiv.style.backgroundColor = 'rgba(0, 0, 50, 0.8)';
        selectionDiv.style.color = 'white';
        selectionDiv.style.borderRadius = '10px';
        selectionDiv.style.top = '50%';
        selectionDiv.style.left = '50%';
        selectionDiv.style.transform = 'translate(-50%, -50%)';
        
        selectionDiv.innerHTML = `
            <h2 style="text-align: center; color: #00aaff;">Select Your Speedster</h2>
            <div style="margin: 20px 0;">
                <div style="display: flex; margin-bottom: 20px; cursor: pointer; padding: 10px; border-radius: 5px;" 
                     onmouseover="this.style.backgroundColor='rgba(255, 0, 0, 0.3)'" 
                     onmouseout="this.style.backgroundColor='transparent'"
                     onclick="window.selectCharacter('A')">
                    <div style="width: 50px; height: 50px; background-color: red; border-radius: 50%;"></div>
                    <div style="margin-left: 15px;">
                        <h3 style="margin: 0;">Character A (Red)</h3>
                        <p style="margin: 5px 0;">Speed: 100%</p>
                        <p style="margin: 5px 0;">Special: Speed boost to 150% for 10 seconds</p>
                    </div>
                </div>
                
                <div style="display: flex; margin-bottom: 20px; cursor: pointer; padding: 10px; border-radius: 5px;" 
                     onmouseover="this.style.backgroundColor='rgba(255, 255, 0, 0.3)'" 
                     onmouseout="this.style.backgroundColor='transparent'"
                     onclick="window.selectCharacter('B')">
                    <div style="width: 50px; height: 50px; background-color: yellow; border-radius: 50%;"></div>
                    <div style="margin-left: 15px;">
                        <h3 style="margin: 0;">Character B (Yellow)</h3>
                        <p style="margin: 5px 0;">Speed: 102% (97% near Character A)</p>
                        <p style="margin: 5px 0;">Special: Reduces all others to 90% speed</p>
                    </div>
                </div>
                
                <div style="display: flex; margin-bottom: 20px; cursor: pointer; padding: 10px; border-radius: 5px;" 
                     onmouseover="this.style.backgroundColor='rgba(0, 255, 0, 0.3)'" 
                     onmouseout="this.style.backgroundColor='transparent'"
                     onclick="window.selectCharacter('C')">
                    <div style="width: 50px; height: 50px; background-color: green; border-radius: 50%;"></div>
                    <div style="margin-left: 15px;">
                        <h3 style="margin: 0;">Character C (Green)</h3>
                        <p style="margin: 5px 0;">Speed: Alternates 110% ↔ 90% every 10 seconds</p>
                        <p style="margin: 5px 0;">Special: Jump 10 meters into the air</p>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(selectionDiv);
        
        // Global function to handle selection
        window.selectCharacter = (char) => {
            this.connectToServer(char);
            document.body.removeChild(selectionDiv);
        };
    }
    
    connectToServer(characterType) {
        // Generate player ID and connect to WebSocket
        this.playerId = 'player_' + Math.random().toString(36).substring(2, 9);
        this.playerCharacter = characterType;
        
        // Create WebSocket connection - use explicit backend URL
        const wsUrl = `ws://localhost:8000/ws/${this.playerId}`;
        console.log(`Connecting to WebSocket at ${wsUrl}`);
        
        this.socket = new WebSocket(wsUrl);
        
        this.socket.onopen = () => {
            console.log('WebSocket connection established');
            // Send character selection
            this.socket.send(JSON.stringify({
                type: 'character_select',
                character: characterType
            }));
            
            // Create player character
            this.createPlayer(characterType);
            this.gameRunning = true;
        };
        
        this.socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            this.handleServerMessage(message);
        };
        
        this.socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
        
        this.socket.onclose = () => {
            console.log('WebSocket connection closed');
            // Maybe show reconnect option
        };
    }
    
    // Server messaging methods remain the same...
    
    // The key method that needs updating is updatePlayer():
    updatePlayer(delta) {
        if (!this.player || !this.gameRunning) return;
        
        // IMPORTANT: Calculate speed based on character
        let speed = this.baseSpeed * this.characters[this.playerCharacter].baseSpeed * delta;
        
        // Handle turning - now with 90-degree turns
        let turned = false;
        
        if ((this.controls.left || this.controls.right) && !this.controls.turning) {
            this.controls.turning = true;
            turned = true;
            
            // Calculate new direction based on turn
            if (this.controls.left) {
                // Turn left (counter-clockwise) - 90 degrees
                this.player.rotation.y += Math.PI / 2;
            } else if (this.controls.right) {
                // Turn right (clockwise) - 90 degrees
                this.player.rotation.y -= Math.PI / 2;
            }
            
            // Update direction vector based on new rotation
            this.direction = new THREE.Vector3(0, 0, 1);
            this.direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.player.rotation.y);
            
            // Create a trail segment at the turning point
            this.createTrail(true);
            
            // Reset turning flag when both keys are released
            if (!this.controls.left && !this.controls.right) {
                this.controls.turning = false;
            }
        } else if (!this.controls.left && !this.controls.right) {
            this.controls.turning = false;
        }
        
        // Always move forward in the current direction
        this.player.position.x += this.direction.x * speed;
        this.player.position.z += this.direction.z * speed;
        
        // Create trail periodically as the player moves
        const currentTime = Date.now();
        if (!this.lastTrailTime || currentTime - this.lastTrailTime > 100) { // Create trails every 100ms
            this.createTrail();
            this.lastTrailTime = currentTime;
        }
        
        // Update camera to follow player
        this.updateCamera();
        
        // Keep player within boundaries
        const halfGridSize = this.gridSize / 2;
        const prevX = this.player.position.x;
        const prevZ = this.player.position.z;
        
        this.player.position.x = Math.max(-halfGridSize + 5, Math.min(halfGridSize - 5, this.player.position.x));
        this.player.position.z = Math.max(-halfGridSize + 5, Math.min(halfGridSize - 5, this.player.position.z));
        
        // Check if player hit a wall
        if (prevX !== this.player.position.x || prevZ !== this.player.position.z) {
            // Player hit a wall - game over
            this.showGameOver("wall");
        }
    }
    
    createTrail(isTurn = false) {
        const currentPos = new THREE.Vector3().copy(this.player.position);
        
        // If this is our first trail or we've moved enough distance
        if (!this.lastTrailPosition || currentPos.distanceTo(this.lastTrailPosition) > 2 || isTurn) {
            // If we have a previous position, create a trail segment
            if (this.lastTrailPosition) {
                // Calculate distance and direction for the trail segment
                const distance = currentPos.distanceTo(this.lastTrailPosition);
                
                // Create visual trail segment
                const trailGeometry = new THREE.BoxGeometry(0.5, this.trailHeight, distance);
                const trailMaterial = new THREE.MeshStandardMaterial({
                    color: this.characters[this.playerCharacter].color,
                    emissive: new THREE.Color(this.characters[this.playerCharacter].color).multiplyScalar(0.5),
                    transparent: true,
                    opacity: 0.8
                });
                
                const trail = new THREE.Mesh(trailGeometry, trailMaterial);
                
                // Position and orient trail
                const direction = new THREE.Vector3().subVectors(currentPos, this.lastTrailPosition);
                const midpoint = new THREE.Vector3().addVectors(
                    this.lastTrailPosition,
                    direction.clone().multiplyScalar(0.5)
                );
                
                trail.position.set(midpoint.x, this.trailHeight/2, midpoint.z);
                trail.lookAt(currentPos.clone().setY(this.trailHeight/2));
                
                this.scene.add(trail);
                
                // Add to trails collection
                if (!this.trails[this.playerId]) {
                    this.trails[this.playerId] = [];
                }
                
                this.trails[this.playerId].push({
                    mesh: trail,
                    createdAt: Date.now(),
                    expiresAt: Date.now() + 60000 // 1 minute lifespan
                });
                
                // Send position update to server
                this.sendPositionUpdate();
            }
            
            // Update last trail position
            this.lastTrailPosition = currentPos.clone();
        }
    }
    
    // Camera, special abilities, and other methods remain largely the same...
    updateCamera() {
        // Position camera behind player
        const cameraOffset = this.direction.clone().multiplyScalar(-20);
        const targetPosition = new THREE.Vector3(
            this.player.position.x + cameraOffset.x,
            this.player.position.y + 15, // Height
            this.player.position.z + cameraOffset.z
        );
        
        this.camera.position.lerp(targetPosition, 0.1);
        this.camera.lookAt(this.player.position);
    }
    
    sendPositionUpdate() {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return;
        
        this.socket.send(JSON.stringify({
            type: 'position_update',
            position: [
                this.player.position.x,
                this.player.position.y,
                this.player.position.z
            ],
            rotation: this.player.rotation.y
        }));
    }
    
    handleServerMessage(message) {
        if (message.type === 'game_update') {
            // Update player data including ability points
            if (this.playerId in message.players) {
                const myData = message.players[this.playerId];
                this.abilityPoints = myData.ability_points;
                this.updateHUD();
            }
            
            // Update other players
            for (const playerId in message.players) {
                // Skip our own player, we handle it locally
                if (playerId === this.playerId) continue;
                
                const playerData = message.players[playerId];
                
                // Create or update other player
                if (!this.otherPlayers[playerId]) {
                    // Create new player mesh
                    const playerGeometry = new THREE.ConeGeometry(2, 5, 16);
                    const playerMaterial = new THREE.MeshStandardMaterial({
                        color: this.getPlayerColor(playerData.character),
                        emissive: this.getPlayerColor(playerData.character, 0.5)
                    });
                    
                    const playerMesh = new THREE.Mesh(playerGeometry, playerMaterial);
                    playerMesh.rotation.x = Math.PI / 2;
                    playerMesh.castShadow = true;
                    
                    // Add light to player
                    const playerLight = new THREE.PointLight(
                        this.getPlayerColor(playerData.character), 
                        1, 
                        20
                    );
                    playerLight.position.set(0, 3, 0);
                    playerMesh.add(playerLight);
                    
                    this.scene.add(playerMesh);
                    this.otherPlayers[playerId] = {
                        mesh: playerMesh,
                        lastPosition: new THREE.Vector3(
                            playerData.position[0],
                            playerData.position[1],
                            playerData.position[2]
                        )
                    };
                }
                
                // Update player position and rotation
                const position = playerData.position;
                const mesh = this.otherPlayers[playerId].mesh;
                
                // Set position
                mesh.position.set(position[0], position[1], position[2]);
                
                // Set rotation
                mesh.rotation.y = playerData.rotation;
            }
            
            // Handle player trail updates from server
            for (const playerId in message.trails) {
                if (playerId === this.playerId) continue; // Skip own trails
                
                // Process new trail segments
                const serverTrails = message.trails[playerId];
                
                if (!this.trails[playerId]) {
                    this.trails[playerId] = [];
                }
                
                // Find segments we haven't visualized yet
                for (const segment of serverTrails) {
                    // Skip if we already have this trail segment (simple check)
                    if (this.trails[playerId].some(t => 
                        t.serverData && 
                        t.serverData.created_at === segment.created_at
                    )) continue;
                    
                    // Create visual trail segment for the position
                    const trailGeometry = new THREE.BoxGeometry(0.5, this.trailHeight, 2);
                    const trailMaterial = new THREE.MeshStandardMaterial({
                        color: this.getPlayerColor(message.players[playerId]?.character || 'A'),
                        emissive: this.getPlayerColor(message.players[playerId]?.character || 'A', 0.5),
                        transparent: true,
                        opacity: 0.8
                    });
                    
                    const trail = new THREE.Mesh(trailGeometry, trailMaterial);
                    
                    // Position trail
                    const position = segment.position;
                    trail.position.set(position[0], this.trailHeight/2, position[2]);
                    
                    this.scene.add(trail);
                    
                    // Add to trails collection
                    this.trails[playerId].push({
                        mesh: trail,
                        serverData: segment
                    });
                }
            }
            
            // Handle game events
            if (message.event && message.event.type === 'player_killed') {
                const deadPlayerId = message.event.dead_player;
                const killerId = message.event.killer;
                
                // If we were killed
                if (deadPlayerId === this.playerId) {
                    this.showGameOver(killerId);
                }
                
                // Visual effect for killed player
                if (this.otherPlayers[deadPlayerId]) {
                    // Add explosion effect
                    this.createExplosion(this.otherPlayers[deadPlayerId].mesh.position);
                    
                    // Remove player mesh
                    this.scene.remove(this.otherPlayers[deadPlayerId].mesh);
                    delete this.otherPlayers[deadPlayerId];
                }
            }
        } else if (message.type === 'special_ability_response') {
            if (message.success) {
                // Show special ability effect
                if (this.playerCharacter === 'A') {
                    // Speed boost effect
                    this.createSpeedBoostEffect();
                } else if (this.playerCharacter === 'B') {
                    // Slow others effect
                    this.createSlowEffect();
                }
                // Character C's jump is handled locally
            }
        }
    }
    
    useSpecialAbility() {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN || !this.gameRunning) return;
        
        if (this.abilityPoints <= 0) {
            console.log("No ability points available");
            return;
        }
        
        console.log("Using special ability");
        this.socket.send(JSON.stringify({
            type: 'use_special'
        }));
        
        // For Character C, handle jump locally
        if (this.playerCharacter === 'C') {
            // Jump animation
            const jumpHeight = 10;
            const jumpDuration = 1.5; // seconds
            
            // Store original height
            const originalHeight = this.player.position.y;
            
            // Create jump animation
            const startTime = Date.now();
            
            const jumpAnimation = () => {
                const elapsedTime = (Date.now() - startTime) / 1000;
                
                if (elapsedTime < jumpDuration) {
                    // Parabolic jump
                    const jumpProgress = elapsedTime / jumpDuration;
                    const height = originalHeight + jumpHeight * Math.sin(jumpProgress * Math.PI);
                    
                    this.player.position.y = height;
                    requestAnimationFrame(jumpAnimation);
                } else {
                    // End jump
                    this.player.position.y = originalHeight;
                }
            };
            
            requestAnimationFrame(jumpAnimation);
        }
    }
    
    // Utility methods remain the same
    cleanExpiredTrails() {
        // Remove expired trail segments
        const currentTime = Date.now();
        
        for (const playerId in this.trails) {
            if (!this.trails[playerId]) continue;
            
            this.trails[playerId] = this.trails[playerId].filter(trail => {
                if (trail.expiresAt && trail.expiresAt < currentTime) {
                    // Remove from scene
                    this.scene.remove(trail.mesh);
                    return false;
                }
                return true;
            });
        }
    }
    
    // Helper function to get color based on character type
    getPlayerColor(characterType, multiplier = 1) {
        const colors = {
            'A': 0xff0000, // Red
            'B': 0xffff00, // Yellow
            'C': 0x00ff00  // Green
        };
        
        if (multiplier === 1) {
            return colors[characterType] || 0xffffff;
        } else {
            // For emissive color with multiplier
            return new THREE.Color(colors[characterType] || 0xffffff)
                .multiplyScalar(multiplier);
        }
    }
    
    // Effect methods remain the same
    createExplosion(position) {
        console.log("Explosion at", position);
        
        // Simple particle effect
        const particleCount = 50;
        const particles = new THREE.Group();
        
        for (let i = 0; i < particleCount; i++) {
            const size = Math.random() * 0.5 + 0.5;
            const particle = new THREE.Mesh(
                new THREE.SphereGeometry(size, 8, 8),
                new THREE.MeshBasicMaterial({
                    color: 0xffaa00,
                    transparent: true,
                    opacity: 0.8
                })
            );
            
            // Random position offset
            particle.position.set(
                position.x + (Math.random() - 0.5) * 2,
                position.y + (Math.random() - 0.5) * 2,
                position.z + (Math.random() - 0.5) * 2
            );
            
            // Random velocity
            particle.userData.velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 10,
                Math.random() * 10,
                (Math.random() - 0.5) * 10
            );
            
            particles.add(particle);
        }
        
        this.scene.add(particles);
        
        // Animate particles
        const startTime = Date.now();
        const duration = 1000; // 1 second
        
        const animateExplosion = () => {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / duration;
            
            if (progress < 1) {
                // Update each particle
                particles.children.forEach(particle => {
                    particle.position.add(particle.userData.velocity.clone().multiplyScalar(0.01));
                    particle.material.opacity = 0.8 * (1 - progress);
                });
                
                requestAnimationFrame(animateExplosion);
            } else {
                this.scene.remove(particles);
                particles.children.forEach(p => p.geometry.dispose());
            }
        };
        
        requestAnimationFrame(animateExplosion);
    }
    
    createSpeedBoostEffect() {
        console.log("Speed boost activated");
        
        // Add motion blur effect
        const speedLines = new THREE.Group();
        
        for (let i = 0; i < 10; i++) {
            const line = new THREE.Mesh(
                new THREE.BoxGeometry(0.1, 0.1, 10),
                new THREE.MeshBasicMaterial({
                    color: 0xff3333,
                    transparent: true,
                    opacity: 0.7
                })
            );
            
            // Position behind player
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 5 + 5;
            
            line.position.set(
                this.player.position.x + Math.cos(angle) * distance,
                this.player.position.y + Math.random() * 5,
                this.player.position.z + Math.sin(angle) * distance
            );
            
            // Random rotation
            line.rotation.y = Math.random() * Math.PI * 2;
            
            speedLines.add(line);
        }
        
        this.scene.add(speedLines);
        
        // Animate for 10 seconds
        const startTime = Date.now();
        const duration = 10000;
        
        const animateSpeedBoost = () => {
            const elapsed = Date.now() - startTime;
            
            if (elapsed < duration) {
                // Update speed lines
                speedLines.children.forEach(line => {
                    line.rotation.y += 0.1;
                    
                    // Follow player
                    const offset = this.direction.clone().multiplyScalar(-1 * (Math.random() * 5 + 5));
                    
                    line.position.x = this.player.position.x + offset.x;
                    line.position.z = this.player.position.z + offset.z;
                });
                
                requestAnimationFrame(animateSpeedBoost);
            } else {
                this.scene.remove(speedLines);
                speedLines.children.forEach(line => line.geometry.dispose());
            }
        };
        
        requestAnimationFrame(animateSpeedBoost);
    }
    
    createSlowEffect() {
        console.log("Slow effect activated");
        
        // Visual effect showing others being slowed
        const slowWave = new THREE.Mesh(
            new THREE.RingGeometry(1, 2, 32),
            new THREE.MeshBasicMaterial({
                color: 0xffff00,
                transparent: true,
                opacity: 0.5,
                side: THREE.DoubleSide
            })
        );
        
        slowWave.rotation.x = Math.PI / 2;
        slowWave.position.copy(this.player.position);
        
        this.scene.add(slowWave);
        
        // Animate wave expanding
        const startTime = Date.now();
        const duration = 2000; // 2 seconds for animation
        
        const animateSlowWave = () => {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / duration;
            
            if (progress < 1) {
                // Scale up ring
                const scale = 1 + progress * 30;
                slowWave.scale.set(scale, scale, 1);
                
                // Fade out
                slowWave.material.opacity = 0.5 * (1 - progress);
                
                requestAnimationFrame(animateSlowWave);
            } else {
                this.scene.remove(slowWave);
                slowWave.geometry.dispose();
                slowWave.material.dispose();
            }
        };
        
        requestAnimationFrame(animateSlowWave);
    }
    
    showGameOver(killerId) {
        this.gameRunning = false;
        
        // Create game over UI
        const gameOverDiv = document.createElement('div');
        gameOverDiv.className = 'game-over-screen';
        
        let message = "You were eliminated!";
        if (killerId === "wall") {
            message = "You crashed into a wall!";
        }
        
        gameOverDiv.innerHTML = `
            <h2>GAME OVER</h2>
            <p>${message}</p>
            <button onclick="location.reload()">
                Play Again
            </button>
        `;
        
        document.body.appendChild(gameOverDiv);
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        const delta = this.clock.getDelta();
        
        if (this.gameRunning) {
            this.updatePlayer(delta);
            this.cleanExpiredTrails();
            
            // Check for collisions with own trail
            this.checkSelfCollision();
            
            // Update other players with interpolation
            for (const playerId in this.otherPlayers) {
                const otherPlayer = this.otherPlayers[playerId];
                
                if (otherPlayer.mesh.userData.targetPosition) {
                    otherPlayer.mesh.position.lerp(otherPlayer.mesh.userData.targetPosition, 0.1);
                }
                
                if (otherPlayer.mesh.userData.targetRotation !== undefined) {
                    // Simple rotation interpolation
                    otherPlayer.mesh.rotation.y += 
                        (otherPlayer.mesh.userData.targetRotation - otherPlayer.mesh.rotation.y) * 0.1;
                }
            }
        }
        
        this.renderer.render(this.scene, this.camera);
    }
    
    // New method to check for collisions with own trail
    checkSelfCollision() {
        if (!this.player || !this.trails[this.playerId]) return;
        
        const playerPos = this.player.position;
        
        // Skip the most recent few segments to avoid false collisions
        const skipCount = 3;
        const trailSegments = this.trails[this.playerId].slice(0, -skipCount);
        
        for (const segment of trailSegments) {
            if (!segment.mesh) continue;
            
            // Get segment position and calculate rough distance
            const segPos = segment.mesh.position;
            
            // Simple box collision check (could be improved)
            const dx = Math.abs(playerPos.x - segPos.x);
            const dz = Math.abs(playerPos.z - segPos.z);
            
            if (dx < 1 && dz < 1) {
                // Collision with own trail
                this.showGameOver("self");
                break;
            }
        }
    }
}

// Start game when page loads
window.onload = () => {
    const game = new SpeedsterGame();
    game.init();
};