import { Injectable, Inject } from "@angular/core";
import { Http, Response } from '@angular/http';
import { DeckTrackerRow, Deck, Card, DeckCard } from '../interfaces/interfaces';

@Injectable()
export class DeckService {

    private _baseUrl = '';
    public decks: Deck[] = [];
    public deckCards: DeckCard[] = [];
    public deckOwner: string = '';
    public deckName: string = '';
    public deckConstructed: boolean = true;
    public selectedDeck: Deck = {} as Deck;
    public successText: string = '';

    public queryString: string = '';

    constructor(private http: Http, @Inject('BASE_URL') baseUrl: string) {
        this._baseUrl = baseUrl;
        this.selectedDeck.name = ' ';
    }

    getDecks(owner: string) {
        this.deckCards = [];
        return this.http.get(this._baseUrl + 'api/decks/' + owner).subscribe(result => {
            this.decks = result.json();
        });
    }

    getDeckDetails(deckOwner: string, deckName: string) {
        this.http.get(this._baseUrl + 'api/decks/deck/' + deckOwner + '/' + deckName).subscribe(result => {
            var returnObject: any = result.json();
            this.selectedDeck = returnObject[0];
        }, error => {
            alert(error.json());
        });

        return this.selectedDeck;
    }

    getDeckCards() {
        this.http.get(this._baseUrl + 'api/decks/cards/' + this.selectedDeck.owner + '_' + this.selectedDeck.name).subscribe(result => {
            this.successText = "Card Retrieved Successfully";
            this.deckCards = result.json();
            this.deckOwner = this.selectedDeck.owner;
            this.deckName = this.selectedDeck.name;
            this.getDeckDetails(this.deckOwner, this.deckName);
        }, error => {
            alert(error.json());
        });
    }

    addDeck(deck: Deck) {

        return this.http.post(this._baseUrl + 'api/decks/addDeck', deck)
            .subscribe(data => { }, error => {
                alert(error.json());
            },
                () => {
                    this.getDecks(deck.owner);
                }
            );
    }

    removeDeck(deck: Deck) {
        return this.http.post(this._baseUrl + 'api/deckCards/removeDeck', deck)
            .subscribe(() => {
                this.http.post(this._baseUrl + 'api/decks/removeDeck', deck)
                    .subscribe(() => {
                        this.getDecks(deck.owner);
                    }, error => {
                        alert(error.json());
                    });
            }, error => {
                alert(error.json());
            });
    }

    addCardToDeck(card: Card) {

        var deckCard = this.createDeckCard(card);
        deckCard.numberInDeck = 1;

        this.http.post(this._baseUrl + 'api/deckcards/addcardtodeck/' + this.selectedDeck.constructed, deckCard)
            .subscribe(() => {
                this.successText = "Card Added Successfully";
                this.getDeckCards();
            }, error => {
                alert(error.json());
            });
    }

    addCardToSideboard(card: Card) {

        var deckCard = this.createDeckCard(card);
        deckCard.numberInSideboard = 1;
        this.http.post(this._baseUrl + 'api/deckcards/addcardtosideboard/' + this.selectedDeck.constructed, deckCard)
            .subscribe(() => {
                this.successText = "Card Added Successfully";
                this.getDeckCards();
            }, error => {
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

    addDeckTrackerRow(deckTrackerRow: DeckTrackerRow) {
        return this.http.post(this._baseUrl + 'api/decks/deckTracker', deckTrackerRow)
            .subscribe(data => { }, error => {
                alert(error.json());
            });
    }

    getDeckTrackerRows(deck: Deck) {
        return this.http.get(this._baseUrl + 'api/decks/deckTracker' + deck);
    }

    createDeckCard(card: Card) {

        let deckCard = {
            owner: this.selectedDeck.owner,
            deckName: this.selectedDeck.name,
            cardName: card.name,
            cardSet: card.set_Short,
            mana_Cost: card.mana_Cost,
            color1: card.color1,
            color2: card.color2,
            color3: card.color3,
            color4: card.color4,
            color5: card.color5,
            type_Line: card.type_Line,
            power: card.power,
            toughness: card.toughness,
            loyalty: card.loyalty,
            card_Text: card.card_Text,
            flavor_Text: card.flavor_Text,
            numberInCollection: card.numberInCollection,
            cmc: card.cmc,
            set_Name: card.set_Name,
            full_Cost: card.full_Cost,
            image_Small: card.image_Small,
            image_Normal: card.image_Normal,
            image_Large: card.image_Large,
            price: card.price
        } as DeckCard;

        return deckCard;
    }

}