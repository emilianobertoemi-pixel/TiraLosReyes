// src/audio/AudioManager.js

class AudioManager {
  constructor() {
    this.volume = 0.4;
    this.muted = false;

    this.sounds = {
      cardPlay: new Audio("/assets/audio/card_play.mp3"),
      cardDeal: new Audio("/assets/audio/card_deal.mp3"),

      truco: new Audio("/assets/audio/truco.mp3"),
      retruco: new Audio("/assets/audio/quiero-re-truco.mp3"),
      valeCuatro: new Audio("/assets/audio/quiero-vale-cuatro.mp3"),

      quiero: new Audio("/assets/audio/quiero.mp3"),
      noQuiero: new Audio("/assets/audio/no-quiero.mp3"),
      mazo: new Audio("/assets/audio/me-voy-al-mazo.mp3"),
    };

    // configuración inicial
    Object.values(this.sounds).forEach((audio) => {
      audio.volume = this.volume;
      audio.preload = "auto";
    });
  }

  play(name) {
    if (this.muted) return;
    const sound = this.sounds[name];
    if (!sound) return;

    sound.currentTime = 0;
    sound.play().catch(() => {});
  }

  setVolume(value) {
    this.volume = value;
    Object.values(this.sounds).forEach((audio) => {
      audio.volume = value;
    });
  }

  mute(toggle = true) {
    this.muted = toggle;
  }

  toggleMute() {
    this.muted = !this.muted;
  }
}

// 🔥 exportamos UNA sola instancia (singleton)
const audioManager = new AudioManager();
export default audioManager;
