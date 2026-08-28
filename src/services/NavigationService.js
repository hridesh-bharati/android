// src/services/NavigationService.js
import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

export function navigate(name, params) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  } else {
    // If navigation is not ready, wait for it
    setTimeout(() => {
      if (navigationRef.isReady()) {
        navigationRef.navigate(name, params);
      }
    }, 100);
  }
}

export function goBack() {
  if (navigationRef.isReady()) {
    navigationRef.goBack();
  }
}