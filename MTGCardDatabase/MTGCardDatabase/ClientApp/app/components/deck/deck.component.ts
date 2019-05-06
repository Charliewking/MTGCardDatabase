import { Component } from '@angular/core';
import { DeckService } from '../../services/deck-service'
import { HttpCardService } from '../../services/http-service'
import { ScryfallService } from '../../services/scryfall.service';
import { Card, Deck, MetaDeck, DeckCard } from '../../interfaces/interfaces';

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
    }

    createNewDeck() {
        this.newDeck(this.deckOwner, this.deckName, this.deckConstructed);
        this.deckName = '';
    }

    newDeck(deckOwner: string, deckName: string, deckConstructed: boolean) {
        let deck: Deck = {
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
            notes: "",
            landCards: 0,
            creatureCount: 0,
            sorceryCount: 0,
            instantCount: 0,
            enchantmentCount: 0,
            cardCount: 0,
            sideboardCount: 0
        }

        this._deckService.addDeck(deck);
    }

    removeDeck(deck: Deck) {
        this._deckService.removeDeck(deck);
    }

    setSelectedDeck(deck: Deck) {
        this._deckService.setSelectedDeck(deck);
        this.deckName = deck.name;
    }

    getDeckCards() {
        this._deckService.getDeckCards();
    }

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
        if (card.numberInDeck == 0 || card.numberInSideboard == 0) {
            this.getDeckCards();
        }
    }

    addCardToDeck(card: Card) {
        this._deckService.addCardToDeck(card);
    }

    addCardToSideboard(card: Card) {
        this._deckService.addCardToSideboard(card);
    }

    removeCardFromDeck(card: DeckCard) {
        this._deckService.removeCardFromDeck(card);
        this.getDeckCards();
    }

    getCard(name: string) {
        this._scryfallService.getCard(name);
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
        var csvData = this.ConvertToCSV(this.deckCards);
        var a = document.createElement("a");
        a.setAttribute('style', 'display:none;');
        document.body.appendChild(a);
        var blob = new Blob([csvData], { type: 'text/csv' });
        var url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = 'CubeCardList.csv';
        a.click();
    }
    ConvertToCSV(objArray: any): string {
        var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
        var str = '';
        var row = "";

        for (var index in objArray[0]) {

            //Now convert each value to string and comma-separated
            row += index + ',';
        }
        row = row.slice(0, -1);
        //append Label row with line break
        str += row + '\r\n';

        for (var i = 0; i < array.length; i++) {
            var line = '';
            for (var index in array[i]) {

                var val = '';

                if (array[i][index]) {
                    val = array[i][index].toString();
                    val.replace(',', '');
                    val.replace("\r\n", " ");
                    val.replace('"', '');
                    //array[i][index].replace(',', '');
                    //array[i][index].replace("\r\n", " ");
                    //array[i][index].replace('"', '');
                }

                if (index == "flavor_Text" || index == "card_Text") {
                    val = "";
                }

                if (line != '') line += ','

                line += ('"' + val + '"');
            }
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