import { Component, OnInit, signal, inject, computed } from '@angular/core';
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
  public api = inject(ApiService);

  user = signal<any>(null);
  activity = signal<any[]>([]);
  watchlist = signal<any[]>([]);
  recommendations = signal<any[]>([]);

  activeTab = signal<'activity' | 'watchlist' | 'recommendations'>('activity');
  recommendationTab = signal<'send' | 'sent' | 'received'>('send');
  
  activityFilter = signal<'all' | 'reviews' | 'ratings'>('all');
  activitySort = signal<'rating' | 'title'>('rating');

  watchlistSort = signal<'rating' | 'title'>('rating');

  recForm = {
    to_username: '',
    movie_title: '',
    message: ''
  };
  
  sentRecs = signal<any[]>([]);
  receivedRecs = signal<any[]>([]);
  
  movieList() {
    return this.api.movies();
  }

  sendRec() {
    const payload: any = {
      to_username: this.recForm.to_username,
      movie_title: this.recForm.movie_title,
    };

    if (this.recForm.message && this.recForm.message.trim() !== '') {
      payload.message = this.recForm.message;
    }

    this.api.sendRecommendation(payload).subscribe({
      next: () => {
        alert('Sent!');
        this.recForm = { to_username: '', movie_title: '', message: '' };
        this.loadData();
      },
      error: (err) => {
        console.error(err);
        alert('Failed to send');
      }
    });
  }

  filteredActivity = computed(() => {
    let data = this.activity();

    // filter
    const filter = this.activityFilter();
    if (filter === 'reviews') {
      data = data.filter(i => i.review);
    } else if (filter === 'ratings') {
      data = data.filter(i => i.rating);
    }

    // sort
    const sort = this.activitySort();
    if (sort === 'rating') {
      data = [...data].sort((a, b) =>
        (b.movie.rating_avg || 0) - (a.movie.rating_avg || 0)
      );
    } else if (sort === 'title') {
      data = [...data].sort((a, b) =>
        a.movie.title.localeCompare(b.movie.title)
      );
    }

    return data;
  });

  sortedWatchlist = computed(() => {
    let data = this.watchlist();

    const sort = this.watchlistSort();

    if (sort === 'rating') {
      data = [...data].sort((a, b) =>
        (b.rating_avg || 0) - (a.rating_avg || 0)
      );
    } else if (sort === 'title') {
      data = [...data].sort((a, b) =>
        a.title.localeCompare(b.title)
      );
    }

    return data;
  });

  removeFromWatchlist(movieId: number) {
    this.api.removeFromWatchlist(movieId).subscribe({
      next: () => {
        this.watchlist.update(list =>
          list.filter(movie => movie.id !== movieId)
        );

        alert('Removed from watchlist');
      },
      error: (err) => {
        console.error(err);
        alert('Failed to remove');
      }
    });
  }

  clearWatchlist() {
    const movies = this.watchlist();

    movies.forEach(m => {
      this.api.removeFromWatchlist(m.id).subscribe();
    });

    this.watchlist.set([]);
  }

  ngOnInit() {
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