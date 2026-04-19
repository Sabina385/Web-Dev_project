import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api';

@Component({
  selector: 'app-profile',
  imports: [],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class ProfileComponent implements OnInit {

  profile: any;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getProfile().subscribe(data => {
      this.profile = data;
    });
  }
}
