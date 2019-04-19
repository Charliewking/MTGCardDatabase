import { Component, Inject } from '@angular/core';
import { Http } from '@angular/http';
import { CardNamePipe } from '../../pipes/card-name.pipe';
import { CardTextPipe } from '../../pipes/card-text.pipe';
import { HttpCardService } from '../../services/http-service';
import { ScryfallService } from '../../services/scryfall.service';
import { Card } from '../../interfaces/interfaces';

@Component({
    selector: 'preview',
    templateUrl: './preview.component.html',
    providers: [HttpCardService, ScryfallService]
})
export class PreviewComponent {
    public queryString: string = '';
    public setQuery: string = '';
    public cards: Card[] = [];
    public errorText: string = "Not enough to search on"
    public showError: boolean = false;
    public ISScore: number = 2;
    public MPScore: number = 3;
    public TotalScore: number = (this.ISScore + this.MPScore / 2);

    public _httpCardService: HttpCardService;
    public _scryfallService: ScryfallService;

    constructor(private httpCardService: HttpCardService, private scryfallService: ScryfallService) {
        this._httpCardService = httpCardService;
        this._scryfallService = scryfallService;
    }

    ngOnInit() {
        // call some function that gets either a cache or new cards if no cache
        this.scryfallService.getCard("Nicol Bolas, Dragon God");
    }

    getCard(name: string) {
        this.scryfallService.getCard(name);
    }

    setMPScore() {

    }
    setISScore() {

    }
}


interface ImageBinding {
    Name: string;
    Image_URI: string;
}

//interface Card {
//    PartitionKey: string;
//    RowKey: string;
//    name: string;
//    set: string;
//    colors: string[];
//    rarity: string;
//    mana_cost: string;
//    added: boolean;
//    power: string;
//    type_line: string;
//    color_identity: string;
//    toughness: string;
//    Image_URI: string;
//    card_text: string;
//    flavor_text: string;
//    numberInCollection: number;
//    cmc: string;
//    image_uris: any;
//    set_name: string;
//    oracle_text: string;
//    full_cost: string[];
//}