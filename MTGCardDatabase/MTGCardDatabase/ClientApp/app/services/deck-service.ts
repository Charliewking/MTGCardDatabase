import { Injectable, Inject } from "@angular/core";
import { Http, Response } from '@angular/http';
import { DeckTrackerRow, Deck, Card, DeckCard } from '../interfaces/interfaces';

@Injectable()
export class DeckService {

    private _baseUrl = '';
    public decks: Deck[] = [];

    constructor(private http: Http, @Inject('BASE_URL') baseUrl: string) {
        this._baseUrl = baseUrl;
    }

    getDecks(owner: string) {
        return this.http.get(this._baseUrl + 'api/decks/' + owner).subscribe(result => {
            this.decks = result.json();
        });
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
            },
            () => {
                this.getDecks(_ownerName);
            }
        );
    }

    addCardToDeck(deckOwner: string, deckName: string, card: Card) {

        var deckCard = {
            Owner: deckOwner,
            DeckName: deckName,
            CardName: card.name,
            CardSet: card.set_Short,
            Mana_Cost: card.mana_Cost,
            NumberInDeck: 1
        }

        return this.http.post(this._baseUrl + 'api/deckcards/addcardtodeck', deckCard)
            .subscribe(data => { }, error => {
                alert(error.json());
            });
    }

    removeCardFromDeck(card: DeckCard) {
        return this.http.post(this._baseUrl + 'api/deckcards/removeCardFromDeck', card)
            .subscribe(data => { }, error => {
                alert(error.json());
            });
    }

    incrementDeckCard(card: DeckCard, sideBoard: boolean) {

        if (sideBoard) {
            return this.http.post(this._baseUrl + 'api/deckcards/incrementSideboard', card)
                .subscribe(data => { }, error => {
                    alert(error.json());
                });
        }
        else {
            return this.http.post(this._baseUrl + 'api/deckcards/increment', card)
                .subscribe(data => { }, error => {
                    alert(error.json());
                });
        }
    }

    decrementDeckCard(card: DeckCard, sideBoard: boolean) {

        if (sideBoard) {
            return this.http.post(this._baseUrl + 'api/deckcards/decrementSideboard', card)
                .subscribe(data => { }, error => {
                    alert(error.json());
                });
        }
        else {
            return this.http.post(this._baseUrl + 'api/deckcards/decrement', card)
                .subscribe(data => { }, error => {
                    alert(error.json());
                });
        }
    }

    getDeckCards(playerDeck: string) {
        return this.http.get(this._baseUrl + 'api/decks/cards/' + playerDeck);
    }

    addDeckTrackerRow(deckTrackerRow: DeckTrackerRow) {
        return this.http.post(this._baseUrl + 'api/decks/deckTracker', deckTrackerRow)
            .subscribe(data => { }, error => {
                alert(error.json());
            });
    }

    getDeckTrackerRows(deck: Deck) {
        return this.http.get(this._baseUrl + 'api/decks/deckTracker' + deck);
    }

}