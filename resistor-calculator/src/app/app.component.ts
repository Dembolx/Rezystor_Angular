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
  manualResistance: string = '';

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

  public bandOptions: any = {
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

  findResistorFromValue() {
    if (!this.manualResistance) return;

    let value = this.parseResistanceValue(this.manualResistance);
    if (value === null) return;

    const e24series = this.getE24Series();
    let closest = e24series.reduce((prev: number, curr: number) => {
      return Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev;
    });

    let multiplier = 1;
    while (closest * multiplier < value && multiplier < 1000000000) {
      multiplier *= 10;
    }
    while (closest * multiplier > value * 10 && multiplier > 0.01) {
      multiplier /= 10;
    }

    const resistanceValue = closest * multiplier;

    let digits = closest.toString().replace('.', '').split('').map(Number);

    if (this.bandCount >= 4) {
      this.bands.band1 = this.getColorByValue(digits[0]);
      this.bands.band2 = this.getColorByValue(digits[1]);
      if (this.bandCount >= 5 && digits.length > 2) {
        this.bands.band3 = this.getColorByValue(digits[2]);
      }

      this.bands.multiplier = this.getColorByMultiplier(multiplier);
      this.bands.tolerance = 'gold';

      if (this.bandCount === 6) {
        this.bands.tempCoeff = 'brown';
      }
    }

    this.calculate();
  }

  parseResistanceValue(input: string): number | null {
    input = input.trim().toLowerCase();
    input = input.replace(/[^0-9kkmΩω.r]/g, '');
    input = input.replace(',', '.');

    let multiplier = 1;
    if (input.includes('k')) {
      multiplier = 1000;
      input = input.replace('k', '');
    } else if (input.includes('m')) {
      multiplier = 1000000;
      input = input.replace('m', '');
    } else if (
      input.includes('ω') ||
      input.includes('Ω') ||
      input.includes('r')
    ) {
      input = input.replace(/[ωΩr]/g, '');
    }

    const numValue = parseFloat(input);
    if (isNaN(numValue)) return null;

    return numValue * multiplier;
  }

  getE24Series(): number[] {
    return [
      1.0, 1.1, 1.2, 1.3, 1.5, 1.6, 1.8, 2.0, 2.2, 2.4, 2.7, 3.0, 3.3, 3.6, 3.9,
      4.3, 4.7, 5.1, 5.6, 6.2, 6.8, 7.5, 8.2, 9.1, 10, 11, 12, 13, 15, 16, 18,
      20, 22, 24, 27, 30, 33, 36, 39, 43, 47, 51, 56, 62, 68, 75, 82, 91,
    ];
  }

  getColorByValue(value: number): string {
    for (const color in this.colorCodes) {
      if (this.colorCodes[color].value === value) {
        return color;
      }
    }
    return 'black';
  }

  getColorByMultiplier(multiplier: number): string {
    for (const color in this.colorCodes) {
      if (Math.abs(this.colorCodes[color].multiplier - multiplier) < 0.0001) {
        return color;
      }
    }
    return 'black';
  }

  clearSelection() {
    this.manualResistance = '';
    this.bands = {
      band1: 'black',
      band2: 'black',
      band3: 'black',
      multiplier: 'black',
      tolerance: 'gold',
      tempCoeff: 'brown',
    };
    this.calculate();
  }
}
