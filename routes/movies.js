var express = require('express');
var router = express.Router();
var _ = require('lodash');
const axios = require('axios');

let movies = []

/*GET all movies*/
router.get('/', (req, res) =>{
    res.json({movies});
});
// récupère tout les films présent dans la base de données locale

/*GET by id*/
router.get('/:id', (req, res)=>{
    const {id} = req.params;
    const movie = _.find(movies, ["id", id]);
    res.json({
        message: 'Movie found',
        movie
    });
});
// récupère un film présent dans la base de données locale en précisant l'ID du film que l'on souhaite récupérer

/*PUT*/
router.put('/', (req, res)=>{
    const {movie} = req.body;
    const id = _.uniqueId();
    movies.push({movie, id});
    res.json({
        message: 'Just added ${id}',
        movie: {movie, id}
    })
});
// permet d'ajouter un film en précisant ses paramètres en local à la base de données


// ici, les routes PUT et POST permettent d'interroger une API externe en précisant le titre du film et la clé d'API.
// Les données renvoyées sont définies dans un objet que l'on va récupérer.
// même principe de fonctionnement que les routes précédentes

const api_key = "f805c109";


function Informations_omdb(data, id = undefined){
    const m = {
        id: id || _.uniqueId(),
        movie: data.Title,
        yearOfRelease: parseInt(data.Year),
        duration: parseInt(data.Runtime),
        actors: data.Actors.split(", "),
        poster: data.Poster,
        boxOffice: data.BoxOffice,
        rottenTomatoesScore: data.Ratings
    };

    return m;
}

function find(id){
    return movies.find((film) => film.id=== id);
}


router.put('/', (req, res)=>{

    if(req.body.movie === undefined){
        res.status(400).send({"error": "missing parameters"});
    }

    axios.get("http://www.omdbapi.com/",{
        params: {
            t: req.body.movie,
            apikey: api_key,
        }
    })

    .then((rep)=>{
        if(rep.data.Response === "True"){
            const film = Informations_omdb(rep.data);
            movies.push(film);
            res.send(film);
        }else{
            res.status(404).send({"error1": rep.data.Error});
        }
    })

    .catch((err)=>{
        console.error(err);
        res.status(500).send({"error2": err})
    })
});

/*POST by id*/
router.post('/:id', (req, res) =>{
    const {id} = req.params;
    const {movie} = req.body;

    axios.get("http://www.omdbapi.com/",{
        params: {
            t: req.body.movie,
            apikey: api_key,
        }
    })

    .then((rep)=>{
        if(rep.data.Response === "True"){
            const film = Informations_omdb(rep.data, id);
            movies[_.findIndex(movies, ["id", id])] = film;
            res.send(film);
        } else {
            res.status(404).send({"error1": rep.data.Error});
        }
    })

    .catch((err)=>{
        console.error(err);
        res.status(500).send({"error2": err})
    });
});

/*DELETE by id*/
router.delete('/:id', (req, res)=>{
    const {id} = req.params;
    _.remove(movies, ["id", id]);
    res.json({
        message: `Just removed ${id}`
    });
});

//Testons avec une autre base de donnes API
axios.get('https://jsonplaceholder.typicode.com/posts', {
    params: {
        id:1
    }
})
    .then(function(response){
      console.log(response.data);  
    })
    .catch(function(error){
        console.log(error);
    })
    .then(function (){

    });

  
module.exports = router;
