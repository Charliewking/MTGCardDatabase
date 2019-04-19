import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';

import { HttpCardService } from './services/http-service';
import { DeckService } from './services/deck-service';

import { AppComponent } from './components/app/app.component';
import { NavMenuComponent } from './components/navmenu/navmenu.component';
import { CollectionComponent } from './components/collection/collection.component';
import { DeckComponent } from './components/deck/deck.component';
import { SearchCardsComponent } from './components/searchcards/searchcards.component';
import { PreviewComponent } from './components/preview/preview.component';
import { CardNamePipe } from './pipes/card-name.pipe';
import { CardTextPipe } from './pipes/card-text.pipe';
import { CardRarityPipe } from './pipes/card-rarity.pipe';

@NgModule({
    declarations: [
        AppComponent,
        NavMenuComponent,
        SearchCardsComponent,
        DeckComponent,
        CollectionComponent,
        PreviewComponent,
        CardNamePipe,
        CardTextPipe,
        CardRarityPipe
    ],
    imports: [
        CommonModule,
        HttpModule,
        FormsModule,
        RouterModule.forRoot([
            { path: '', redirectTo: 'collection', pathMatch: 'full' },
            { path: 'collection', component: CollectionComponent },
            { path: 'searchcards', component: SearchCardsComponent },
            { path: 'deck', component: DeckComponent },
            { path: 'preview', component: PreviewComponent },
            { path: '**', redirectTo: 'collection' }
        ])
    ],
    providers: [HttpCardService, DeckService]
})
export class AppModuleShared {
}
