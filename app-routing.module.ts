import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  {
    path: 'home',
    canActivate: [AuthGuard],
    canLoad: [AuthGuard],
    loadChildren: () =>
      import('./pages/home/home.module').then(m => m.HomePageModule),
  },

  {
    path: 'login',
    loadChildren: () =>
      import('./pages/login/login.module').then(m => m.LoginPageModule),
  },

  {
    path: 'time-logs',
    canActivate: [AuthGuard],
    canLoad: [AuthGuard],
    loadChildren: () =>
      import('./pages/time-logs/time-logs.module').then(m => m.TimeLogsPageModule),
  },

  {
    path: 'clock-code',
    loadChildren: () =>
      import('./pages/clock-code/clock-code.module').then(m => m.ClockCodePageModule),
  },

  {
    path: 'help',
    loadChildren: () =>
      import('./pages/help/help.module').then(m => m.HelpPageModule),
  },
  {path: 'job-cards',
    loadChildren: () =>
      import('./pages/job-cards/job-cards.module').then(m => m.JobCardsPageModule)
  },

  // 🔹 NEW: Profile (guarded)
  {
    path: 'profile',
    canActivate: [AuthGuard],
    canLoad: [AuthGuard],
    loadChildren: () =>
      import('./pages/profile/profile.module').then(m => m.ProfilePageModule),
  },

    {
    path: 'payslips',
    canActivate: [AuthGuard],
    canLoad: [AuthGuard],
    loadChildren: () => import('./pages/payslips/payslips.module').then( m => m.PayslipsPageModule)
  },

  {
    path: 'warnings',
    canActivate: [AuthGuard],
    canLoad: [AuthGuard],
    loadChildren: () => import('./pages/warnings/warnings.module').then( m => m.WarningsPageModule)
  },

  { path: '**', redirectTo: 'home' },


];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
