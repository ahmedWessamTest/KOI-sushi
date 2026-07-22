import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { catchError, EMPTY, throwError } from 'rxjs';

export const unauthorizedInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const toastr = inject(ToastrService);

  return next(req).pipe(
    catchError((error: any) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        const isLoginRequest = req.url.includes('/auth/login') || req.url.includes('/signin');
        
        if (!isLoginRequest) {
          // If a user session is active, clean it up and notify the user
          if (localStorage.getItem('user')) {
            localStorage.removeItem('user');
            toastr.warning(
              'Your session has expired. Please log in again.',
              'Session Expired',
              {
                timeOut: 4000,
                progressBar: true,
                closeButton: true,
              }
            );
          }
          
          router.navigate(['/login']);
          
          // Return EMPTY to prevent network retries or component error triggers
          return EMPTY;
        }
      }
      return throwError(() => error);
    })
  );
};
