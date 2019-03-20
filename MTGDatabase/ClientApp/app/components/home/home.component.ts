import { Component, Inject } from '@angular/core';
import { Http } from '@angular/http';
import { HttpCardService } from '../../services/http-service';
import { CardNamePipe } from '../../pipes/card-name.pipe';

@Component({
    selector: 'home',
    templateUrl: './home.component.html',
    providers: [HttpCardService]
})
export class HomeComponent {
    public cards: CardCollection[] = [];
    public cardName: string = "I am a card Placeholder";
    public cardSet: string = 'RNA';
    public color1: string = '';
    public color2: string = '';
    public rarity: string = '';
    public numberInCollection: number = 0;
    public convertedCost = '';
    public values = '';

    public _httpCardService: HttpCardService;

    ngOnInit() {
        this.getCards();
    }

    constructor(private httpCardService: HttpCardService) {
        this._httpCardService = httpCardService;
    }

    getCards() {
        this._httpCardService.getCards().subscribe(result => {
            this.cards = result.json() as CardCollection[];
        });
    }

    addCard(name: string) {
        this._httpCardService.addCard(this.cardName, this.cardSet, this.color1, this.color2, this.rarity, this.convertedCost, this.numberInCollection);
        window.location.reload();
    }

    removeCard(card: Card) {
        this._httpCardService.removeCard(card.partitionKey, card.name);
        card.numberInCollection = 0;
    }

    onKey(event: any) {
        this.cardName = event.target.value;
    }

    setColor(color: string) {
        this.color1 = color;
    }

    setSet(cardSet: string) {
        this.cardSet = cardSet;
    }

    incrementCardCount(card: Card) {
        //_set: string, _name: string
        this._httpCardService.incrementCardCount(card.partitionKey, card.name);
        card.numberInCollection++;
    }

    decrementCardCount(card: Card) {
        this._httpCardService.decrementCardCount(card.partitionKey, card.name);
        card.numberInCollection--;
    }
}

interface CardCollection {
    name: string;
    color1: string;
    color2: string;
    rarity: string;
    convertedCost: string;
}

interface Card {
    name: string;
    set: string;
    partitionKey: string;
    colors: string[];
    rarity: string;
    mana_cost: string;
    numberInCollection: number;
}
