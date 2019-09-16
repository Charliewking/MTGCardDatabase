import { Component, Inject } from '@angular/core';
import { Http } from '@angular/http';
import { CardNamePipe } from '../../pipes/card-name.pipe';
import { CardTextPipe } from '../../pipes/card-text.pipe';
import { HttpCardService } from '../../services/http-service';
import { ScryfallService } from '../../services/scryfall.service';
import { Card, PreviewCard } from '../../interfaces/interfaces';
import { PreActivation } from '@angular/router/src/router';

@Component({
    selector: 'cardeval',
    templateUrl: './cardeval.html',
    providers: [HttpCardService, ScryfallService]
})
export class CardEvalComponent {
    public queryString: string = '';
    public setQuery: string = '';
    public cards: Card[] = [];
    public showError: boolean = false;

    public strings = {
        host1: '@_Ironstream',
        host2: '@ParticleBit',
        comment1: '',
        comment2: '',
        rating1: '1',
        rating2: '2',
        totalScore: '',
        previewCardURI: '',
        previewCardName: '',
        rarityString: '',
        setName: 'eld',
        errorText: "Not enough to search on",
    }

    public _httpCardService: HttpCardService;
    public _scryfallService: ScryfallService;

    constructor(private httpCardService: HttpCardService, private scryfallService: ScryfallService) {
        this._httpCardService = httpCardService;
        this._scryfallService = scryfallService;
    }

    ngOnInit() {
        // call some function that gets either a cache or new cards if no cache
        // this._scryfallService.getCard("Nicol Bolas, Dragon God");
        this._httpCardService.getPreviewCards(this.strings.setName);
    }

    getCard(name: string) {
        this._scryfallService.getCard(name);
        this.strings.previewCardName = this._scryfallService.returnCards[0].name
        this.strings.previewCardURI = this._scryfallService.returnCards[0].image_Normal
        this.strings.rating1 = '';
        this.strings.rating2 = '';
    }

    setMPScore() {

    }
    setISScore() {

    }

    setPreviewCard(previewCard: PreviewCard) {
        this.strings.previewCardName = previewCard.name;
        this.strings.previewCardURI = previewCard.image_Normal;
        this.strings.rating1 = previewCard.rating1;
        this.strings.rating2 = previewCard.rating2;
    }

    submitRating(previewCard: PreviewCard) {
        this._httpCardService.addPreviewCard(previewCard);
    }

    //submitRatings() {
    //    this._httpCardService.previewCards.forEach((previewCard:) => this.setPreviewCard())
    //}
}


interface ImageBinding {
    Name: string;
    Image_URI: string;
}
