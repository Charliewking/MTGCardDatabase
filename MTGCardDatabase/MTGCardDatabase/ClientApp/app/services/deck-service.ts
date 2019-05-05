import { Injectable, Inject } from "@angular/core";
import { Http, Response } from '@angular/http';
import { DeckTrackerRow, Deck, Card, DeckCard, MetaDeck, Player } from '../interfaces/interfaces';

@Injectable()
export class DeckService {

    private _baseUrl = '';
    public decks: Deck[] = [];
    public deckCards: DeckCard[] = [];
    public players: Player[] = [];
    public deckOwner: string = '';
    public deckName: string = '';
    public deckConstructed: boolean = true;
    public showRenamebox: string = '';
    public selectedDeck: Deck = {} as Deck;
    public successText: string = '';
    public metaDecks: MetaDeck[] = [];

    public deckTrackerRow: DeckTrackerRow = {} as DeckTrackerRow;
    public trackerPlayedAgainst: string = '';
    public trackerFormat: string = '';
    public trackerResult: string = '';
    public trackerNotes: string = '';

    public queryString: string = '';

    constructor(private http: Http, @Inject('BASE_URL') baseUrl: string) {
        this._baseUrl = baseUrl;
        this.selectedDeck.name = ' ';
    }

    getDecks(owner: string) {
        this.deckCards = [];
        return this.http.get(this._baseUrl + 'api/decks/' + owner).subscribe(result => {
            this.decks = result.json();
            this.selectedDeck = {} as Deck;
            this.selectedDeck.name = ' ';
            this.getMetaDecks();
        });
    }

    getPlayers() {
        this.http.get(this._baseUrl + 'api/player').subscribe(result => {
            this.players = result.json() as Player[];
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
            this.successText = "Cards Retrieved Successfully";
            this.deckCards = result.json();
            this.deckOwner = this.selectedDeck.owner;
            this.deckName = this.selectedDeck.name;
            this.getDeckDetails(this.deckOwner, this.deckName);
        }, error => {
            alert(error.json());
        });
    }

    setSelectedDeck(deck: Deck) {
        this.selectedDeck = deck;
        //this.getDeckCards();
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

    duplicateDeck(deck: Deck) {

        return this.http.post(this._baseUrl + 'api/decks/duplicateDeck', deck)
            .subscribe(data => { }, error => {
                alert(error.json());
            },
                () => {
                    this.getDecks(deck.owner);
                }
            );
    }

    renameDeck(deck: Deck, newDeckName: string) {

        return this.http.post(this._baseUrl + 'api/decks/renameDeck/' + newDeckName, deck)
            .subscribe(() => {
                this.getDecks(deck.owner);
                this.showRenamebox = '';
            }, error => {
                alert(error.json());
            });
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
                this.selectedDeck.mainDeck.push(deckCard);
                this.selectedDeck.cardCount++;
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
                this.selectedDeck.sideboard.push(deckCard);
                this.selectedDeck.sideboardCount++;
            }, error => {
                alert(error.json());
            });
    }

    removeCardFromDeck(card: DeckCard) {
        return this.http.post(this._baseUrl + 'api/deckcards/removeCardFromDeck', card)
            .subscribe(() => {
                this.selectedDeck.mainDeck.splice(this.selectedDeck.mainDeck.indexOf(card), 1);
                this.selectedDeck.cardCount--;
            }, error => {
                alert(error.json());
            });
    }

    incrementDeckCard(card: DeckCard, sideboard: boolean) {

        if (sideboard) {
            return this.http.post(this._baseUrl + 'api/deckcards/incrementSideboard', card)
                .subscribe(() => {
                    this.selectedDeck.sideboardCount++;
                }, error => {
                    alert(error.json());
                });
        }
        else {
            return this.http.post(this._baseUrl + 'api/deckcards/increment', card)
                .subscribe(() => {
                    this.selectedDeck.cardCount++;
                }, error => {
                    alert(error.json());
                });
        }
    }

    decrementDeckCard(card: DeckCard, sideboard: boolean) {

        if (sideboard) {
            return this.http.post(this._baseUrl + 'api/deckcards/decrementSideboard', card)
                .subscribe(() => {
                    this.selectedDeck.sideboardCount--;
                }, error => {
                    alert(error.json());
                });
        }
        else {
            return this.http.post(this._baseUrl + 'api/deckcards/decrement', card)
                .subscribe(() => {
                    this.selectedDeck.cardCount--;
                }, error => {
                    alert(error.json());
                });
        }
    }

    addDeckTrackerRow() {

        this.deckTrackerRow.owner = this.selectedDeck.owner;
        this.deckTrackerRow.deckName = this.selectedDeck.name;

        return this.http.post(this._baseUrl + 'api/decks/deckTracker', this.deckTrackerRow)
            .subscribe(() => {
                this.selectedDeck.trackerRows.push(this.deckTrackerRow);
                this.deckTrackerRow = {} as DeckTrackerRow;
            }, error => {
                alert(error.json());
            });
    }

    getDeckTrackerRows(deck: Deck) {
        return this.http.get(this._baseUrl + 'api/decks/deckTracker' + deck);
    }

    getMetaDecks() {
        this.http.get(this._baseUrl + 'api/decks/metaDecks')
            .subscribe(result => {
                this.metaDecks = result.json();
            }, error => {
                alert(error.json());
            });
    }

    addMetaDeck(metaDeck: MetaDeck) {
        this.http.post(this._baseUrl + 'api/decks/metaDecks', metaDeck)
            .subscribe(() => {
                this.metaDecks.push(metaDeck);
                this.deckTrackerRow.playedAgainst = '';
            }, error => {
                alert(error.json());
            });
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