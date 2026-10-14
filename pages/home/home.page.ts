import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from 'src/app/services/supabase.service';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss']
})
export class HomePage {
  constructor(private sb: SupabaseService, private router: Router) {}

  async logout() {
    await this.sb.signOut();
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }


}





