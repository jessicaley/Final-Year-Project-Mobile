import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from './services/supabase.service';
import { MenuController } from '@ionic/angular';
import { BehaviorSubject, Subscription } from 'rxjs';
import { AuthService } from './services/auth.service';

type AppPage = { title: string; url: string; icon: string };

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: false,
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnDestroy {
  isLoggedIn$ = new BehaviorSubject<boolean>(false);
  private authStateSubscription: Subscription = new Subscription();
  user$ = new BehaviorSubject<any>(null);


  // 👉 Side menu items (add Profile here)
  public readonly appPages: AppPage[] = [
    { title: 'Dashboard', url: '/dashboard', icon: 'home' },
    { title: 'Time Logs', url: '/time-logs', icon: 'time' },
    { title: 'Profile',   url: '/profile',   icon: 'person-circle' },
    { title: 'Payslips', url: '/payslips', icon: 'time' },
    { title: 'Warnings', url: '/warnings', icon: 'time' },// NEW
  ];

  constructor(
    private supabase: SupabaseService,
    private router: Router,
    private menuCtrl: MenuController,
    public authService: AuthService
  ) {
    this.checkInitialAuthState();
    this.setupAuthListener();
  }

  ngOnDestroy(): void {
    if (this.authStateSubscription) {
      this.authStateSubscription.unsubscribe();
    }
  }

  private async checkInitialAuthState() {
    const session = await this.supabase.getSession();
    const isLoggedIn = !!session?.data.session;
    this.isLoggedIn$.next(isLoggedIn);
    if (isLoggedIn) {
      this.user$.next(session.data.session.user);
    }
  }

  private setupAuthListener() {
    this.authStateSubscription = this.supabase.onAuthStateChange((event, session) => {
      const isLoggedIn = !!session;
      this.isLoggedIn$.next(isLoggedIn);
      if (isLoggedIn) {
        this.user$.next(session.user);
      } else {
        this.user$.next(null);
      }

      if (event === 'SIGNED_OUT') {
        this.closeMenu();
        this.router.navigateByUrl('/login', { replaceUrl: true });
      }
    });
  }

  getUserInitials(user: any): string {
    if (!user) return '';
    const first = user?.user_metadata?.name || user?.name || '';
    const last = user?.user_metadata?.surname || user?.surname || '';
    const initials =
      (first.charAt(0) || '') + (last.charAt(0) || '');
    return initials.toUpperCase();
  }

  getUserAvatar(user: any): string | null {
    // Prefer avatar_url from metadata, then DB image, then null
    return user?.user_metadata?.avatar_url || user?.image || null;
  }

  getUiAvatarUrl(): string {
    const user = this.authService.user;
    if (!user) return '';

    // Use name + surname if available, fallback to email if not
    const name = `${user.name || ''} ${user.surname || ''}`.trim();
    const fallbackName = user.email?.split('@')[0] || 'User';

    const finalName = name || fallbackName;

    // Generate avatar URL
    return `https://ui-avatars.com/api/?background=17726d&color=fff&name=${encodeURIComponent(finalName)}`;
  }



  // private async checkInitialAuthState() {
  //   const session = await this.supabase.getSession();
  //   this.isLoggedIn$.next(!!session?.data.session);
  // }

  // private setupAuthListener() {
  //   this.authStateSubscription = this.supabase.onAuthStateChange((event, session) => {
  //     const isLoggedIn = !!session;
  //     this.isLoggedIn$.next(isLoggedIn);

  //     if (event === 'SIGNED_OUT') {
  //       this.closeMenu();
  //       this.router.navigateByUrl('/login', { replaceUrl: true });
  //     }
  //   });
  // }

  async logout() {
    await this.supabase.signOut();
  }

  async closeMenu() {
    const menu = await this.menuCtrl.get('main-menu');
    if (menu) {
      menu.close();
    }
  }

  async toggleMenu() {
    const menu = await this.menuCtrl.get('main-menu');
    if (menu) {
      menu.toggle();
    }
  }
}
