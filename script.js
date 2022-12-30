
const POKE_API = 'https://pokeapi.co/api/v2/pokemon/';

let gameState

function setGameState(cards = []) {
    gameState = {
        cards,
        moves: 0
    }
}

const TIMEOUT = 1000

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
                .then(data => data.sprites.other['official-artwork'].front_default
                )
        })
    )
}

function duplicate(list) {
    return list.concat(list)
}

function shuffle(list) {
    return list.sort(() => Math.random() - 0.5)
}

function setCards(pokemons) {
    const gridContainer = document.getElementsByClassName('grid-container')[0]
    gridContainer.classList.add('loading')
    gridContainer.innerHTML = ''
    const cards = shuffle(duplicate(pokemons)).map((pokemon, index) => {
        const div = document.createElement('div')
        const img = document.createElement('img')
        img.src = pokemon
        div.classList.add('card')
        div.classList.add('hidden')
        div.addEventListener('click', () => handleClick(index))
        div.appendChild(img)
        gridContainer.appendChild(div)
        return {
            node: div,
            isVisible: false,
            isPaired: false,
            id: pokemon
        }
    })
    setGameState(cards)
    gridContainer.classList.remove('loading')

}

function startGame() {
    setGameState()
    const randomNumbers = createRandomNumbersList()
    getPokemons(randomNumbers).then(
        pokemons => setCards(pokemons)
    )
    updateMoves()
}


// ----------------------------------------

function showForever(cards) {
    cards.forEach(card => {
        showCard(card)
        card.isPaired = true
        card.node.classList.add('paired')
    })
}

function showCard(card) {
    card.isVisible = true
    card.node.classList.remove('hidden')
}

function hideCard(card) {
    if (card.isPaired) return;
    card.isVisible = false
    card.node.classList.add('hidden')
}

function hideUnpaired() {
    const { cards } = gameState
    cards.forEach((card) => {
        if (!card.isPaired) {
            hideCard(card)
        }
    })
}

function handleClick(index) {
    const card = gameState.cards[index]
    if (card.isVisible || card.isPaired) {
        return;
    }
    const visibleUnpairedCards = getVisibleUnpairedCards()
    switch (visibleUnpairedCards.length) {
        case 0: {
            return showCard(card)
        }
        case 1: {
            showCard(card)
            return verifyPair()
        }
        case 2: {
            hideUnpaired()
            return showCard(card)
        }
    }
}


function verifyPair() {
    const visibleUnpairedCards = getVisibleUnpairedCards()
    if (visibleUnpairedCards.length != 2)
        return;
    if (visibleUnpairedCards[0].id == visibleUnpairedCards[1].id) {
        showForever(visibleUnpairedCards);
    } else {
        setTimeout(() => {
            hideCard(visibleUnpairedCards[0])
            hideCard(visibleUnpairedCards[1])
        }, TIMEOUT)
    }
    addMove()
    verifyWin()
}

function getVisibleUnpairedCards() {
    const visibleUnpairedCards = gameState.cards.filter(card => card.isVisible && !card.isPaired)
    return visibleUnpairedCards
}

function verifyWin() {
    if (gameState.cards.every(card => card.isPaired)) {
        setTimeout(() => alert(`Ganaste en ${gameState.moves} jugadas`), 200)
    }
}

function addMove() {
    gameState.moves++
    updateMoves()

}

function updateMoves() {
    document.getElementById('moves').innerHTML =
        `Jugadas: ${gameState.moves}`
}

// ----------------------------------------


startGame()

