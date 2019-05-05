export { Card, ScryfallCard, Deck, DeckTrackerRow, Player, DeckCard, MetaDeck };

interface Card {
    name: string;
    set_Short: string;
    color1: string;
    color2: string;
    color3: string;
    color4: string;
    color5: string;
    rarity: string;
    mana_Cost: string;
    power: string;
    type_Line: string;
    toughness: string;
    loyalty: string;
    card_Text: string;
    flavor_Text: string;
    numberInCollection: number;
    cmc: string;
    set_Name: string;
    full_Cost: string[];
    image_Small: any;
    image_Normal: any;
    image_Large: any;
    price: string;
}

interface ScryfallCard {
    name: string;
    set: string;
    colors: string[];
    rarity: string;
    mana_cost: string;
    added: boolean;
    power: string;
    type_line: string;
    color_identity: string;
    toughness: string;
    loyalty: string;
    image_small: string;
    card_text: string;
    flavor_text: string;
    numberInCollection: number;
    cmc: string;
    image_uris: any;
    set_name: string;
    oracle_text: string;
    card_faces: CardFace[];
    usd: string;
}

interface CardFace {
    oracle_text: string;
}

interface DeckTrackerRow {
    owner: string;
    deckName: string;
    playedAgainst: string;
    rank: string;
    format: string;
    result: string;
    notes: string;
}

interface Deck {
    owner: string;
    name: string;
    color1: string;
    color2: string;
    color3: string;
    color4: string;
    color5: string;
    mainDeck: DeckCard[];
    sideboard: DeckCard[];
    trackerRows: DeckTrackerRow[];
    notes: string;
    constructed: boolean;
    landCards: number;
    creatureCount: number;
    sorceryCount: number;
    instantCount: number;
    enchantmentCount: number;
    cardCount: number;
    sideboardCount: number;
}

interface DeckCard {
    cardName: string;
    cardSet: string;
    deckName: string;
    mana_Cost: string;
    numberInDeck: number;
    numberInSideboard: number;
    owner: string;
    countLimited: boolean;
    color1: string;
    color2: string;
    color3: string;
    color4: string;
    color5: string;
    type_Line: string;
    power: string;
    toughness: string;
    loyalty: string;
    card_Text: string;
    flavor_Text: string;
    numberInCollection: number;
    cmc: string;
    set_Name: string;
    full_Cost: string[];
    image_Small: any;
    image_Normal: any;
    image_Large: any;
    price: string;
}

interface MetaDeck {
    deckTypeName: string;
    bo1Wins: number;
    bo1Losses: number;
    bo3Wins: number;
    bo3Losses: number;
    bo1WinPercentage: number;
    bo3WinPercentage: number;
    active: boolean;
}

interface Player {
    name: string;
    rankConstructed: string;
    rankLimited: string;
    decks: Deck[];
    bo1Wins: number;
    bo3Wins: number;
    bo1Losses: number;
    bo3Losses: number;
}