import { Component } from '@angular/core';
import { DeckService } from '../../services/deck-service'
import { HttpCardService } from '../../services/http-service'
import { ScryfallService } from '../../services/scryfall.service';
import { Card, Deck, MetaDeck, DeckCard, ScryfallCard } from '../../interfaces/interfaces';
import { Subscribable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

@Component({
    selector: 'deck',
    templateUrl: './deck.component.html',
    styleUrls: ['./deck.component.css'],
    providers: [DeckService, ScryfallService]
})
export class DeckComponent {
    //public forecasts: WeatherForecast[] = [];

    //constructor(http: Http, @Inject('BASE_URL') baseUrl: string) {
    //    http.get(baseUrl + 'api/SampleData/WeatherForecasts').subscribe(result => {
    //        this.forecasts = result.json() as WeatherForecast[];
    //    }, error => console.error(error));
    //}
    public ourCube: Cube = {} as Cube;
    public scope = this;
    public decks: Deck[] = [];
    public deckCards: DeckCard[] = [];
    public deckOwner: string = '';
    public deckName: string = '';
    public deckRename: string = '';
    public deckConstructed: boolean = true;
    public addResult: string = '';
    public hoveredover: string = '';
    public hoveredcard: string = '';
    public newMetaDeck: MetaDeck = {} as MetaDeck;
    public hoveredPlayer: string = '';
    public selectedPlayer: string = '';

    public queryString: string = '';

    public _deckService: DeckService;
    public _cardService: HttpCardService;
    public _scryfallService: ScryfallService;

    ngOnInit() {
        this._deckService.getPlayers();
    }

    constructor(private deckService: DeckService, private cardService: HttpCardService, private scryfallService: ScryfallService) {
        this._deckService = deckService;
        this._cardService = cardService;
        this._scryfallService = scryfallService;

        this.ourCube.redCards = 0;
        this.ourCube.blackCards = 0;
        this.ourCube.blueCards = 0;
        this.ourCube.whiteCards = 0;
        this.ourCube.greenCards = 0;
        this.ourCube.artifactCards = 0;
        this.ourCube.landCards = 0;

        this._deckService.selectedDeck.name = " ";
    }

    getDecks(owner: string) {
        this.deckCards = [];
        this._deckService.getDecks(owner);
        this.selectedPlayer = owner;
    }

    createNewDeck() {
        this.newDeck(this.selectedPlayer, this.deckName, this.deckConstructed);
        this.deckName = '';
    }

    newDeck(deckOwner: string, deckName: string, deckConstructed: boolean) {
        let deck: Deck = {
            rowKey: "",
            owner: deckOwner,
            name: deckName,
            constructed: deckConstructed,
            color1: "",
            color2: "",
            color3: "",
            color4: "",
            color5: "",
            mainDeck: [],
            sideboard: [],
            trackerRows: [],
            bo1Wins: 0,
            bo1Losses: 0,
            bo1Played: 0,
            bo3Wins: 0,
            bo3Losses: 0,
            bo3Played: 0,
            notes: "",
            landCards: 0,
            creatureCount: 0,
            sorceryCount: 0,
            instantCount: 0,
            enchantmentCount: 0,
            cardCount: 0,
            sideboardCount: 0,
            deckQuery: ""
        }

        this._deckService.addDeck(deck);
    }

    createDeckFromString(deck: Deck, deckQuery: string) {
        deck.deckQuery = deckQuery;

        let regexValue: RegExp = new RegExp(/(\d\D+)/g);
        //var matchedArray = regexValue.exec(deckQuery);
        //var cardArray = new Array(matchedArray);

        for (let card = regexValue.exec(deckQuery); card !== null; card = regexValue.exec(deckQuery)) {
            //alert(card);
            //var matchIndex = card.index;
            var count = card[0].toString().substr(0, 1)
            var name = card[0].toString().substr(2, card.toString().length - 2);

            this.returnCard(name, +count);
        }

        //this.getDeckDetails(this.selectedPlayer, deck.name);
    }

    createDeckFromArenaString(deck: Deck, deckQuery: string) {
        deck.deckQuery = deckQuery;

        let regexValue: RegExp = new RegExp(/(\d\D+\()/g);
        //var matchedArray = regexValue.exec(deckQuery);
        //var cardArray = new Array(matchedArray);

        for (let card = regexValue.exec(deckQuery); card !== null; card = regexValue.exec(deckQuery)) {
            //alert(card);
            //var matchIndex = card.index;
            var count = card[0].toString().substr(0, 1)
            var name = card[0].toString().substr(2, card.toString().length - 3);

            this.returnCard(name, +count);
        }
    }

    showRandomHand(deck: Deck) {

        //if (this._deckService.showHand == false) {
            this._deckService.showHand = true;
            this.deckService.getRandomHand(deck.owner, deck.name);
        //}
        //else {
        //    this._deckService.showHand = false;
        //}
    }

    removeDeck(deck: Deck) {
        this._deckService.removeDeck(deck);
    }

    setSelectedDeck(deck: Deck) {
        this._deckService.setSelectedDeck(deck);
        this.deckName = deck.name;
    }

    //getDeckCards() {
    //    this._deckService.getDeckCards();
    //}

    getDeckDetails(deckOwner: string, deckName: string) {
        this._deckService.getDeckDetails(deckOwner, deckName);
    }

    incrementDeckCard(card: DeckCard, sideboard: boolean) {
        sideboard ? card.numberInSideboard ++ : card.numberInDeck++;
        this._deckService.incrementDeckCard(card, sideboard);
    }

    decrementDeckCard(card: DeckCard, sideboard: boolean) {
        sideboard ? card.numberInSideboard-- : card.numberInDeck--;
        this._deckService.decrementDeckCard(card, sideboard);
        //if (card.numberInDeck == 0 && card.numberInSideboard == 0) {
        //    this._deckService.removeCardFromDeck(card);
        //}
    }

    addCardToDeck(card: Card) {
        this._deckService.addCardToDeck(card, 1);
    }

    addCardToSideboard(card: Card) {
        this._deckService.addCardToSideboard(card, 1);
    }

    removeCardFromDeck(card: DeckCard) {
        this._deckService.removeCardFromDeck(card);
    }

    getCard(name: string) {
        this._scryfallService.getCard(name);
    }

    returnCard(name: string, count: number) {
        this._scryfallService.returnCard(name).subscribe(result => {
            var card = result.json() as ScryfallCard;

            let cardData: Card = {
                set_Short: card.set,
                name: card.name,
                color1: card.colors[0] ? card.colors[0] : '',
                color2: card.colors[1] ? card.colors[1] : '',
                color3: card.colors[2] ? card.colors[2] : '',
                color4: card.colors[3] ? card.colors[3] : '',
                color5: card.colors[4] ? card.colors[4] : '',
                rarity: card.rarity,
                power: card.power,
                toughness: card.toughness,
                mana_Cost: card.mana_cost,
                loyalty: card.loyalty,
                cmc: card.cmc,
                image_Small: (card.image_uris).small,
                image_Normal: (card.image_uris).normal,
                image_Large: (card.image_uris).large,
                card_Text: card.oracle_text,
                flavor_Text: card.flavor_text,
                type_Line: card.type_line,
                set_Name: card.set_name,
                full_Cost: [],
                numberInCollection: 1,
                price: card.prices.usd
            };

            if (cardData.name.includes("//")) {
                cardData.card_Text = card.card_faces[0].oracle_text + " // " + card.card_faces[1].oracle_text
            }

            cardData.mana_Cost = cardData.mana_Cost.substr(1, (cardData.mana_Cost.length - 2));
            cardData.full_Cost = cardData.mana_Cost.split("}{");

            this._deckService.addCardToDeck(cardData, count);
        },
        error => {
            return (error.json()).details;
        });
    }

    setSearchQuery(cardName: string) {
        this.getCard(cardName);
    }

    addMetaDeck() {
        this._deckService.addMetaDeck(this.newMetaDeck);
        this.newMetaDeck = {} as MetaDeck;
    }

    getCubeStats() {
        //for (let card of this.deckCards) {
        //    if (card.color1 == "W") {
        //        this.ourCube.whiteCards++;
        //    }
        //    if (card.color1 == "U") {
        //        this.ourCube.blueCards++;
        //    }
        //    if (card.color1 == "B") {
        //        this.ourCube.blackCards++;
        //    }
        //    if (card.color1 == "R") {
        //        this.ourCube.redCards++;
        //    }
        //    if (card.color1 == "G") {
        //        this.ourCube.greenCards++;
        //    }
        //    if (card.type_Line.includes("Land")) {
        //        this.ourCube.landCards++;
        //    }
        //}
        
    }

    downloadButtonPush() {
        var csvData = this.ConvertToCSV(this._deckService.selectedDeck.mainDeck, this._deckService.selectedDeck.sideboard);
        var a = document.createElement("a");
        a.setAttribute('style', 'display:none;');
        document.body.appendChild(a);
        var blob = new Blob([csvData], { type: 'text/csv' });
        var url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = 'Decklist.txt';
        a.click();
    }

    ConvertToCSV(mainDeck: any, sideBoard:any): string {
        var mainDeckarray = typeof mainDeck != 'object' ? JSON.parse(mainDeck) : mainDeck;
        var sideBoardArray = typeof sideBoard != 'object' ? JSON.parse(sideBoard) : sideBoard;
        var str = '';
        //var row = "";

        //for (var header in objArray[0]) {
        //    //Now convert each value to string and comma-separated
        //    row += header + ',';
        //}
        //row = row.slice(0, -1);
        //append Label row with line break
        //str += row + '\r\n';

        for (var i = 0; i < mainDeckarray.length; i++) {
            var line = '';
            //for (var index in array[i]) {

            //    var val = '';

            //    if (array[i][index]) {
            //        val = array[i][index].toString();
            //        val.replace(',', '');
            //        val.replace("\r\n", " ");
            //        val.replace('"', '');
            //    }

            //    if (index == "flavor_Text" || index == "card_Text") {
            //        val = "";
            //    }

            //    if (line != '') line += ','

            //    line += ('"' + val + '"');
            //}

            line = mainDeckarray[i].numberInDeck + " " + mainDeckarray[i].cardName;
            str += line + '\r\n';
        }
        str += '\r\n';

        // For the Sideboard
        for (var i = 0; i < sideBoardArray.length; i++) {
            var line = '';

            line = sideBoardArray[i].numberInSideboard + " " + sideBoardArray[i].cardName;
            str += line + '\r\n';
        }

        return str;
    }
}


interface Cube {
    redCards: number;
    blueCards: number;
    whiteCards: number;
    greenCards: number;
    blackCards: number;
    artifactCards: number;
    landCards: number;
}