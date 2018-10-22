import { Component, AfterViewInit, ViewChildren } from '@angular/core';
import { viewClassName } from '@angular/compiler';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  @ViewChildren('cell') tds;

  readonly WIDTH = 80;
  readonly HEIGHT = 30;

  timeout: any;

  cells: any;

  speed = 500;
  state = 'Pause';

  opacities = new Array(this.WIDTH * this.HEIGHT).fill(1);
  isAnalyzeMode = false;

  ngAfterViewInit() {
    this.cells = this.tds.map(e => e.nativeElement);
  }

  getArray(size) {
    return new Array(size).fill(0).map((item, idx) => idx);


  }

  getOpacity(x, y) {
    return this.opacities ? (this.opacities[y * this.WIDTH + x]).toString() : '1';
  }

  mark(event, x, y) {
    const cell = event.currentTarget;

    if (!cell.classList.contains('marked')) {
      cell.classList.add('marked');
    } else {
      cell.classList.remove('marked');
    }

    if (this.state === 'Play') {
      this.playPause();
    }

    if (this.isAnalyzeMode) {
      this.analyze();
    }

    this.opacities[y * this.WIDTH + x] = 1;
  }

  next() {
    const dying = [];
    const spawning = [];

    for (let i = 0; i < this.cells.length; i++) {
      const x = i % this.WIDTH;
      const y = Math.floor(i / this.WIDTH);
      const neighbors = this.countNeighbors(x, y);
      const isLive = this.getCell(x, y).classList.contains('marked');

      // console.log(`(${x},${y})`, isLive, neighbors);

      if (isLive && (neighbors < 2 || neighbors > 3)) {
        dying.push(y * this.WIDTH + x);

        this.opacities[y * this.WIDTH + x] = 1;
      } else if (!isLive && neighbors === 3) {
        spawning.push(y * this.WIDTH + x);

        this.opacities[y * this.WIDTH + x] = 1;
      } else {
        this.opacities[y * this.WIDTH + x] = Math.max(0.2, this.opacities[y * this.WIDTH + x] - 0.1);
      }
    }

    spawning.map(cellIdx => {
      this.cells[cellIdx].classList.add('marked');
    });

    dying.map(cellIdx => {
      this.cells[cellIdx].classList.remove('marked');

      this.cells[cellIdx].style.opacity = 1;
    });

    if (this.isAnalyzeMode) {
      this.analyze();
    }
  }

  getCell(x, y) {
    return this.cells[y * this.WIDTH + x];
  }

  countNeighbors(x, y) {
    let counter = 0;
    const neighbors = [];

    if (x > 0) {
      neighbors.push([x - 1, y]);

      if (y > 0) {
        neighbors.push([x - 1, y - 1]);
      }

      if (y < this.HEIGHT - 1) {
        neighbors.push([x - 1, y + 1]);
      }
    }

    if (x < this.WIDTH - 1) {
      neighbors.push([x + 1, y]);

      if (y > 0) {
        neighbors.push([x + 1, y - 1]);
      }

      if (y < this.HEIGHT - 1) {
        neighbors.push([x + 1, y + 1]);
      }
    }

    if (y > 0) {
      neighbors.push([x, y - 1]);
    }

    if (y < this.HEIGHT - 1) {
      neighbors.push([x, y + 1]);
    }

    neighbors.map(cell => {
      if (this.getCell(cell[0], cell[1]).classList.contains('marked')) {
        counter++;
      }
    });

    return counter;
  }

  autoplay() {
    this.next();

    if (this.state === 'Play') {
      // old school
      // this.timeout = setTimeout(this.autoplay.bind(this), this.speed);
      this.timeout = setTimeout(_ => this.autoplay(), this.speed);
    }
  }

  playPause() {
    this.state = this.state === 'Play' ? 'Pause' : 'Play';

    if (this.state === 'Play') {
      this.autoplay();
    } else {
      clearTimeout(this.timeout);
    }
  }

  onClickAnalyze(e) {
    this.isAnalyzeMode = e.target.checked;

    this.analyze();
  }

  analyze() {
    for (let y = 0; y < this.HEIGHT; y++) {
      for (let x = 0; x < this.WIDTH; x++) {
        this.cells[y * this.WIDTH + x].innerHTML = this.isAnalyzeMode ? this.countNeighbors(
          x,
          y
        ).toString() : '';
      }
    }
  }

  clear() {
    this.opacities.map(val => 1);

    for (let i = 0; i < this.cells.length; i++) {
      this.cells[i].classList.remove('marked');
    }

    if (this.state === 'Play') {
      this.playPause();
    }

    if (this.isAnalyzeMode) {
      this.analyze();
    }


    this.opacities = new Array(this.WIDTH * this.HEIGHT).fill(1);

  }

  onChangeSpeed($event) {
    this.speed = 1000 / $event.currentTarget.value;

    clearTimeout(this.timeout);

    this.autoplay();
  }

  get otherState() {
    return this.state === 'Play' ? 'Pause' : 'Play';
  }
}
