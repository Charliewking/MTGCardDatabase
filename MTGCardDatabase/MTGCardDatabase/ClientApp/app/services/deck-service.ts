﻿import { Injectable, Inject } from "@angular/core";
import { Http, Response } from '@angular/http';
import { DeckTrackerRow, Deck, Card, DeckCard, MetaDeck, Player } from '../interfaces/interfaces';
import { forEach } from "@angular/router/src/utils/collection";

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
    public pasteQuery: string = '';
    public metaDecks: MetaDeck[] = [];
    public randomHand: DeckCard[] = [];
    public showHand: boolean = false;

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
            for(let player of this.players){
                player.bo1WinRate = (player.bo1Wins == 0 && player.bo1Losses == 0) ? 0 : Math.round((player.bo1Wins / (player.bo1Wins + player.bo1Losses))*100);
                player.bo3WinRate = (player.bo3Wins == 0 && player.bo3Losses == 0) ? 0 : Math.round((player.bo3Wins / (player.bo3Wins + player.bo3Losses))*100);
            }
        });
    }

    getDeckDetails(deckOwner: string, deckName: string) {
        this.http.get(this._baseUrl + 'api/decks/deck/' + deckOwner + '/' + deckName).subscribe(result => {
            var returnObject: any = result.json();
            this.selectedDeck = returnObject;
        }, error => {
            alert(error.json());
        });

        //return this.selectedDeck;
    }

    getRandomHand(deckOwner: string, deckName: string) {
        this.http.get(this._baseUrl + 'api/decks/randomHand/' + deckOwner + '/' + deckName).subscribe(result => {
            var returnObject: any = result.json();
            this.randomHand = returnObject;
        }, error => {
            alert(error.json());
        });
    }

    setRenameBoxFlag(deckName: string) {
        if (this.showRenamebox == deckName) {
            this.showRenamebox = '';
        }
        else {
            this.showRenamebox = deckName;
        }
    }

    //getDeckCards() {
    //    this.http.get(this._baseUrl + 'api/decks/cards/' + this.selectedDeck.name + '_' + this.selectedDeck.name).subscribe(result => {
    //        this.successText = "Cards Retrieved Successfully";
    //        this.deckCards = result.json();
    //        this.deckOwner = this.selectedDeck.owner;
    //        this.deckName = this.selectedDeck.name;
    //        this.getDeckDetails(this.deckOwner, this.deckName);
    //    }, error => {
    //        alert(error.json());
    //    });
    //}

    setSelectedDeck(deck: Deck) {
        this.selectedDeck = deck;
        //this.getDeckCards();
    }

    addDeck(deck: Deck) {

        return this.http.post(this._baseUrl + 'api/decks/addDeck', deck)
            .subscribe(() => {
                this.getDecks(deck.owner);
            }, error => {
                alert(error.json());
            });
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

    addCardToDeck(card: Card, count: number) {

        var deckCard = this.createDeckCard(card);

        this.http.post(this._baseUrl + 'api/deckcards/addcardtodeck/' + this.selectedDeck.constructed + '/' + count, deckCard)
            .subscribe(() => {
                this.successText = "Card Added Successfully";
                deckCard.numberInDeck = count;
                //this.selectedDeck.mainDeck.push(deckCard);
                //this.selectedDeck.cardCount++;
                //this.updateCountsAddCard(card, false, count);
                this.getDeckDetails(deckCard.owner, deckCard.deckName);
            }, error => {
                alert(error.json());
            });
    }

    addCardToSideboard(card: Card, count: number) {

        var deckCard = this.createDeckCard(card);
        deckCard.numberInSideboard = count;
        this.http.post(this._baseUrl + 'api/deckcards/addcardtosideboard/' + this.selectedDeck.constructed + '/' + count, deckCard)
            .subscribe(() => {
                this.successText = "Card Added Successfully";
                this.selectedDeck.sideboard.push(deckCard);
                this.selectedDeck.sideboardCount++;
                this.updateCountsAddCard(card, true, count);
            }, error => {
                alert(error.json());
            });
    }

    removeCardFromDeck(card: DeckCard) {
        return this.http.post(this._baseUrl + 'api/deckcards/removeCardFromDeck', card)
            .subscribe(() => {
                this.selectedDeck.mainDeck.splice(this.selectedDeck.mainDeck.indexOf(card), 1);
                this.selectedDeck.cardCount--;
                this.updateCountsRemoveDeckCard(card, false);
            }, error => {
                alert(error.json());
            });
    }

    incrementDeckCard(card: DeckCard, sideboard: boolean) {

        if (sideboard) {
            return this.http.post(this._baseUrl + 'api/deckcards/incrementSideboard', card)
                .subscribe(() => {
                    this.selectedDeck.sideboardCount++;
                    this.updateCountsAddDeckCard(card, sideboard);
                }, error => {
                    alert(error.json());
                });
        }
        else {
            return this.http.post(this._baseUrl + 'api/deckcards/increment', card)
                .subscribe(() => {
                    this.selectedDeck.cardCount++;
                    this.updateCountsAddDeckCard(card, sideboard);
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
                    this.updateCountsRemoveDeckCard(card, sideboard);
                }, error => {
                    alert(error.json());
                });
        }
        else {
            return this.http.post(this._baseUrl + 'api/deckcards/decrement', card)
                .subscribe(() => {
                    this.selectedDeck.cardCount--;
                    this.updateCountsRemoveDeckCard(card, sideboard);
                }, error => {
                    alert(error.json());
                });
        }
    }

    addDeckTrackerRow() {

        this.deckTrackerRow.owner = this.selectedDeck.owner;
        this.deckTrackerRow.deckName = this.selectedDeck.rowKey;

        return this.http.post(this._baseUrl + 'api/decks/deckTracker', this.deckTrackerRow)
            .subscribe(() => {
                this.selectedDeck.trackerRows.unshift(this.deckTrackerRow);

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

    submitDeckNotes(deck: Deck) {
        this.http.post(this._baseUrl + 'api/decks/addNotes', deck)
            .subscribe(() => {
                
            }, error => {
                alert(error.json());
            });
    }

    updateCountsAddCard(card: Card, sideboard: boolean, count: number) {

    }

    updateCountsAddDeckCard(card: DeckCard, sideboard: boolean) {

    }

    updateCountsRemoveDeckCard(card: DeckCard, sideboard: boolean) {

    }

    createDeckCard(card: Card) {

        let deckCard = {
            owner: this.selectedDeck.owner,
            deckName: this.selectedDeck.rowKey,
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