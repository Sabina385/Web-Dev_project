import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api';
import { NavbarComponent } from "../../common/navbar/navbar";

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class ProfileComponent implements OnInit {
  
  user = signal<any>(null);
  activity = signal<any[]>([]);
  watchlist = signal<any[]>([]);
  recommendations = signal<any[]>([]);

  activeTab = signal<'activity' | 'watchlist' | 'recommendations'>('activity');
  recommendationTab = signal<'send' | 'sent' | 'received'>('send');

  recForm = {
    to_username: '',
    movie_title: '',
    message: ''
  };
  
  sentRecs = signal<any[]>([]);
  receivedRecs = signal<any[]>([]);
  
  sendRec() {
    this.api.sendRecommendation(this.recForm).subscribe(() => {
      alert('Sent!');
      this.recForm = { to_username: '', movie_title: '', message: '' };
    });
  }

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.api.getProfile().subscribe((res: any) => {
      this.user.set(res);

      const reviews = res.reviews || [];
      const ratings = res.ratings || [];

      const map = new Map<number, any>();

      // add reviews
      reviews.forEach((r: any) => {
        map.set(r.movie.id, {
          movie: r.movie,
          review: r.text,
          rating: null
        });
      });

      // add ratings
      ratings.forEach((rt: any) => {
        if (map.has(rt.movie.id)) {
          map.get(rt.movie.id).rating = rt.value;
        } else {
          map.set(rt.movie.id, {
            movie: rt.movie,
            review: null,
            rating: rt.value
          });
        }
      });

      this.activity.set(Array.from(map.values()));
      this.watchlist.set(res.watchlist);
      this.recommendations.set(res.recommendations);
    });

    this.api.getRecommendations().subscribe((res: any) => {
      this.sentRecs.set(res.sent);
      this.receivedRecs.set(res.received);
    });
  }

  setTab(tab: any) {
    this.activeTab.set(tab);
  }
}