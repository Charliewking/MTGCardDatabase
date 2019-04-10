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

    getCardsWithFilter(filter: string) {
        return this.http.get(this._baseUrl + 'api/cards/' + filter);
    }

    addCard(card: Card, _numberInCollection: number /*_name: string, _set: string, _color1: string, _color2: string, _rarity: string, _convertedCost: string, _numberInCollection: number*/) {

        var cardData = {
            PartitionKey: card.set,
            RowKey: card.name,
            name: card.name,
            color1: card.colors[0],
            color2: card.colors[1],
            rarity: card.rarity,
            power: card.power,
            toughness: card.toughness,
            color_identity: card.color_identity[0],
            mana_cost: card.mana_cost,
            numberInCollection: _numberInCollection,
            cmc: card.cmc,
            image_small: (card.image_uris).small,
            card_text: card.oracle_text,
            flavor_text: card.flavor_text,
            type_line: card.type_line,
            Set_Name: card.set_name
        };

        card.numberInCollection = _numberInCollection

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
}