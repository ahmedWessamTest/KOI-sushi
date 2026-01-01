import { HttpInterceptorFn } from '@angular/common/http';

export const setTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const token = JSON.parse(localStorage.getItem("user")!)?.access_token;
  if(token) {
    const clonedReq = req.clone({
      setHeaders:{
        Authorization:`Bearer ${token}`
      }
    });
    return next(clonedReq);
  }
  return next(req);
};
