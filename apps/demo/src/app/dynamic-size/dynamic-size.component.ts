import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  DynamicSizeVirtualScrollStrategyModule,
  RxVirtualScrollingModule,
} from '@rx-angular/virtual-scrolling';

import { DataService, Item } from '../data.service';

@Component({
  selector: 'dynamic-size',
  template: `
    <div>
      <h3>Dynamic Size Demo</h3>
    </div>
    <ng-container *ngIf="state.showViewport">
      <demo-panel
        (scrollToIndex)="viewport.scrollToIndex($event)"
        [itemAmount]="(state.items$ | async).length"
        [renderedItemsAmount]="state.renderedItems$ | async"
        [scrolledIndex]="viewport.scrolledIndexChange | async"
        [(runwayItems)]="state.runwayItems"
        [(runwayItemsOpposite)]="state.runwayItemsOpposite"
        [(viewCache)]="state.viewCache"
      ></demo-panel>
      <div style="flex: 1; max-width: 600px;">
        <rx-virtual-scroll-viewport
          [runwayItems]="state.runwayItems"
          [runwayItemsOpposite]="state.runwayItemsOpposite"
          [dynamic]="itemSize"
          #viewport
        >
          <div
            class="item"
            [style.height.px]="itemSize(item)"
            *rxVirtualFor="
              let item of state.items$;
              renderCallback: state.renderCallback$;
              viewCacheSize: state.viewCache
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
  providers: [DataService, DemoComponentState],
})
export class DynamicSizeComponent {
  itemSize = (item: Item) => (item.description ? 120 : 50);

  constructor(public state: DemoComponentState) {}
}

import { NgModule } from '@angular/core';

import { DemoComponentState } from '../demo-component.state';
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
export class DynamicSizeModule {}
