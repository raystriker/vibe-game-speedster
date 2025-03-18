from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import json
import uuid
import asyncio
import time
from typing import Dict, List

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Game state management
class GameState:
    def __init__(self):
        self.players = {}  # Store player data
        self.trails = {}   # Store trail segments
        self.active_connections = {}  # Active WebSocket connections
        
    def add_player(self, player_id: str, character_type: str):
        # Initialize player based on character type
        if character_type == "A":  # Red character
            self.players[player_id] = {
                "id": player_id,
                "character": "A",
                "position": [0, 2.5, 0],
                "rotation": 0,
                "speed": 100,
                "base_speed": 100,
                "color": "red",
                "ability_points": 0,
                "special_active": False,
                "special_end_time": 0,
                "alive": True
            }
        elif character_type == "B":  # Yellow character
            self.players[player_id] = {
                "id": player_id,
                "character": "B",
                "position": [10, 2.5, 10],
                "rotation": 0,
                "speed": 102,
                "base_speed": 102,
                "color": "yellow",
                "ability_points": 0,
                "special_active": False,
                "special_end_time": 0,
                "alive": True
            }
        elif character_type == "C":  # Green character
            self.players[player_id] = {
                "id": player_id,
                "character": "C",
                "position": [-10, 2.5, -10],
                "rotation": 0,
                "speed": 110,  # Starts in fast phase
                "base_speed": 100,
                "color": "green",
                "ability_points": 0,
                "special_active": False,
                "speed_phase_change_time": int(time.time()) + 10,
                "speed_phase": "fast",
                "alive": True
            }
        
        self.trails[player_id] = []
        
    def update_player(self, player_id: str, data: dict):
        if player_id in self.players:
            # Update position and rotation
            for key in ["position", "rotation"]:
                if key in data:
                    self.players[player_id][key] = data[key]
    
    def add_trail_segment(self, player_id: str, position: List[float]):
        if player_id in self.trails:
            # Add trail segment with expiration time
            current_time = int(time.time())
            self.trails[player_id].append({
                "position": position,
                "created_at": current_time,
                "expires_at": current_time + 60  # 1 minute lifespan
            })
    
    def check_collisions(self):
        # Basic collision detection
        for player_id, player in self.players.items():
            if not player["alive"]:
                continue
            
            player_pos = player["position"]
            
            for trail_owner, trail_segments in self.trails.items():
                if trail_owner == player_id:
                    continue  # Skip own trail
                
                for segment in trail_segments:
                    trail_pos = segment["position"]
                    # Simple distance-based collision
                    distance = ((player_pos[0] - trail_pos[0])**2 + 
                               (player_pos[2] - trail_pos[2])**2)**0.5
                    
                    if distance < 1.0:  # Collision detected
                        self.players[player_id]["alive"] = False
                        
                        # Award ability point to trail owner
                        if trail_owner in self.players and self.players[trail_owner]["alive"]:
                            self.players[trail_owner]["ability_points"] += 1
                        
                        return player_id, trail_owner
        
        return None, None
    
    def use_special_ability(self, player_id: str):
        if player_id not in self.players or self.players[player_id]["ability_points"] <= 0:
            return False
        
        player = self.players[player_id]
        player["ability_points"] -= 1
        player["special_active"] = True
        current_time = int(time.time())
        
        # Apply character-specific special abilities
        if player["character"] == "A":
            # Speed boost 150% for 10 seconds
            player["speed"] = player["base_speed"] * 1.5
            player["special_end_time"] = current_time + 10
        
        elif player["character"] == "B":
            # Slow others to 90%
            for other_id, other_player in self.players.items():
                if other_id != player_id:
                    other_player["speed"] = other_player["base_speed"] * 0.9
            player["special_end_time"] = current_time + 10
        
        elif player["character"] == "C":
            # Jump (handled mainly by client)
            player["special_end_time"] = current_time + 2
        
        return True
    
    def update_special_abilities(self):
        current_time = int(time.time())
        
        for player_id, player in self.players.items():
            # Check and end special abilities
            if player["special_active"] and current_time > player["special_end_time"]:
                player["special_active"] = False
                
                # Reset speeds after ability ends
                if player["character"] == "A":
                    player["speed"] = player["base_speed"]
                elif player["character"] == "B":
                    # Reset all slowed players
                    for other_id, other_player in self.players.items():
                        if other_id != player_id:
                            other_player["speed"] = other_player["base_speed"]
                
            # Handle Character C's speed alternation
            if player["character"] == "C" and "speed_phase_change_time" in player:
                if current_time > player["speed_phase_change_time"]:
                    if player["speed_phase"] == "fast":
                        player["speed"] = player["base_speed"] * 0.9
                        player["speed_phase"] = "slow"
                    else:
                        player["speed"] = player["base_speed"] * 1.1
                        player["speed_phase"] = "fast"
                    
                    player["speed_phase_change_time"] = current_time + 10
    
    def apply_character_b_proximity(self):
        # Apply Character B's proximity effect on Character A
        char_a_players = {id: p for id, p in self.players.items() if p["character"] == "A"}
        char_b_players = {id: p for id, p in self.players.items() if p["character"] == "B"}
        
        for a_id, a_player in char_a_players.items():
            a_pos = a_player["position"]
            
            # Reset to base speed initially
            if not a_player["special_active"]:  # Don't reset if special is active
                a_player["speed"] = a_player["base_speed"]
            
            # Check proximity to any Character B
            for b_id, b_player in char_b_players.items():
                b_pos = b_player["position"]
                
                # Calculate distance
                distance = ((a_pos[0] - b_pos[0])**2 + (a_pos[2] - b_pos[2])**2)**0.5
                
                # Apply effect if within range (20 units)
                if distance < 20:
                    if not a_player["special_active"]:  # Don't affect if special is active
                        a_player["speed"] = a_player["base_speed"] * 0.97
                    break
    
    def clean_expired_trails(self):
        current_time = int(time.time())
        
        for player_id in self.trails:
            self.trails[player_id] = [
                segment for segment in self.trails[player_id]
                if segment["expires_at"] > current_time
            ]
        
