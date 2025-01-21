
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Activity } from '../models/activity.model';

@Injectable({
  providedIn: 'root'
})
export class ActivityService {

  private baseUrl = 'http://your-backend-api-url/activities';

  constructor(private http: HttpClient) { }

  getRecentActivities(accountId: string): Observable<Activity[]> {
    return this.http.get<Activity[]>(`${this.baseUrl}/recent/${accountId}`);
  }

  recordActivity(activity: Activity): Observable<any> {
    return this.http.post(`${this.baseUrl}/record`, activity);
  }
}
