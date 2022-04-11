import RTCConnection from "./rtcc";

const rtcc = new RTCConnection({ gateway: 'ws://localhost' });

window['rtcc'] = rtcc;

/*
type CardRank = 'Ace' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'Jack' | 'Queen' | 'King';
type CardSuit = 'Clubs' | 'Diamonds' | 'Hearts' | 'Spades';

class Card {
    constructor(rank: CardRank, suit: CardSuit, value?: number) {
        Object.defineProperties(this, {
            'name': { value: `${rank} of ${suit}`, writable: false },
            'rank': { value: rank, writable: false },
            'suit': { value: suit, writable: false },
            'value': { value: value ?? Card.default_values[rank], writable: false }
        });
    }

    private static default_values = { 'Ace': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'Jack': 10, 'Queen': 10, 'King': 10 };

    public readonly name: string;
    public readonly rank: CardRank;
    public readonly suit: CardSuit;
    public readonly value: number;
}

class Deck {
    constructor(auto_shuffle?: boolean) {
        this.reset(auto_shuffle);
    }

    // https://stackoverflow.com/a/2450976/16313645
    private static shuffle(array: any[]) {
        let currentIndex = array.length, randomIndex;

        // While there remain elements to shuffle...
        while (currentIndex != 0) {

            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            // And swap it with the current element.
            [array[currentIndex], array[randomIndex]] = [
                array[randomIndex], array[currentIndex]];
        }

        return array;
    }

    public cards: Card[];
    private _cards: Card[];

    pick(count?: number) {
        const cards = []; count = count ?? 1;
        while (count !== 0) { const card = this.cards.shift(); cards.push(card); this._cards.push(card); count--; }
        return cards;
    }

    reset(auto_shuffle?: boolean) {
        this.cards = []; this._cards = [];
        for (const rank of ['Ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'Jack', 'Queen', 'King'] as CardRank[])
            for (const suit of ['Clubs', 'Diamonds', 'Hearts', 'Spades'] as CardSuit[])
                this.cards.push(new Card(rank, suit)); auto_shuffle && this.shuffle();
    }

    shuffle() { return this.cards = Deck.shuffle(this.cards); }
}*/