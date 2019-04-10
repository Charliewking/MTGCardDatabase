import { Injectable, Inject } from "@angular/core";
import { Http, Response } from '@angular/http';

@Injectable()
export class DeckService {

    private _baseUrl = '';

    constructor(private http: Http, @Inject('BASE_URL') baseUrl: string) {
        this._baseUrl = baseUrl;
    }

    getDecks(owner: string) {
        return this.http.get(this._baseUrl + 'api/decks/' + owner);
    }

    addDeck(_ownerName: string, _name: string) {

        var newDeck = {
            PartitionKey: _ownerName,
            RowKey: _name,
            name: _name
        };

        return this.http.post(this._baseUrl + 'api/decks/addDeck', newDeck)
            .subscribe(data => { }, error => {
                alert(error.json());
            });
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

    addCardToDeck(_ownerDeck: string, _cardName: string, _cardSet: string) {
        var deckCard = {
            PartitionKey: _ownerDeck,
            RowKey: _cardName,
            CardName: _cardName,
            CardSet: _cardSet,
            NumberInDeck: 1
        }

        return this.http.post(this._baseUrl + 'api/deckcards/addcardtodeck', deckCard)
            .subscribe(data => { }, error => {
                alert(error.json());
            });
    }

    getDeckCards(playerDeck: string) {
        return this.http.get(this._baseUrl + 'api/decks/cards/' + playerDeck);
    }

}