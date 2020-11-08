import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterStateSnapshot,
} from '@angular/router';
import { Observable } from 'rxjs';
import { ArticleService } from '../../../articles/service/article.service';
import { Article } from '../../../articles/model/article';

@Injectable({ providedIn: 'root' })
export class PinnedArticlesResolver implements Resolve<Article[]> {
  constructor(private articleService: ArticleService) {}

  /**
   * Gets the pinned articles and pass the data to the component
   * @param route
   * @param state
   * @return Observable<Article[]>
   */
  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<Article[]> {
    return this.articleService.pinned();
  }
}
