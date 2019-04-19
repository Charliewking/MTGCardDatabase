import { Component, Inject } from '@angular/core';
import { Http } from '@angular/http';
import { HttpCardService } from '../../services/http-service';
import { ScryfallService } from '../../services/scryfall.service';
import { CardNamePipe } from '../../pipes/card-name.pipe';
import { Card } from '../../interfaces/interfaces';

@Component({
    selector: 'searchcards',
    templateUrl: './searchcards.component.html',
    providers: [HttpCardService, ScryfallService]
})
export class SearchCardsComponent {
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
        this.scryfallService.getCard(name);
    }

    getNewPage() {
        this._scryfallService.getNewPage(this.nextPage).subscribe(result => {
            this.cards = (result.json()).data;
        });
    }

    addCard(card: Card) {
        this._httpCardService.addCard(card);
        //card.added = true;
    }


    getColor(card: Card) {
        if (card.mana_Cost == null) {
            return 'grey'
        }
        else if (card.color2 != "") {
            return 'gold'
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