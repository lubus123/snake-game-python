export const GRID_SIZE = 20;
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;
export const GRID_WIDTH = CANVAS_WIDTH / GRID_SIZE;
export const GRID_HEIGHT = CANVAS_HEIGHT / GRID_SIZE;

export const COLORS = {
    BLACK: '#000000',
    WHITE: '#FFFFFF',
    GREEN: '#00FF00',
    BRIGHT_GREEN: '#32FF32',
    RED: '#FF0000',
    LIGHT_RED: '#FF6666',
    GOLD: '#FFD700',
    PURPLE: '#800080',
    MAGENTA: '#FF00FF',
    ORANGE: '#FFA500'
};

export const POWER_UP_TYPES = {
    SPEED: 'speed',
    GHOST: 'ghost',
    DOUBLE_POINTS: 'double_points',
    SHRINK: 'shrink'
};

export const GAME_CONFIG = {
    BASE_SPEED: 150,
    POWER_UP_SPAWN_MIN: 10000,
    POWER_UP_SPAWN_MAX: 20000,
    POWER_UP_DURATION: 15000,
    GHOST_DURATION: 5000,
    DOUBLE_POINTS_DURATION: 10000,
    SPEED_BOOST_DURATION: 5000
};