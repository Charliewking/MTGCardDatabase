import { Component, Inject } from '@angular/core';
import { DeckService } from '../../services/deck-service'
import { HttpCardService } from '../../services/http-service'
import { ScryfallService } from '../../services/scryfall.service';
import { CardNamePipe } from '../../pipes/card-name.pipe';
import { CardTextPipe } from '../../pipes/card-text.pipe';
import { Card, Deck, DeckTrackerRow, Player, DeckCard } from '../../interfaces/interfaces';

@Component({
    selector: 'deck',
    templateUrl: './deck.component.html',
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
    public selectedDeck: Deck = {} as Deck;

    public queryString: string = '';

    public _deckService: DeckService;
    public _cardService: HttpCardService;
    public _scryfallService: ScryfallService;

    public players: Player[] = [
        { "name": "Ironstream" },
        { "name": "MediaPlay" },
        { "name": "BronzeSword" },
        { "name": "AJSnips" },
    ]

    ngOnInit() {
        //this.getDeckCards("Charlie", "Saprolings");
        //this.getDecks("Charlie");
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

        this.selectedDeck.name = " ";
    }

    getDecks(owner: string) {
        this.deckCards = [];
        this._deckService.getDecks(owner);
    }

    createNewDeck() {
        this.newDeck(this.deckOwner, this.deckName);
        this.deckName = '';
    }

    newDeck(owner: string, name: string) {
        this._deckService.addDeck(owner, name);
    }

    getDeckCards(deckName: string) {
        this._deckService.getDeckCards(this.deckOwner + "_" + deckName).subscribe(result => {
            this.deckCards = result.json();
            this.deckName = deckName;
            this.getDeckDetails(this.deckOwner, deckName);
        });
    }

    getDeckDetails(deckOwner: string, deckName: string) {

        this._deckService.getDeckDetails(deckOwner, deckName).subscribe(result => {
            var returnObject: any = result.json();
            this.selectedDeck = returnObject[0];
        });
    }

    incrementDeckCard(card: DeckCard) {
        card.numberInDeck++;
        this._deckService.incrementDeckCard(card, false);
    }

    decrementDeckCard(card: DeckCard) {
        card.numberInDeck--;
        this._deckService.decrementDeckCard(card, false);
        if (card.numberInDeck == 0) {
            this.getDeckCards(card.deckName);
        }
    }

    addCardToDeck(card: Card) {
        this._deckService.addCardToDeck(this.deckOwner, this.deckName, card);
        this.getDeckCards(this.deckName);
    }

    removeCardFromDeck(card: DeckCard) {
        this._deckService.removeCardFromDeck(card);
        this.getDeckCards(card.deckName);
    }

    getCard(name: string) {
        this._scryfallService.getCard(name);
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