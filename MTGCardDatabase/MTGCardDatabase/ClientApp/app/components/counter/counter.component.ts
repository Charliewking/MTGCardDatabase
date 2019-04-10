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
    public cards: Card[] = [];
    public nextPage: string = '';
    public errorText: string = "Not enough to search on"
    public showError: boolean = false;

    public _httpCardService: HttpCardService;
    public _scryfallService: ScryfallService;

    constructor(private httpCardService: HttpCardService, private scryfallService: ScryfallService) {
        this._httpCardService = httpCardService;
        this._scryfallService = scryfallService;
    }

    getSetCards(set: string) {
        let jsonReturnData: Card[] = [];
        let jsonReturnData2: Card[] = [];
        this._scryfallService.getCards(set).subscribe(result => {
            this.nextPage = (result.json()).next_page;
            jsonReturnData = (result.json()).data;
            this._scryfallService.getNewPage(this.nextPage).subscribe(result => {
                jsonReturnData2 = (result.json()).data;
                this.cards = jsonReturnData.concat(jsonReturnData2);
            });
        });
        //this._scryfallService.getNewPage(this.nextPage).subscribe(result => {
        //    jsonReturnData.concat((result.json()).data);
        //});

        //this.cards = jsonReturnData;
    }

    getCard(name: string) {
        this.scryfallService.getCard(name).subscribe(result => {
                this.showError = false;
                let card: Card = result.json();
                card.mana_cost = card.mana_cost.substr(1, (card.mana_cost.length - 2));
                card.full_cost = card.mana_cost.split("}{");
                card.image_small = (result.json()).image_uris.small;
                card.card_text = (result.json()).oracle_text;
                this.cards[0] = card;
            },
            error => {
                this.showError = true;
                this.errorText = (error.json()).details;
            });
    }

    getNewPage() {
        this._scryfallService.getNewPage(this.nextPage).subscribe(result => {
            this.cards = (result.json()).data;
        });
    }

    addCard(card: Card) {
        this._httpCardService.addCard(card, 1);
        card.added = true;
    }


    getColor(card: Card) {
        if (card.mana_cost == null) {
            return 'grey'
        }
        else if (card.colors[1]) {
            return 'gold'
        }
        else if (card.mana_cost.includes('R')) {
            return 'red'
        }
        else if (card.mana_cost.includes('U')) {
            return 'blue'
        }
        else if (card.mana_cost.includes('G')) {
            return 'green'
        }
        else if (card.mana_cost.includes('W')) {
            return 'wheat'
        }
        else if (card.mana_cost.includes('B')) {
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

interface CardCollection {
    rowkey: string;
    color1: string;
    color2: string;
    rarity: string;
    convertedCost: string;
}

interface Card {
    PartitionKey: string;
    RowKey: string;
    name: string;
    set: string;
    colors: string[];
    rarity: string;
    mana_cost: string;
    added: boolean;
    power: string;
    type_line: string;
    color_identity: string;
    toughness: string;
    image_small: string;
    card_text: string;
    flavor_text: string;
    numberInCollection: number;
    cmc: string;
    image_uris: any;
    set_name: string;
    oracle_text: string;
    full_cost: string[];
}