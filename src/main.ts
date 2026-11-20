import 'zone.js';

if (location.hostname === 'localhost' && new URLSearchParams(location.search).has('restore-test')) {
  Promise.all([import('@angular/platform-browser'), import('./restore-test')]).then(([{bootstrapApplication}, {RestoreTest}]) => {
    document.querySelector('app-root')?.replaceWith(document.createElement('app-restore-test'));
    return bootstrapApplication(RestoreTest);
  });
} else {
  import('./app-main');
}
