// Keys for storing settings in local storage
const CENTERING_KEY = "centeringEnable";
const SPEED_KEY = "animationSpeed";

// Get the centering setting (default: true)
export function getCenteringSetting(): boolean {
    return localStorage.getItem(CENTERING_KEY) !== "false";
}

// Set the centering setting
export function setCenteringSetting(val: boolean): void {
    localStorage.setItem(CENTERING_KEY, JSON.stringify(val));
}

// Get the animation speed (default: 400)
export function getAnimationSpeed(): number {
    const value = localStorage.getItem(SPEED_KEY);
    return value ? parseInt(value) : 400;
}

// Set the animation speed
export function setAnimationSpeed(val: number): void {
    localStorage.setItem(SPEED_KEY, val.toString());
}
