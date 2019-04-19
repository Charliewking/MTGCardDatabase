import { Component, Inject } from '@angular/core';
import { HttpCardService } from '../../services/http-service';
import { CardNamePipe } from '../../pipes/card-name.pipe';
import { DeckService } from '../../services/deck-service';
import { Card } from '../../interfaces/interfaces';

@Component({
    selector: 'collection',
    templateUrl: './collection.component.html'
})
export class CollectionComponent {
    public cards: Card[] = [];

    public _httpCardService: HttpCardService;
    public _deckService: DeckService;

    public rarityString: string = '';
    public queryString: string = '';

    public filterString: string = '';

    public filterOn: boolean = false;
    public redFilter: boolean = false;
    public blueFilter: boolean = false;
    public blackFilter: boolean = false;
    public whiteFilter: boolean = false;
    public greenFilter: boolean = false;

    public filters: string[] = [];

    ngOnInit() {
        // call some function that gets either a cache or new cards if no cache
        this._httpCardService.getCards();
        //this.getCards();
    }

    constructor(private httpCardService: HttpCardService, private deckService: DeckService) {
        this._httpCardService = httpCardService;
        this._deckService = deckService;
    }

    setFilter(filterColor: string) {
        if (!this.filterOn) {
            this.cards = [];
        }
        switch (filterColor) {
            case 'R':
                this.redFilter ? this.redFilter = false : this.redFilter = true;
                this.redFilter ? this.filters.push(filterColor) : this.removeColor(filterColor);
                this.redFilter ? this.getCardsWithFilter(filterColor) : this.getFilteredColors();
                this.filterOn = true;
                break;
            case 'G':
                this.greenFilter ? this.greenFilter = false : this.greenFilter = true;
                this.greenFilter ? this.filters.push(filterColor) : this.removeColor(filterColor);
                this.greenFilter ? this.getCardsWithFilter(filterColor) : this.getFilteredColors();
                this.filterOn = true;
                break;
            case 'U':
                this.blueFilter ? this.blueFilter = false : this.blueFilter = true;
                this.blueFilter ? this.filters.push(filterColor) : this.removeColor(filterColor);
                this.blueFilter ? this.getCardsWithFilter(filterColor) : this.getFilteredColors();
                this.filterOn = true;
                break;
            case 'W':
                this.whiteFilter ? this.whiteFilter = false : this.whiteFilter = true;
                this.whiteFilter ? this.filters.push(filterColor) : this.removeColor(filterColor);
                this.whiteFilter ? this.getCardsWithFilter(filterColor) : this.getFilteredColors();
                this.filterOn = true;
                break;
            case 'B':
                this.blackFilter ? this.blackFilter = false : this.blackFilter = true;
                this.blackFilter ? this.filters.push(filterColor) : this.removeColor(filterColor);
                this.blackFilter ? this.getCardsWithFilter(filterColor) : this.getFilteredColors();
                this.filterOn = true;
        }
        if (!this.redFilter && !this.blueFilter && !this.blackFilter && !this.greenFilter && !this.whiteFilter) {
            this.filterOn = false;
        }
    }

    getCardsWithFilter(filter: string) {
        this._httpCardService.getCardsWithFilter(filter).subscribe(result => {
            var returnCards = result.json() as Card[];

            for (let card of returnCards) {
                card.mana_Cost = card.mana_Cost.substr(1, (card.mana_Cost.length - 2));
                card.full_Cost = card.mana_Cost.split("}{");
            }

            this.cards = this.cards.concat(returnCards);
        });
    }

    getFilteredColors() {
        if (this.filters.length == 0) {
            this.getCards();
        }
        else { 
            this.cards = [];
            for (let color of this.filters) {
                this.getCardsWithFilter(color);
            }
        }
    }

    getCards() {
        this.cards = this._httpCardService.cards
    }

    addCard(card: Card) {
        this._deckService.addCardToDeck('Charlie_Saprolings', card.name, card.set_Short);
    }

    removeCard(card: Card) {
        this._httpCardService.removeCard(card.set_Short, card.name);
        card.numberInCollection = 0;
    }

    //onKey(event: any) {
    //    this.cardName = event.target.value;
    //}

    //setColor(color: string) {
    //    this.color1 = color;
    //}

    //setSet(cardSet: string) {
    //    this.cardSet = cardSet;
    //}

    incrementCardCount(card: Card) {
        //_set: string, _name: string
        this._httpCardService.incrementCardCount(card.set_Short, card.name);
        card.numberInCollection++;
    }

    decrementCardCount(card: Card) {
        this._httpCardService.decrementCardCount(card.set_Short, card.name);
        card.numberInCollection--;
    }

    getColor(card: Card) {
        if (card.mana_Cost == null) {
            return 'grey'
        }
        if (card.mana_Cost == ' ') {
            return 'white'
        }
        else if (card.mana_Cost.includes('R')) {
            return 'red'
        }
        else if (card.mana_Cost.includes('U')) {
            return 'blue'
        }
        else if (card.mana_Cost.includes('G')) {
            return 'green'
        }
        else if (card.mana_Cost.includes('W')) {
            return 'wheat'
        }
        else if (card.mana_Cost.includes('B')) {
            return 'black'
        }
        else {
            return 'grey'
        }
    }

    isDigit(mana: string) {
        if (mana == "X") {
            return true;
        }
        return Number(mana);
    }

    removeColor(color: string) {
        this.filters.forEach((item, index) => {
            if (item === color) this.filters.splice(index, 1);
        });
    }

    getPath(mana: string) {
        if (mana == null) {
            return 'grey'
        }
        if (mana == ' ') {
            return 'white'
        }
        else if (mana == 'R') {
            return this.redPath
        }
        else if (mana == 'U') {
            return this.bluePath
        }
        else if (mana == 'G') {
            return this.greenPath
        }
        else if (mana == 'W') {
            return this.whitePath
        }
        else if (mana == 'B') {
            return this.blackPath
        }
        else {
            return this.circlePath
        }
    }

    public greenPath: string = require("../../assets/magic-mana-small/mana_g.png");
    public redPath: string = require("../../assets/magic-mana-small/mana_r.png");
    public bluePath: string = require("../../assets/magic-mana-small/mana_u.png");
    public blackPath: string = require("../../assets/magic-mana-small/mana_b.png");
    public whitePath: string = require("../../assets/magic-mana-small/mana_w.png");
    public circlePath: string = require("../../assets/magic-mana-small/mana_circle.png");
}