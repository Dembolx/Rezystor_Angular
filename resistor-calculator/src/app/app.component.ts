import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
  animations: [
    trigger('bandAnimation', [
      transition(':enter', [
        style({ transform: 'scaleY(0.5)', opacity: 0 }),
        animate(
          '300ms ease-out',
          style({ transform: 'scaleY(1)', opacity: 1 })
        ),
      ]),
    ]),
  ],
})
export class AppComponent {
  bandCount: number = 4;
  bands: any = {
    band1: 'brown',
    band2: 'black',
    band3: 'red',
    multiplier: 'red',
    tolerance: 'gold',
    tempCoeff: 'brown',
  };
  result: any = {
    resistance: 0,
    tolerance: 0,
    tempCoeff: null,
    formatted: '',
  };

  // Changed from private to public
  public colorCodes: any = {
    black: { value: 0, multiplier: 1, tolerance: null, tempCoeff: 250 },
    brown: { value: 1, multiplier: 10, tolerance: 1, tempCoeff: 100 },
    red: { value: 2, multiplier: 100, tolerance: 2, tempCoeff: 50 },
    orange: { value: 3, multiplier: 1000, tolerance: null, tempCoeff: 15 },
    yellow: { value: 4, multiplier: 10000, tolerance: null, tempCoeff: 25 },
    green: { value: 5, multiplier: 100000, tolerance: 0.5, tempCoeff: 20 },
    blue: { value: 6, multiplier: 1000000, tolerance: 0.25, tempCoeff: 10 },
    violet: { value: 7, multiplier: 10000000, tolerance: 0.1, tempCoeff: 5 },
    gray: { value: 8, multiplier: 100000000, tolerance: 0.05, tempCoeff: null },
    white: {
      value: 9,
      multiplier: 1000000000,
      tolerance: null,
      tempCoeff: null,
    },
    gold: { value: null, multiplier: 0.1, tolerance: 5, tempCoeff: null },
    silver: { value: null, multiplier: 0.01, tolerance: 10, tempCoeff: null },
    none: { value: null, multiplier: null, tolerance: 20, tempCoeff: null },
  };

  // Changed from private to public
  public bandOptions: any = {
    3: ['band1', 'band2', 'multiplier', 'tolerance'],
    4: ['band1', 'band2', 'multiplier', 'tolerance'],
    5: ['band1', 'band2', 'band3', 'multiplier', 'tolerance'],
    6: ['band1', 'band2', 'band3', 'multiplier', 'tolerance', 'tempCoeff'],
  };

  constructor() {
    this.calculate();
  }

  onBandCountChange() {
    this.calculate();
  }

  onColorChange() {
    this.calculate();
  }

  calculate() {
    const bandConfig = this.bandOptions[this.bandCount];

    if (bandConfig.includes('band1') && bandConfig.includes('band2')) {
      let significantDigits =
        this.colorCodes[this.bands.band1].value * 10 +
        this.colorCodes[this.bands.band2].value;

      if (bandConfig.includes('band3')) {
        significantDigits =
          significantDigits * 10 + this.colorCodes[this.bands.band3].value;
      }

      this.result.resistance =
        significantDigits * this.colorCodes[this.bands.multiplier].multiplier;
    }

    if (bandConfig.includes('tolerance')) {
      this.result.tolerance = this.colorCodes[this.bands.tolerance].tolerance;
    }

    if (bandConfig.includes('tempCoeff')) {
      this.result.tempCoeff = this.colorCodes[this.bands.tempCoeff].tempCoeff;
    }

    this.result.formatted = this.formatResistance(this.result.resistance);
  }

  formatResistance(value: number): string {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(2) + ' MΩ';
    } else if (value >= 1000) {
      return (value / 1000).toFixed(2) + ' kΩ';
    } else {
      return value.toFixed(2) + ' Ω';
    }
  }

  getAvailableColors(bandType: string): string[] {
    const colors = Object.keys(this.colorCodes);

    if (bandType === 'band1' || bandType === 'band2' || bandType === 'band3') {
      return colors.filter((color) => this.colorCodes[color].value !== null);
    } else if (bandType === 'multiplier') {
      return colors.filter(
        (color) => this.colorCodes[color].multiplier !== null
      );
    } else if (bandType === 'tolerance') {
      return colors.filter(
        (color) => this.colorCodes[color].tolerance !== null
      );
    } else if (bandType === 'tempCoeff') {
      return colors.filter(
        (color) => this.colorCodes[color].tempCoeff !== null
      );
    }

    return colors;
  }

  getActiveBands(): string[] {
    return this.bandOptions[this.bandCount];
  }

  getBandLabel(bandType: string): string {
    const labels: any = {
      band1: '1st Digit',
      band2: '2nd Digit',
      band3: '3rd Digit',
      multiplier: 'Multiplier',
      tolerance: 'Tolerance',
      tempCoeff: 'Temp. Coefficient',
    };
    return labels[bandType] || bandType;
  }

  getColorStyle(color: string): string {
    const colors: any = {
      black: '#000000',
      brown: '#964B00',
      red: '#FF0000',
      orange: '#FFA500',
      yellow: '#FFFF00',
      green: '#00FF00',
      blue: '#0000FF',
      violet: '#EE82EE',
      gray: '#808080',
      white: '#FFFFFF',
      gold: '#FFD700',
      silver: '#C0C0C0',
      none: 'transparent',
    };
    return colors[color] || '#FFFFFF';
  }
}
