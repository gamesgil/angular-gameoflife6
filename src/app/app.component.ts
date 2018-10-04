import { Component, AfterViewInit } from '@angular/core';
import { viewClassName } from '@angular/compiler';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  readonly WIDTH = 10;
  readonly HEIGHT = 10;

  timeout: number;

  cells: any;

  speed = 500;
  state = 'Pause';

  ngAfterViewInit() {
    this.cells = document.body.querySelectorAll('td');
  }

  getArray(size) {
    return new Array(size).fill(0).map((item, idx) => idx);
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
      } else if (!isLive && neighbors === 3) {
        spawning.push(y * this.WIDTH + x);
      }
    }

    spawning.map(cellIdx => this.cells.item(cellIdx).classList.add('marked'));
    dying.map(cellIdx => this.cells.item(cellIdx).classList.remove('marked'));
  }

  getCell(x, y) {
    return this.cells.item(y * this.WIDTH + x);
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
      this.timeout = setTimeout(this.autoplay.bind(this), this.speed);
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

  analyze() {
    const cells = document.body.querySelectorAll('td');

    for (let y = 0; y < this.HEIGHT; y++) {
      for (let x = 0; x < this.WIDTH; x++) {
        cells.item(y * this.WIDTH + x).innerHTML = this.countNeighbors(
          x,
          y
        ).toString();
      }
    }
  }

  clear() {
    for (let i = 0; i < this.cells.length; i++) {
      this.cells.item(i).classList.remove('marked');
    }

    if (this.state === 'Play') {
      this.playPause();
    }
  }

  onChangeSpeed($event) {
    this.speed = 1000 / $event.currentTarget.value;
    console.log(this.speed);

    clearTimeout(this.timeout);

    this.autoplay();
  }

  get otherState() {
    return this.state === 'Play' ? 'Pause' : 'Play';
  }
}
