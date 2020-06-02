import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { QueryComponent } from './query/query.component';
import { ResultsComponent } from './results/results.component';
import { PagenotfoundComponent } from './pagenotfound/pagenotfound.component';


const routes: Routes = [
  { path: '', redirectTo: '/query', pathMatch: 'full'},
  { path: 'query', component: QueryComponent},
  { path: 'results', component: ResultsComponent},
  { path: "**", component: PagenotfoundComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
export const routingComponents = [QueryComponent, ResultsComponent, PagenotfoundComponent]
