import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { CreateComponent } from './create/create.component';
import { JoinComponent } from './join/join.component';
import { GameComponent } from './game/game.component';


const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'new', component: CreateComponent },
  { path: 'join', component: JoinComponent },
  { path: 'game', component: GameComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
