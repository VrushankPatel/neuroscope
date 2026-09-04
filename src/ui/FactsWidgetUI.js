import { BRAIN_FACTS } from '../data/factsData.js';

export class FactsWidgetUI {
  constructor() {
    this.widget = document.getElementById('facts-widget');
    this.textElement = document.getElementById('fact-text');
    this.facts = BRAIN_FACTS;
    this.currentIndex = -1;
    this.intervalId = null;

    if (this.widget && this.textElement) {
      this.showRandomFact();
      this.startCycle();
    }
  }

  showRandomFact() {
    if (!this.textElement) return;
    
    // Pick a random fact
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * this.facts.length);
    } while (newIndex === this.currentIndex && this.facts.length > 1);
    
    this.currentIndex = newIndex;
    
    // Fade out, change text, fade in
    this.textElement.style.opacity = 0;
    setTimeout(() => {
      this.textElement.textContent = this.facts[this.currentIndex];
      this.textElement.style.opacity = 1;
    }, 500); // Wait for fade out transition (if defined in css, otherwise just wait)
  }

  startCycle() {
    // Change fact every 10 seconds
    this.intervalId = setInterval(() => {
      this.showRandomFact();
    }, 10000);
  }
}
