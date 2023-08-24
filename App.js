import { useEffect, useState } from 'react';
import './App.css';

function Search({onSubmit, setSearchValue}){
    const handleChange = (event) => {
        setSearchValue(event.target.value)
    }

    return (
        <div className='container'>
            <form id='searchForm' onSubmit={onSubmit}> 
                <span className="material-symbols-outlined">search</span>
                <input 
                    type='text'
                    id='searchInput'
                    placeholder='Search for any dish'
                    onChange={handleChange}
                ></input>
                <button type='submit'>Search</button>
            </form>
        </div>
    )
}

export default function App() {
    const [searchValue, setSearchValue] = useState('');
    const [results, setResults] = useState([]);
    const [searchResultText, setSrText] = useState('');
    const [recipeVisible, setRecipeVisible] = useState(false);
    const [mealRecipe, setMealRecipe] = useState([]);

    useEffect(() => {
        const searchResultContainer = document.getElementById('searchResultContainer');

        function handleGridItemClick(event){
            if(event.target.classList.contains('gridItem')){
                const gridItemId = event.target.getAttribute('data-id');
                console.log(gridItemId);
            }
        }

        searchResultContainer.addEventListener('click', handleGridItemClick);
    }, [])

    function searchApi(event){
        event.preventDefault();
        // console.log(searchValue);

        document.getElementById('searchInput').value = '';

        if(searchValue !== ''){
            fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${searchValue}`)
            .then(response => response.json())
            .then(data => {
                // console.log(data);
                
                if(data.meals !== null){
                    const fetchedResults = data.meals.map(item => (
                        <div 
                            key={item.idMeal} 
                            className='gridItem' 
                            data-id={item.idMeal}
                            onClick={() => handleGridItemClick(item.idMeal)}
                        >
                            <img 
                                src={item.strMealThumb}
                                style={{
                                    width: 275,
                                    height: 175
                                }}
                                alt={item.strMeal}
                            ></img>
                            <h2 id='gridItemTitle'>{item.strMeal}</h2>
                            <p id='gridItemArea'>- {item.strArea}</p>
                            <p id='gridItemCategory'>- {item.strCategory}</p>
                        </div>
                    ))
                    setResults(fetchedResults);
                    setSrText(`Search Results for ${searchValue}`);
                }else{
                    setSrText(`No results found for ${searchValue}`);
                    setResults('');
                }
            })
        }
    }

    function handleGridItemClick(gridItemId) {
        // console.log(gridItemId);s

        fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${gridItemId}`)
        .then(response => response.json())
        .then(data => {
            console.log(data);

            const parsedIngredients = [];
            function countIngredients(){
                for(let i=1; i<20; i++){
                    let tempString = `strIngredient${i}`;
                    if(data.meals[0][tempString] === '' || data.meals[0][tempString] === null){
                        return i;
                    }
                }

                if(data.meals[0].strIngredient20 != ''){
                    return 20;
                }
            }
            let numOfIngredients = countIngredients();

            for(let i=1; i<numOfIngredients; i++){
                let tempIngredient = `strIngredient${i}`;
                let tempMeasure = `strMeasure${i}`;

                parsedIngredients.push(
                    <li key={i}>{data.meals[0][tempMeasure]} of {data.meals[0][tempIngredient]}</li>
                )
            }

            function handleClose(){
                document.getElementById('specificRecipe').style.display = 'none';
            }

            const parsedMealRecipe = data.meals.map(meal => (
                <div key={meal.idMeal}>
                    <h1 id='recipeTitle'>Recipe for {meal.strMeal}</h1>
                    <span className="material-symbols-outlined" onClick={handleClose}>close</span>

                    <div id='recipeIngredients'>
                        <h2>Ingredients</h2>
                        <ul>
                            {parsedIngredients}
                        </ul>
                    </div>

                    <div id='recipeInstructions'>
                        <h2>Instructions</h2>
                        {meal.strInstructions}
                    </div>
                </div>            
            ))

            setMealRecipe(parsedMealRecipe);
            setRecipeVisible(true);
        })

        document.getElementById('specificRecipe').style.display = 'block';
    }

    return (
        <div>
            <div id='header'>
                <h1>Find any dish in the world!</h1>
            </div>
            <Search onSubmit={searchApi} setSearchValue={setSearchValue}></Search>
            <h2 id='srHeader'>{searchResultText}</h2>
            <div id='searchResultContainer'>
                {results}
            </div>
            <div id='specificRecipe' style={{display: recipeVisible?'flex':'none'}}>{mealRecipe}</div>
        </div>
    )
}