import { useState, useEffect } from 'react'
import axios from 'axios'

const Weather = ({ city }) => {
  const [weather, setWeather] = useState(null)
  const api_key = import.meta.env.VITE_SOME_KEY

  useEffect(() => {
    axios
      .get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${api_key}`)
      .then(response => {
        setWeather(response.data)
      })
      .catch(error => console.log('Weather error:', error))
  }, [city, api_key])

  if (!weather) return null

  return (
    <div>
      <h3>Weather in {city}</h3>
      <p>temperature {weather.main.temp} Celsius</p>
      <img 
        src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`} 
        alt="weather icon" 
      />
      <p>wind {weather.wind.speed} m/s</p>
    </div>
  )
}

const CountryInfo = ({ country }) => {
  return (
    <div>
      <h1>{country.name.common}</h1>
      <p>capital {country.capital[0]}</p>
      <p>area {country.area}</p>
      
      <h4>languages:</h4>
      <ul>
        {Object.values(country.languages).map(lang => (
          <li key={lang}>{lang}</li>
        ))}
      </ul>
      <img src={country.flags.png} alt="flag" width="150" />
      
      <Weather city={country.capital[0]} />
    </div>
  )
}

const Content = ({ countries, setCountriesToShow }) => {
  if (countries.length > 10) {
    return <p>Too many matches, specify another filter</p>
  }

  if (countries.length > 1 && countries.length <= 10) {
    return (
      <div>
        {countries.map(c => (
          <div key={c.cca3}>
            {c.name.common} 
            <button onClick={() => setCountriesToShow([c])}>show</button>
          </div>
        ))}
      </div>
    )
  }

  if (countries.length === 1) {
    return <CountryInfo country={countries[0]} />
  }

  return null
}

const App = () => {
  const [value, setValue] = useState('')
  const [allCountries, setAllCountries] = useState([])
  const [countriesToShow, setCountriesToShow] = useState([])

  useEffect(() => {
    axios
      .get('https://studies.cs.helsinki.fi/restcountries/api/all')
      .then(response => {
        setAllCountries(response.data)
      })
  }, [])

  const handleChange = (event) => {
    const search = event.target.value
    setValue(search)
    
    const filtered = allCountries.filter(c => 
      c.name.common.toLowerCase().includes(search.toLowerCase())
    )
    setCountriesToShow(filtered)
  }

  return (
    <div>
      <div>
        find countries <input value={value} onChange={handleChange} />
      </div>
      <Content 
        countries={countriesToShow} 
        setCountriesToShow={setCountriesToShow} 
      />
    </div>
  )
}

export default App