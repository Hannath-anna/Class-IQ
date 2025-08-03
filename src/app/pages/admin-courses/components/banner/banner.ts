import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-banner',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './banner.html',
  styleUrl: './banner.css'
})
export class Banner {
  
}