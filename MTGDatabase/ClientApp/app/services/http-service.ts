import { Injectable, Inject } from "@angular/core";
import { Http, Response } from '@angular/http';

@Injectable()
export class HttpCardService {

    private _baseUrl = '';

    constructor(private http: Http, @Inject('BASE_URL') baseUrl: string) {
        this._baseUrl = baseUrl;
    }

    getCards() {
        return this.http.get(this._baseUrl + 'api/cards');
    }

    addCard(_name: string, _set: string, _color1: string, _color2: string, _rarity: string, _convertedCost: string, _numberInCollection: number) {

        var cardData = {
            PartitionKey: _set,
            RowKey: _name,
            name: _name,
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

    removeCard(_set: string, _name: string) {
        var deleteCard = {
            PartitionKey: _set,
            RowKey: _name
        }

        return this.http.post(this._baseUrl + 'api/cards/removeCard', deleteCard)
            .subscribe(data => { }, error => {
                alert(error.json());
            });
    }

    incrementCardCount(_set: string, _name: string) {

        var plusCard = {
            PartitionKey: _set,
            RowKey: _name
        }

        return this.http.post(this._baseUrl + 'api/cards/increment', plusCard)
            .subscribe(data => { }, error => {
                alert(error.json());
            });
    }

    decrementCardCount(_set: string, _name: string) {

        var plusCard = {
            PartitionKey: _set,
            RowKey: _name
        }

        return this.http.post(this._baseUrl + 'api/cards/decrement', plusCard)
            .subscribe(data => { }, error => {
                alert(error.json());
            });
    }

}