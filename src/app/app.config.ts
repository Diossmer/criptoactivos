import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    // Optimización experimental Zoneless para Angular 18+ (mejor performance)
    // @ts-ignore
    (typeof ({} as any).provideExperimentalZonelessChangeDetection === 'function') ?
      (({} as any).provideExperimentalZonelessChangeDetection()) : []
  ]
};
