import {AfterViewChecked, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, TemplateRef} from '@angular/core';
import {Comment} from '../../../../models/article/comment';
import {environment} from '../../../../../environments/environment';
import {Pagination} from '../../../../models/pagination';
import {Subscription} from 'rxjs';
import {ArticleService} from '../../../../services/article.service';
import {ActivatedRoute} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AlertService} from '../../../../services/alert.service';
import {BsModalRef, BsModalService} from 'ngx-bootstrap/modal';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'ares-layout-article-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.scss']
})
export class CommentsComponent implements OnInit, OnDestroy, AfterViewChecked {
  comments$: Comment[] = [];
  pagination$: Pagination;

  commentSubscription: Subscription;
  writeSubscription: Subscription;

  commentForm: FormGroup;

  modalRef: BsModalRef;

  @Input('comments')
  set comments(value: Comment[]) {
    this.comments$ = value;
  }

  @Input('pagination')
  set pagination(value: Pagination) {
    this.pagination$ = value;
  }

  constructor(
    private articleService: ArticleService,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private cdRef: ChangeDetectorRef,
    private modalService: BsModalService,
    private translateService: TranslateService
  ) { }

  ngOnInit(): void {
    this.commentForm = this.formBuilder.group({
      comment: ['', Validators.required],
    });
  }

  ngAfterViewChecked(): void {
    this.cdRef.detectChanges();
  }

  onScroll() {
    if (!this.pagination$.nextPage) {
      return;
    }

    this.commentSubscription = this.articleService.getComments(this.route.snapshot.params.id, this.pagination$.nextPage).subscribe({
      next: (e) => {
        e.comments.forEach(value => this.comments$.push(value));
        this.pagination$ = e.pagination;
      }
    });
  }

  onSubmit(): void {
    const comment = this.f.comment;

    if (!comment.value) {
      this.alertService.error(this.translateService.instant('ARTICLES.ARTICLE.COMMENT.EMPTY'));
      return;
    }

    this.writeSubscription = this.articleService.createComment(this.route.snapshot.params.id, comment.value).subscribe({
      next: (value) => {
        this.comments$.splice(0, 0, value);
        this.alertService.success(this.translateService.instant('ARTICLES.ARTICLE.COMMENT.SUCCESS'));
      },
      complete: () => this.modalRef.hide()
    });
  }

  look(look: string): string {
    return `${environment.app.imager}${look}&action=std&gesture=sml&direction=2&head_direction=2&size=l`;
  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(
      template,
      Object.assign({}, { class: 'h-100 d-flex flex-column justify-content-center my-0' })
    );
  }

  ngOnDestroy() {
    if (this.commentSubscription && this.commentSubscription.unsubscribe) {
      this.commentSubscription.unsubscribe();
    }

    if (this.writeSubscription && this.writeSubscription.unsubscribe) {
      this.writeSubscription.unsubscribe();
    }
  }

  get f() {
    return this.commentForm.controls;
  }

}
