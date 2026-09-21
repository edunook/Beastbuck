const EMPTY_INPUT = {
  moveX: 0,
  jump: false,
  fire: false,
  aimX: 1,
  aimY: 0,
  weapon: 'pulse',
};

// Keys we must prevent default browser behaviour on (scrolling, etc.)
const GAME_KEYS = new Set([
  'Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
  'KeyW', 'KeyA', 'KeyS', 'KeyD',
  'Digit1', 'Digit2', 'Digit3',
]);

export class InputManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.keys = new Set();
    this.mouseDown = false;
    this.touchMoveX = 0;
    this.touchJump = false;
    this.touchFire = false;
    this.touchAim = { x: 1, y: 0 };
    this.pointer = { x: 1, y: 0 };
    this.weapon = 'pulse';
    this.enabled = true;

    // Bind handlers
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handlePointerMove = this.handlePointerMove.bind(this);
    this.handlePointerDown = this.handlePointerDown.bind(this);
    this.handlePointerUp = this.handlePointerUp.bind(this);
    this.handlePointerLeave = this.handlePointerLeave.bind(this);
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);

    // ── Critical: use capture:true so these fire BEFORE any modal/parent handler ──
    window.addEventListener('keydown', this.handleKeyDown, { capture: true });
    window.addEventListener('keyup', this.handleKeyUp, { capture: true });

    canvas.addEventListener('pointermove', this.handlePointerMove, { passive: false });
    canvas.addEventListener('pointerdown', this.handlePointerDown);
    canvas.addEventListener('pointerup', this.handlePointerUp);
    canvas.addEventListener('pointerleave', this.handlePointerLeave);
    window.addEventListener('pointerup', this.handlePointerUp);
    canvas.addEventListener('contextmenu', (event) => event.preventDefault());

    // Clear keys when tab/window goes hidden so we don't get stuck keys
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    window.addEventListener('blur', this.handleVisibilityChange);
  }

  handleKeyDown(event) {
    if (!this.enabled) return;

    // Always prevent default for game keys so browser doesn't scroll/etc.
    if (GAME_KEYS.has(event.code)) {
      event.preventDefault();
      event.stopPropagation(); // Stop parent modals from seeing this key
    }

    this.keys.add(event.code);

    if (event.code === 'Digit1') this.weapon = 'pulse';
    if (event.code === 'Digit2') this.weapon = 'bolt';
    if (event.code === 'Digit3') this.weapon = 'nova';
  }

  handleKeyUp(event) {
    if (GAME_KEYS.has(event.code)) {
      event.stopPropagation();
    }
    this.keys.delete(event.code);
  }

  handleVisibilityChange() {
    // Clear all held keys so nothing gets "stuck" when focus is lost
    this.keys.clear();
    this.mouseDown = false;
  }

  handlePointerMove(event) {
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    const length = Math.hypot(x, y) || 1;
    this.pointer = { x: x / length, y: y / length };
    event.preventDefault();
  }

  handlePointerDown(event) {
    if (event.pointerType !== 'touch') {
      this.mouseDown = true;
      this.canvas.focus();
    }
  }

  handlePointerUp(event) {
    if (event.pointerType !== 'touch') this.mouseDown = false;
  }

  handlePointerLeave(event) {
    if (event.pointerType !== 'touch') this.mouseDown = false;
  }

  setTouchMove(value) {
    this.touchMoveX = Math.max(-1, Math.min(1, value || 0));
  }

  setTouchJump(active) {
    this.touchJump = Boolean(active);
  }

  setTouchFire(active, aim = null) {
    this.touchFire = Boolean(active);
    if (aim && Number.isFinite(aim.x) && Number.isFinite(aim.y)) {
      const length = Math.hypot(aim.x, aim.y) || 1;
      this.touchAim = { x: aim.x / length, y: aim.y / length };
    }
  }

  snapshot() {
    const left = this.keys.has('KeyA') || this.keys.has('ArrowLeft');
    const right = this.keys.has('KeyD') || this.keys.has('ArrowRight');
    const moveX = this.touchMoveX || (right ? 1 : 0) - (left ? 1 : 0);
    const keyboardJump = this.keys.has('KeyW') || this.keys.has('Space') || this.keys.has('ArrowUp');
    const aim = this.touchFire ? this.touchAim : this.pointer;
    return {
      ...EMPTY_INPUT,
      moveX,
      jump: keyboardJump || this.touchJump,
      fire: this.mouseDown || this.touchFire,
      aimX: aim.x,
      aimY: aim.y,
      weapon: this.weapon,
      timestamp: Date.now(),
    };
  }

  destroy() {
    window.removeEventListener('keydown', this.handleKeyDown, { capture: true });
    window.removeEventListener('keyup', this.handleKeyUp, { capture: true });
    this.canvas.removeEventListener('pointermove', this.handlePointerMove);
    this.canvas.removeEventListener('pointerdown', this.handlePointerDown);
    this.canvas.removeEventListener('pointerup', this.handlePointerUp);
    this.canvas.removeEventListener('pointerleave', this.handlePointerLeave);
    window.removeEventListener('pointerup', this.handlePointerUp);
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    window.removeEventListener('blur', this.handleVisibilityChange);
  }
}

export function normalizeInput(input = {}) {
  const aimLength = Math.hypot(input.aimX || 0, input.aimY || 0) || 1;
  return {
    moveX: Math.max(-1, Math.min(1, Number(input.moveX) || 0)),
    jump: Boolean(input.jump),
    fire: Boolean(input.fire),
    aimX: (Number(input.aimX) || 1) / aimLength,
    aimY: (Number(input.aimY) || 0) / aimLength,
    weapon: ['pulse', 'bolt', 'nova'].includes(input.weapon) ? input.weapon : 'pulse',
    timestamp: Number(input.timestamp) || Date.now(),
  };
}
