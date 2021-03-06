﻿import { Injectable, Inject } from "@angular/core";
import { Http, Response } from '@angular/http';
import { Card } from '../interfaces/interfaces'

@Injectable()
export class HttpCardService {

    private _baseUrl = '';
    public cards: Card[] = [];
    public collectionValue: string = '';
    public errorText: string = '';

    constructor(private http: Http, @Inject('BASE_URL') baseUrl: string) {
        this._baseUrl = baseUrl;
    }

    getCards() {
        //return this.http.get(this._baseUrl + 'api/cards');
        this.http.get(this._baseUrl + 'api/cards').subscribe(result => {
            this.cards = result.json() as Card[];

            //for (let card of this.cards) {
            //    card.Mana_Cost = card.Mana_Cost.substr(1, (card.Mana_Cost.length - 2));
            //    card.Full_Cost = card.Mana_Cost.split("}{");
            //}
        });
    }

    getCardsWithFilter(filter: string) {
        return this.http.get(this._baseUrl + 'api/cards/' + filter);
    }

    addCard(card: Card) {

        return this.http.post(this._baseUrl + 'api/cards/addCard', card)
            .subscribe(error => {
                this.errorText = "The Card already exists in the collection.";
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
                this.errorText = "The Card was not successfully removed from the Collection.";
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
                this.errorText = "Error incrementing the card.";
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
                this.errorText = "Error decrementing the card.";
                alert(error.json());
            });
    }

    getCollectionValue() {
        return this.http.get(this._baseUrl + 'api/cards/value');
    }
}