// positions/list.component.ts
import { Component, OnInit } from '@angular/core';
import { PositionsService } from '@app/_services/position.service';
import { Position } from '@app/_models/position';

@Component({
  selector: 'app-positions-list',
  templateUrl: './list.component.html'
})
export class ListComponent implements OnInit {
  positions: Position[] = [];

  constructor(private positionService: PositionsService) {}

  ngOnInit() {
    this.loadPositions();
  }

  loadPositions() {
    this.positionService.getAll().subscribe({
      next: (positions: Position[]) => {
        this.positions = positions;
      },
      error: (err: any) => console.error('Error loading positions', err)
    });
  }
}
