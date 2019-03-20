import { Component, Inject } from '@angular/core';
import { Http } from '@angular/http';
import { HttpCardService } from '../../services/http-service';
import { ScryfallService } from '../../services/scryfall.service';
import { CardNamePipe } from '../../pipes/card-name.pipe';

@Component({
    selector: 'counter',
    templateUrl: './counter.component.html',
    providers: [HttpCardService, ScryfallService]
})
export class CounterComponent {
    public queryString: string = '';
    public setQuery: string = '';
    public cards: JSON[] = [];

    public _httpCardService: HttpCardService;
    public _scryfallService: ScryfallService;

    constructor(private httpCardService: HttpCardService, private scryfallService: ScryfallService) {
        this._httpCardService = httpCardService;
        this._scryfallService = scryfallService;
    }

    getSetCards(set: string) {
        this._scryfallService.getCards(set).subscribe(result => {
            this.cards = (result.json()).data;
        });
    }

    addCard(card: Card) {
        this._httpCardService.addCard(card.name, card.set, card.colors[0], card.colors[1], card.rarity, card.mana_cost, 1);
        card.added = true;
    }
}

interface CardCollection {
    rowkey: string;
    color1: string;
    color2: string;
    rarity: string;
    convertedCost: string;
}

interface Card {
    name: string;
    set: string;
    colors: string[];
    rarity: string;
    mana_cost: string;
    added: boolean;
}