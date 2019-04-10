import { Component, Inject } from '@angular/core';
import { Http } from '@angular/http';
import { DeckService } from '../../services/deck-service'
import { CardNamePipe } from '../../pipes/card-name.pipe';
import { CardTextPipe } from '../../pipes/card-text.pipe';

@Component({
    selector: 'fetchdata',
    templateUrl: './fetchdata.component.html',
    providers: [ DeckService ]
})
export class FetchDataComponent {
    //public forecasts: WeatherForecast[] = [];

    //constructor(http: Http, @Inject('BASE_URL') baseUrl: string) {
    //    http.get(baseUrl + 'api/SampleData/WeatherForecasts').subscribe(result => {
    //        this.forecasts = result.json() as WeatherForecast[];
    //    }, error => console.error(error));
    //}
    public ourCube: Cube = {} as Cube;
    public scope = this;
    public decks: Deck[] = [];
    public deckCards: Card[] = [];

    public _deckService: DeckService;

    ngOnInit() {
        this.getDeckCards("Charlie", "Saprolings");
        this.getDecks("Charlie");
    }

    constructor(private deckService: DeckService) {
        this._deckService = deckService;

        this.ourCube.redCards = 0;
        this.ourCube.blackCards = 0;
        this.ourCube.blueCards = 0;
        this.ourCube.whiteCards = 0;
        this.ourCube.greenCards = 0;
        this.ourCube.artifactCards = 0;
        this.ourCube.landCards = 0;

    }

    getDecks(owner: string) {
        this._deckService.getDecks(owner).subscribe(result => {
            this.decks = result.json();
        });
    }

    newDeck(owner: string, name: string) {
        this._deckService.addDeck(owner, name);
    }

    getDeckCards(owner: string, deckName: string) {
        this._deckService.getDeckCards(owner + "_" + deckName).subscribe(result => {
            this.deckCards = result.json();
            //this.getCubeStats();
        });
    }

    getCubeStats() {
        for (let card of this.deckCards) {
            if (card.color2 != " ") {
                continue;
            }
            if (card.color1 == "W") {
                this.ourCube.whiteCards++;
            }
            if (card.color1 == "U") {
                this.ourCube.blueCards++;
            }
            if (card.color1 == "B") {
                this.ourCube.blackCards++;
            }
            if (card.color1 == "R") {
                this.ourCube.redCards++;
            }
            if (card.color1 == "G") {
                this.ourCube.greenCards++;
            }
            if (card.color1 == " ") {
                this.ourCube.landCards++;
            }
        }
        
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

interface Deck {
    name: string;
    owner: string;
    colors: string[];
    color1: string;
    mainDeck: Card[];
    sideBoard: Card[];
}

interface Card {
    PartitionKey: string;
    RowKey: string;
    name: string;
    set: string;
    colors: string[];
    color1: string;
    color2: string;
    rarity: string;
    mana_cost: string;
    added: boolean;
    power: string;
    type_line: string;
    color_identity: string;
    toughness: string;
    image_small: string;
    card_text: string;
    flavor_text: string;
    numberInCollection: number;
    cmc: string;
    image_uris: any;
    set_name: string;
    oracle_text: string;
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