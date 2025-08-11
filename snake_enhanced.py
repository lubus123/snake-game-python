import pygame
import random
import sys
import math
import time

pygame.init()

WINDOW_WIDTH = 800
WINDOW_HEIGHT = 600
GRID_SIZE = 20
GRID_WIDTH = WINDOW_WIDTH // GRID_SIZE
GRID_HEIGHT = WINDOW_HEIGHT // GRID_SIZE

BLACK = (0, 0, 0)
WHITE = (255, 255, 255)
GREEN = (0, 255, 0)
BRIGHT_GREEN = (50, 255, 50)
RED = (255, 0, 0)
BLUE = (0, 0, 255)
GOLD = (255, 215, 0)
PURPLE = (128, 0, 128)
CYAN = (0, 255, 255)
ORANGE = (255, 165, 0)

class Particle:
    def __init__(self, x, y, color, velocity_x=None, velocity_y=None):
        self.x = x
        self.y = y
        self.color = color
        self.velocity_x = velocity_x if velocity_x else random.uniform(-3, 3)
        self.velocity_y = velocity_y if velocity_y else random.uniform(-3, 3)
        self.life = 30
        self.max_life = 30
        self.size = random.uniform(2, 5)
    
    def update(self):
        self.x += self.velocity_x
        self.y += self.velocity_y
        self.velocity_y += 0.1
        self.life -= 1
        return self.life > 0
    
    def draw(self, screen):
        alpha = int(255 * (self.life / self.max_life))
        color_with_alpha = (*self.color, alpha)
        surf = pygame.Surface((self.size * 2, self.size * 2), pygame.SRCALPHA)
        pygame.draw.circle(surf, color_with_alpha, (self.size, self.size), self.size)
        screen.blit(surf, (self.x - self.size, self.y - self.size))

class PowerUp:
    def __init__(self):
        self.position = self.generate_position()
        self.type = random.choice(['speed', 'slow', 'ghost', 'double_points', 'shrink'])
        self.spawn_time = time.time()
        self.duration = 15
        
    def generate_position(self):
        return (random.randint(0, GRID_WIDTH - 1), random.randint(0, GRID_HEIGHT - 1))
    
    def is_expired(self):
        return time.time() - self.spawn_time > self.duration
    
    def get_color(self):
        colors = {
            'speed': GOLD,
            'slow': CYAN,
            'ghost': PURPLE,
            'double_points': (255, 0, 255),
            'shrink': ORANGE
        }
        return colors.get(self.type, WHITE)
    
    def draw(self, screen):
        rect = pygame.Rect(self.position[0] * GRID_SIZE, self.position[1] * GRID_SIZE, GRID_SIZE, GRID_SIZE)
        color = self.get_color()
        
        glow_intensity = abs(math.sin(time.time() * 5)) * 100 + 155
        glow_color = tuple(min(255, int(c * glow_intensity / 255)) for c in color)
        
        pygame.draw.ellipse(screen, glow_color, rect)
        
        inner_rect = pygame.Rect(rect.x + 3, rect.y + 3, rect.width - 6, rect.height - 6)
        pygame.draw.ellipse(screen, color, inner_rect)
        
        font = pygame.font.Font(None, 16)
        symbols = {
            'speed': '>>',
            'slow': '<<',
            'ghost': '👻',
            'double_points': 'x2',
            'shrink': '--'
        }
        text = font.render(symbols.get(self.type, '?'), True, WHITE)
        text_rect = text.get_rect(center=rect.center)
        screen.blit(text, text_rect)

