import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainComponent } from './main.component';
import { OnboardingComponent } from '../onboarding/onboarding.component';
// Definición de las rutas del módulo
const routes: Routes = [
  {
    path: '',
    component: MainComponent, // Componente principal que se cargará para esta ruta
    children: [
      // {
      //   // path: '',
      //   // pathMatch: 'full', // Coincide con la ruta vacía y redirige al componente DashboardComponent
      //   // component: DashboardComponent,
      // },
      {
        path: 'onboarding',
        pathMatch: 'full',
        component: OnboardingComponent,
      },
    ],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)], // Importa las rutas definidas
  exports: [RouterModule], // Exporta RouterModule para que esté disponible en otros módulos
})
export class MainRoutingModule {}
