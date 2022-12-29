
const POKE_API = 'https://pokeapi.co/api/v2/pokemon/'


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
                .then(data => data.sprites.other['official-artwork'].front_default)
        })
    )
}

{/* <div class="card">
        <img src="./charmander.png" />
      </div> */}

function showPokemons(pokemons) {
    console.log(pokemons)
    const gridContainer = document.getElementsByClassName('grid-container')[0]
    gridContainer.innerHTML = ''
    shuffle(duplicate(pokemons)).forEach(pokemon => {
        const div = document.createElement('div')
        const img = document.createElement('img')
        img.src = pokemon
        div.classList.add('card')

        div.classList.add('hidden')
        div.addEventListener('click', () => {
            div.classList.toggle('hidden')
        })
        div.appendChild(img)
        gridContainer.appendChild(div)
    }
    )


}
function startGame() {

    const randomNumbers = createRandomNumbersList()
    getPokemons(randomNumbers).then(
        pokemons => showPokemons(pokemons)
    )

}
// -----------------------------------------
function duplicate(list) {
    return list.concat(list)

}

startGame()

function shuffle(list) {
    return list.sort(() => Math.random() - 0.5)
}