import { Injectable, Inject } from "@angular/core";
import { Http, Response } from '@angular/http';
import { Observable } from "rxjs/Observable";

@Injectable()
export class ScryfallService {

    private _baseUrl = 'https://api.scryfall.com/cards/';

    constructor(private http: Http) { }

    getCards(set: string) {
        return this.http.get(this._baseUrl + 'search?q=set:' + set);
    }

    addCard(_name: string, _set: string, _color1: string, _color2: string, _rarity: string, _convertedCost: string, _numberInCollection: number) {

        var cardData = {
            PartitionKey: _set,
            RowKey: _name,
            cardName: _name,
            color1: _color1,
            color2: _color1,
            rarity: _rarity,
            convertedCost: _convertedCost,
            numberInCollection: _numberInCollection
        };

        return this.http.post(this._baseUrl + 'api/cards/addCard', cardData)
            .subscribe(data => { }, error => {
                alert(error.json());
            });
    }
}