class Snake:
    def __init__(self):
        self.positions = [(GRID_WIDTH // 2, GRID_HEIGHT // 2)]
        self.direction = (1, 0)
        self.grow = False
        self.speed_multiplier = 1.0
        self.ghost_mode = False
        self.ghost_end_time = 0
        self.double_points = False
        self.double_points_end_time = 0
        self.trail_positions = []
        
    def move(self):
        head = self.positions[0]
        new_head = (head[0] + self.direction[0], head[1] + self.direction[1])
        
        self.trail_positions.append((head[0] * GRID_SIZE + GRID_SIZE // 2, 
                                   head[1] * GRID_SIZE + GRID_SIZE // 2))
        if len(self.trail_positions) > 10:
            self.trail_positions.pop(0)
        
        if not self.ghost_mode:
            if new_head[0] < 0 or new_head[0] >= GRID_WIDTH or new_head[1] < 0 or new_head[1] >= GRID_HEIGHT:
                return False
            if new_head in self.positions:
                return False
        else:
            new_head = (new_head[0] % GRID_WIDTH, new_head[1] % GRID_HEIGHT)
        
        self.positions.insert(0, new_head)
        
        if not self.grow:
            self.positions.pop()
        else:
            self.grow = False
        
        self.update_power_ups()
        return True
    
    def update_power_ups(self):
        current_time = time.time()
        
        if self.ghost_mode and current_time > self.ghost_end_time:
            self.ghost_mode = False
        
        if self.double_points and current_time > self.double_points_end_time:
            self.double_points = False
    
    def change_direction(self, direction):
        if (direction[0] * -1, direction[1] * -1) != self.direction:
            self.direction = direction
    
    def grow_snake(self):
        self.grow = True
    
    def shrink(self):
        if len(self.positions) > 3:
            half_length = len(self.positions) // 2
            self.positions = self.positions[:half_length]
    
    def apply_power_up(self, power_type):
        current_time = time.time()
        
        if power_type == 'speed':
            self.speed_multiplier = 2.0
        elif power_type == 'slow':
            self.speed_multiplier = 0.5
        elif power_type == 'ghost':
            self.ghost_mode = True
            self.ghost_end_time = current_time + 5
        elif power_type == 'double_points':
            self.double_points = True
            self.double_points_end_time = current_time + 10
        elif power_type == 'shrink':
            self.shrink()
    
    def draw(self, screen):
        for i, position in enumerate(self.positions):
            rect = pygame.Rect(position[0] * GRID_SIZE, position[1] * GRID_SIZE, GRID_SIZE, GRID_SIZE)
            
            if i == 0:
                color = BRIGHT_GREEN if not self.ghost_mode else (PURPLE[0], PURPLE[1], PURPLE[2], 128)
                glow_rect = pygame.Rect(rect.x - 2, rect.y - 2, rect.width + 4, rect.height + 4)
                pygame.draw.rect(screen, color, glow_rect)
            else:
                alpha = 255 - (i * 10) if not self.ghost_mode else 100
                alpha = max(50, alpha)
                color = (*GREEN, alpha) if not self.ghost_mode else (*PURPLE, alpha)
            
            if self.ghost_mode:
                surf = pygame.Surface((GRID_SIZE, GRID_SIZE), pygame.SRCALPHA)
                pygame.draw.rect(surf, (*color[:3], 100), (0, 0, GRID_SIZE, GRID_SIZE))
                screen.blit(surf, rect.topleft)
            else:
                pygame.draw.rect(screen, color[:3], rect)
            
            pygame.draw.rect(screen, BLACK, rect, 1)
        
        for i, pos in enumerate(self.trail_positions):
            alpha = int(50 * (i / len(self.trail_positions)))
            trail_surf = pygame.Surface((6, 6), pygame.SRCALPHA)
            pygame.draw.circle(trail_surf, (0, 255, 0, alpha), (3, 3), 3)
            screen.blit(trail_surf, (pos[0] - 3, pos[1] - 3))

class Food:
    def __init__(self):
        self.position = self.generate_position()
        self.pulse_time = 0
        
    def generate_position(self):
        return (random.randint(0, GRID_WIDTH - 1), random.randint(0, GRID_HEIGHT - 1))
    
    def draw(self, screen):
        self.pulse_time += 0.2
        pulse = abs(math.sin(self.pulse_time)) * 5
        
        rect = pygame.Rect(self.position[0] * GRID_SIZE - pulse, 
                          self.position[1] * GRID_SIZE - pulse, 
                          GRID_SIZE + pulse * 2, GRID_SIZE + pulse * 2)
        
        pygame.draw.ellipse(screen, RED, rect)
        
        inner_rect = pygame.Rect(self.position[0] * GRID_SIZE + 3, 
                                self.position[1] * GRID_SIZE + 3, 
                                GRID_SIZE - 6, GRID_SIZE - 6)
        pygame.draw.ellipse(screen, (255, 100, 100), inner_rect)

class Game:
    def __init__(self):
        self.screen = pygame.display.set_mode((WINDOW_WIDTH, WINDOW_HEIGHT))
        pygame.display.set_caption("Snake Enhanced - Power-Up Edition!")
        self.clock = pygame.time.Clock()
        self.snake = Snake()
        self.food = Food()
        self.power_ups = []
        self.particles = []
        self.score = 0
        self.font = pygame.font.Font(None, 36)
        self.small_font = pygame.font.Font(None, 24)
        self.last_power_up_spawn = time.time()
        
    def spawn_power_up(self):
        if time.time() - self.last_power_up_spawn > random.uniform(10, 20):
            power_up = PowerUp()
            while power_up.position in self.snake.positions or power_up.position == self.food.position:
                power_up.position = power_up.generate_position()
            self.power_ups.append(power_up)
            self.last_power_up_spawn = time.time()
    
    def create_explosion(self, x, y, color, count=15):
        for _ in range(count):
            particle = Particle(x, y, color)
            self.particles.append(particle)
    
    def handle_events(self):
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                return False
            elif event.type == pygame.KEYDOWN:
                if event.key == pygame.K_UP:
                    self.snake.change_direction((0, -1))
                elif event.key == pygame.K_DOWN:
                    self.snake.change_direction((0, 1))
                elif event.key == pygame.K_LEFT:
                    self.snake.change_direction((-1, 0))
                elif event.key == pygame.K_RIGHT:
                    self.snake.change_direction((1, 0))
        return True
    
    def update(self):
        if not self.snake.move():
            return False
        
        if self.snake.positions[0] == self.food.position:
            self.snake.grow_snake()
            
            points = 10
            if self.snake.double_points:
                points *= 2
            self.score += points
            
            food_x = self.food.position[0] * GRID_SIZE + GRID_SIZE // 2
            food_y = self.food.position[1] * GRID_SIZE + GRID_SIZE // 2
            self.create_explosion(food_x, food_y, RED, 20)
            
            while self.food.position in self.snake.positions:
                self.food.position = self.food.generate_position()
        
        for power_up in self.power_ups[:]:
            if self.snake.positions[0] == power_up.position:
                self.snake.apply_power_up(power_up.type)
                
                power_x = power_up.position[0] * GRID_SIZE + GRID_SIZE // 2
                power_y = power_up.position[1] * GRID_SIZE + GRID_SIZE // 2
                self.create_explosion(power_x, power_y, power_up.get_color(), 25)
                
                self.power_ups.remove(power_up)
            elif power_up.is_expired():
                self.power_ups.remove(power_up)
        
        self.spawn_power_up()
        
        self.particles = [p for p in self.particles if p.update()]
        
        return True
    
    def draw(self):
        self.screen.fill(BLACK)
        
        for particle in self.particles:
            particle.draw(self.screen)
        
        self.snake.draw(self.screen)
        self.food.draw(self.screen)
        
        for power_up in self.power_ups:
            power_up.draw(self.screen)
        
        score_text = self.font.render(f"Score: {self.score}", True, WHITE)
        self.screen.blit(score_text, (10, 10))
        
        y_offset = 50
        if self.snake.ghost_mode:
            ghost_text = self.small_font.render("👻 GHOST MODE", True, PURPLE)
            self.screen.blit(ghost_text, (10, y_offset))
            y_offset += 25
        
        if self.snake.double_points:
            double_text = self.small_font.render("⚡ DOUBLE POINTS", True, (255, 0, 255))
            self.screen.blit(double_text, (10, y_offset))
            y_offset += 25
        
        if self.snake.speed_multiplier != 1.0:
            speed_text = "🚀 SPEED BOOST" if self.snake.speed_multiplier > 1 else "🐌 SLOW MOTION"
            color = GOLD if self.snake.speed_multiplier > 1 else CYAN
            speed_display = self.small_font.render(speed_text, True, color)
            self.screen.blit(speed_display, (10, y_offset))
        
        pygame.display.flip()
    
    def game_over_screen(self):
        game_over_text = self.font.render("Game Over!", True, WHITE)
        final_score_text = self.font.render(f"Final Score: {self.score}", True, WHITE)
        restart_text = self.font.render("Press SPACE to restart or ESC to quit", True, WHITE)
        
        game_over_rect = game_over_text.get_rect(center=(WINDOW_WIDTH // 2, WINDOW_HEIGHT // 2 - 50))
        final_score_rect = final_score_text.get_rect(center=(WINDOW_WIDTH // 2, WINDOW_HEIGHT // 2))
        restart_rect = restart_text.get_rect(center=(WINDOW_WIDTH // 2, WINDOW_HEIGHT // 2 + 50))
        
        self.screen.fill(BLACK)
        self.screen.blit(game_over_text, game_over_rect)
        self.screen.blit(final_score_text, final_score_rect)
        self.screen.blit(restart_text, restart_rect)
        pygame.display.flip()
    
    def run(self):
        running = True
        game_over = False
        
        while running:
            if not game_over:
                if not self.handle_events():
                    running = False
                    continue
                
                if not self.update():
                    game_over = True
                    continue
                
                self.draw()
                base_speed = 10
                actual_speed = base_speed * self.snake.speed_multiplier
                self.clock.tick(actual_speed)
            else:
                for event in pygame.event.get():
                    if event.type == pygame.QUIT:
                        running = False
                    elif event.type == pygame.KEYDOWN:
                        if event.key == pygame.K_SPACE:
                            self.snake = Snake()
                            self.food = Food()
                            self.power_ups = []
                            self.particles = []
                            self.score = 0
                            self.last_power_up_spawn = time.time()
                            game_over = False
                        elif event.key == pygame.K_ESCAPE:
                            running = False
                
                self.game_over_screen()
        
        pygame.quit()
        sys.exit()

if __name__ == "__main__":
    game = Game()
    game.run()