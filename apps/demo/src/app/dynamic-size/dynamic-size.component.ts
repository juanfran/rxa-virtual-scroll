import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  NgZone,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  DynamicSizeVirtualScrollStrategyModule,
  RX_VIRTUAL_SCROLL_DEFAULT_OPTIONS,
  RxVirtualScrollDefaultOptions,
  RxVirtualScrollingModule,
} from '@rx-angular/virtual-scrolling';
import { Subject } from 'rxjs';
import { DataService, Item } from '../data.service';

@Component({
  selector: 'dynamic-size',
  template: `
    <div>
      <h3>Dynamic Size Demo</h3>
    </div>
    <ng-container *ngIf="showViewport">
      <demo-panel
        (scrollToIndex)="viewport.scrollToIndex($event)"
        [itemAmount]="(items$ | async).length"
        [renderedItemsAmount]="renderedItems$ | async"
        [scrolledIndex]="viewport.scrolledIndexChange | async"
        [(runwayItems)]="runwayItems"
        [(runwayItemsOpposite)]="runwayItemsOpposite"
        [(viewCache)]="viewCache"
      ></demo-panel>
      <div style="flex: 1; max-width: 600px;">
        <rx-virtual-scroll-viewport
          [runwayItems]="runwayItems"
          [runwayItemsOpposite]="runwayItemsOpposite"
          [dynamic]="itemSize"
          #viewport
        >
          <div
            class="item"
            [style.height.px]="itemSize(item)"
            *rxVirtualFor="
              let item of items$;
              renderCallback: renderCallback$;
              viewCacheSize: viewCache
            "
          >
            <div>{{ item.id }}</div>
            <div class="item__content">{{ item.content }}</div>
            <div>{{ item.status }}</div>
            <div class="item__date">{{ item.date | date }}</div>
            <div class="item__description" *ngIf="item.description">
              <div><strong>Long Description:</strong></div>
              <div>{{ item.description }}</div>
            </div>
          </div>
        </rx-virtual-scroll-viewport>
      </div>
    </ng-container>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        height: 100%;
      }
      .demo-panel {
        margin-bottom: 1rem;
      }
      .item__description {
        height: 70px;
        grid-area: desc;
        overflow: hidden;
      }
      .item__content {
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DataService],
})
export class DynamicSizeComponent {
  readonly renderCallback$ = new Subject<any>();

  renderedItems$: Subject<number> = new Subject<number>();

  items$ = this.dataService.items$;

  runwayItems = this.defaults.runwayItems;
  runwayItemsOpposite = this.defaults.runwayItemsOpposite;

  showViewport = true;

  private _viewCache = this.defaults.viewCacheSize;
  get viewCache() {
    return this._viewCache as number;
  }
  set viewCache(cache: number) {
    this._viewCache = cache;
    this.showViewport = false;
    this.cdRef.detectChanges();
    Promise.resolve().then(() => {
      this.showViewport = true;
      this.cdRef.markForCheck();
    });
  }

  itemSize = (item: Item) => (item.description ? 120 : 50);

  constructor(
    public dataService: DataService,
    private cdRef: ChangeDetectorRef,
    private elementRef: ElementRef<HTMLElement>,
    private ngZone: NgZone,
    @Inject(RX_VIRTUAL_SCROLL_DEFAULT_OPTIONS)
    private defaults: RxVirtualScrollDefaultOptions
  ) {
    this.renderCallback$.subscribe(() => {
      this.ngZone.run(() =>
        this.renderedItems$.next(
          this.elementRef.nativeElement.querySelectorAll('.item').length
        )
      );
    });
  }
}

import { NgModule } from '@angular/core';
import { DemoPanelModule } from '../demo-panel/demo-panel.component';

@NgModule({
  imports: [
    RxVirtualScrollingModule,
    CommonModule,
    DynamicSizeVirtualScrollStrategyModule,
    RouterModule.forChild([{ path: '', component: DynamicSizeComponent }]),
    FormsModule,
    DemoPanelModule,
  ],
  exports: [],
  declarations: [DynamicSizeComponent],
  providers: [],
})
export class DyanmicSizeModule {}
