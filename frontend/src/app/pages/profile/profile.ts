import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
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
  public api = inject(ApiService);
  private route = inject(ActivatedRoute);

  user = signal<any>(null);
  activity = signal<any[]>([]);
  watchlist = signal<any[]>([]);
  recommendations = signal<any[]>([]);

  activeTab = signal<'activity' | 'watchlist' | 'recommendations'>('activity');
  recommendationTab = signal<'send' | 'sent' | 'received'>('send');
  recommendationMessage = signal('');
  recommendationMessageType = signal<'success' | 'error'>('success');
  isSendingRecommendation = signal(false);

  recForm = {
    to_username: '',
    movie_title: '',
    message: ''
  };
  
  sentRecs = signal<any[]>([]);
  receivedRecs = signal<any[]>([]);

  reviewCount = computed(() => this.activity().filter(item => item.review).length);
  ratingCount = computed(() => this.activity().filter(item => item.rating).length);
  recommendationCount = computed(() => this.sentRecs().length + this.receivedRecs().length);
  
  movieList() {
    return this.api.movies();
  }

  sendRec() {
    this.recommendationMessage.set('');
    this.isSendingRecommendation.set(true);

    const payload: any = {
      to_username: this.recForm.to_username,
      movie_title: this.recForm.movie_title,
    };

    if (this.recForm.message && this.recForm.message.trim() !== '') {
      payload.message = this.recForm.message;
    }

    this.api.sendRecommendation(payload).subscribe({
      next: () => {
        this.recForm = { to_username: '', movie_title: '', message: '' };
        this.recommendationMessageType.set('success');
        this.recommendationMessage.set('Recommendation sent successfully.');
        this.isSendingRecommendation.set(false);
        this.loadData();
      },
      error: (err) => {
        console.error(err);
        this.recommendationMessageType.set('error');
        this.recommendationMessage.set('Could not send recommendation. Check username and movie title.');
        this.isSendingRecommendation.set(false);
      }
    });
  }

  filteredActivity = computed(() => {
    return this.activity();
  });

  sortedWatchlist = computed(() => {
    return this.watchlist();
  });

  ngOnInit() {
    const tab = this.route.snapshot.queryParamMap.get('tab');
    if (tab === 'recommendations') {
      this.activeTab.set('recommendations');
    }

    this.loadData();
  }

  loadData() {
    this.api.getProfile().subscribe((res: any) => {
      this.user.set(res);

      const reviews = res.reviews || [];
      const ratings = res.ratings || [];

      const map = new Map<number, any>();

      
      reviews.forEach((r: any) => {
        map.set(r.movie.id, {
          movie: r.movie,
          review: r.text,
          rating: null
        });
      });

      
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