# Create game state instance
game_state = GameState()

# WebSocket endpoint
@app.websocket("/ws/{player_id}")
async def websocket_endpoint(websocket: WebSocket, player_id: str):
    await websocket.accept()
    print(f"WebSocket connection accepted for player {player_id}")
    
    try:
        # Wait for character selection
        initial_data = await websocket.receive_text()
        print(f"Received initial data from {player_id}: {initial_data}")
        data = json.loads(initial_data)
        
        if "character" in data and data["character"] in ["A", "B", "C"]:
            character_type = data["character"]
            print(f"Player {player_id} selected character {character_type}")
            
            # Add player to game
            game_state.add_player(player_id, character_type)
            game_state.active_connections[player_id] = websocket
            
            # Main game loop for this player
            while True:
                message = await websocket.receive_text()
                data = json.loads(message)
                
                if data["type"] == "position_update":
                    # Update player position
                    game_state.update_player(player_id, {
                        "position": data["position"],
                        "rotation": data["rotation"]
                    })
                    
                    # Add trail segment
                    game_state.add_trail_segment(player_id, data["position"])
                
                elif data["type"] == "use_special":
                    # Attempt to use special ability
                    success = game_state.use_special_ability(player_id)
                    await websocket.send_text(json.dumps({
                        "type": "special_ability_response",
                        "success": success
                    }))
                    
    except WebSocketDisconnect:
        print(f"WebSocket disconnect for player {player_id}")
        # Clean up on disconnect
        if player_id in game_state.active_connections:
            del game_state.active_connections[player_id]
        # Remove player from game
        if player_id in game_state.players:
            del game_state.players[player_id]
        if player_id in game_state.trails:
            del game_state.trails[player_id]
    except Exception as e:
        print(f"Error for player {player_id}: {str(e)}")
        if player_id in game_state.active_connections:
            del game_state.active_connections[player_id]
        if player_id in game_state.players:
            del game_state.players[player_id]
        if player_id in game_state.trails:
            del game_state.trails[player_id]

# Game update task that runs in the background
@app.on_event("startup")
async def startup_event():
    asyncio.create_task(game_loop())

async def game_loop():
    while True:
        # Process game logic
        game_state.update_special_abilities()
        game_state.apply_character_b_proximity()
        game_state.clean_expired_trails()
        
        # Check for collisions
        dead_player, killer = game_state.check_collisions()
        
        # Send game state to all players
        if game_state.active_connections:
            game_update = {
                "type": "game_update",
                "players": game_state.players,
                "trails": game_state.trails
            }
            
            if dead_player:
                game_update["event"] = {
                    "type": "player_killed",
                    "dead_player": dead_player,
                    "killer": killer
                }
            
            try:
                await asyncio.gather(
                    *[ws.send_text(json.dumps(game_update)) 
                      for ws in game_state.active_connections.values()]
                )
            except Exception as e:
                print(f"Error sending game update: {str(e)}")
        
        # Run at approximately 30 fps
        await asyncio.sleep(1/144)