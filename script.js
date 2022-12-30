
const POKE_API = 'https://pokeapi.co/api/v2/pokemon/';

let gameState

function setGameState(cards) {
    gameState = {
        cards: cards || [],
        firstCardIndex: null,
        secondCardIndex: null,
        isLocked: false,
        moves: 0
    }
}

const TIMEOUT = 1500

function getRandomNumber() {
    const randomNumber = Math.round(Math.random() * 150) + 1;
    return randomNumber;
}

function createRandomNumbersList() {
    let numbersList = []
    for (let i = 0; i < 8; i++) {
        let randomNumber = getRandomNumber();
        if (numbersList.some(number => number == randomNumber)) {
            i--;
        }
        else {
            numbersList.push(randomNumber);
        }
    }
    return numbersList;
}



function getPokemons(numbers) {
    return Promise.all(
        numbers.map(number => {
            const url = POKE_API + number
            return fetch(url)
                .then(response => response.json())
                .then(data => ({
                    image: data.sprites.other['official-artwork'].front_default,
                    id: number
                })
                )
        })
    )
}

function buildDeck(pokemons) {
    const gridContainer = document.getElementsByClassName('grid-container')[0]
    gridContainer.innerHTML = ''
    const cards = shuffle(duplicate(pokemons)).map((pokemon, index) => {
        const div = document.createElement('div')
        const img = document.createElement('img')
        img.src = pokemon.image
        div.classList.add('card')
        div.classList.add('hidden')
        div.addEventListener('click', () => handleClick(index))
        div.appendChild(img)
        gridContainer.appendChild(div)
        return {
            node: div,
            hidden: true,
            paired: false,
            ...pokemon
        }
    })
    setGameState(cards)

}

function handleClick(index) {

    const card = gameState.cards[index]
    if (
        card.paired
        || gameState.firstCardIndex === index
        || gameState.secondCardIndex === index
    ) {
        return;
    }

    if (gameState.isLocked) {
        gameState.firstCardIndex = null
        gameState.secondCardIndex = null
        console.log('is locked');
        gameState.cards.filter(card => !card.paired).forEach(card => card.hidden = true)
        refreshCards()
        gameState.isLocked = false
    }
    card.hidden = false

    if (gameState.firstCardIndex === null) {
        gameState.firstCardIndex = index
    } else if (gameState.secondCardIndex === null) {
        gameState.secondCardIndex = index
    }

    if (gameState.firstCardIndex !== null && gameState.secondCardIndex !== null) {
        verifyPair()
    }

    refreshCards();
    refreshMoves();
}

function verifyPair() {
    const { cards, firstCardIndex, secondCardIndex } = gameState
    if (cards[firstCardIndex].id === cards[secondCardIndex].id) {
        cards[firstCardIndex].paired = true
        cards[secondCardIndex].paired = true
        gameState.isLocked = false
    } else {
        gameState.isLocked = true
        setTimeout(() => {
            cards[firstCardIndex].hidden = true
            cards[secondCardIndex].hidden = true
            gameState.isLocked = false
            refreshCards();
        }, TIMEOUT)
    }
    gameState.firstCardIndex = null
    gameState.secondCardIndex = null
    gameState.moves++
}

function verifyWin() {
    if (gameState.cards.every(card => card.paired)) {
        alert(`Ganaste en ${gameState.moves} jugadas`)
    }
}

function refreshCards() {
    gameState.cards.forEach(card => {
        if (card.hidden) {
            card.node.classList.add('hidden')
        }
        else {
            card.node.classList.remove('hidden')
        }
        if (card.paired) {
            card.node.classList.add('paired')
        }
    })
    verifyWin();

}

function refreshMoves() {
    document.getElementById('moves').innerHTML =
        `Jugadas: ${gameState.moves}`
}

function startGame() {
    setGameState()
    const randomNumbers = createRandomNumbersList()
    getPokemons(randomNumbers).then(
        pokemons => buildDeck(pokemons)
    )
    refreshMoves()
}

function duplicate(list) {
    return list.concat(list)
}

function shuffle(list) {
    return list.sort(() => Math.random() - 0.5)
}

startGame()

