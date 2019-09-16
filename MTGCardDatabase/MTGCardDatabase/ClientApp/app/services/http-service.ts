import { Injectable, Inject } from "@angular/core";
import { Http, Response } from '@angular/http';
import { Card, PreviewCard } from '../interfaces/interfaces'

@Injectable()
export class HttpCardService {

    private _baseUrl = '';
    public cards: Card[] = [];
    public previewCards: PreviewCard[] = [];
    public collectionValue: string = '';
    public errorText: string = '';
    public currentToken: JSON = {} as JSON;

    constructor(private http: Http, @Inject('BASE_URL') baseUrl: string) {
        this._baseUrl = baseUrl;
    }

    getCards() {
        if (this.cards.length == 0) {
            this.http.get(this._baseUrl + 'api/cards').subscribe(result => {
                this.currentToken = result.json().token;
                this.cards = result.json().returnList as Card[];
            });
        }
    }

    getNextPageCards(token: JSON) {
        this.http.post(this._baseUrl + 'api/cards/next', token)
            .subscribe(result => {
                this.currentToken = result.json().token;
                this.cards = result.json().returnList as Card[];
            },
            error => {
                this.errorText = "Could not get the next page.";
                alert(error.json());
            });
    }

    getCardsWithFilter(filter: string) {
        return this.http.get(this._baseUrl + 'api/cards/' + filter);
    }

    addCard(card: Card, count: number) {

        return this.http.post(this._baseUrl + 'api/cards/addCard/' + count.toString(), card)
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

    getPreviewCards(setName: string) {
        if (this.cards.length == 0) {
            this.http.get(this._baseUrl + 'api/cards/preview/' + setName).subscribe(result => {
                this.currentToken = result.json().token;
                this.previewCards = result.json() as PreviewCard[];
            });
        }
    }

    addPreviewCard(previewCard: PreviewCard) {

        return this.http.post(this._baseUrl + 'api/cards/preview', previewCard)
            .subscribe(data => { }, error => {
                alert(error.json());
            });
    }
}