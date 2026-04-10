import { useState, useEffect } from 'react'
import personService from './services/persons'



const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [filter, setFilter] = useState('')

 
  useEffect(() => {
    personService.getAll().then(initialPersons => {
      setPersons(initialPersons)
    })
  }, [])

  const addPerson = (event) => {
    event.preventDefault()
    
    //sprawdza czy jest już osoba o takim imieniu
    const existingPerson = persons.find(p => p.name.toLowerCase() === newName.toLowerCase())

    if (existingPerson) {
      const confirmUpdate = window.confirm(
        `${newName} is already added to phonebook, replace the old number with a new one?`
      )

      if (confirmUpdate) {
        const changedPerson = { ...existingPerson, number: newNumber }
        
      //
        personService
          .update(existingPerson.id, changedPerson)
          .then(returnedPerson => {
            setPersons(persons.map(p => p.id !== existingPerson.id ? p : returnedPerson))
            setNewName('')
            setNewNumber('')
          })
          .catch(error => {
          
            alert(`Information of '${existingPerson.name}' has already been removed from server`)
            setPersons(persons.filter(p => p.id !== existingPerson.id))
          })
      }
      return
    }

    const personObject = { name: newName, number: newNumber }

    //dodawanie wrzuca dane do bazy danych i aktualizuje stan z odpowiedzią z serwera
    personService.create(personObject).then(returnedPerson => {
      setPersons(persons.concat(returnedPerson))
      setNewName('')
      setNewNumber('')
    })
  }

  //usuwanie usuwa z bazy danych i aktualizuje stan usuwając osobę o danym id
  const deletePerson = (id, name) => {
    if (window.confirm(`Delete ${name}?`)) {
      personService
        .remove(id)
        .then(() => {
          setPersons(persons.filter(p => p.id !== id))
        })
    }
  }

  //filtry tworzą nową tablicę z osobami, których imiona zawierają tekst z pola 
  const personsToShow = persons.filter(person =>
    person.name.toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <div>
      <h2>Phonebook</h2>
      <Filter filter={filter} handleFilterChange={(e) => setFilter(e.target.value)} />
      
      <h3>Add a new</h3>
      <PersonForm
        addPerson={addPerson}
        newName={newName}
        handleNameChange={(e) => setNewName(e.target.value)}
        newNumber={newNumber}
        handleNumberChange={(e) => setNewNumber(e.target.value)}
      />

      <h3>Numbers</h3>
      <Persons persons={personsToShow} deletePerson={deletePerson} />
    </div>
  )
}

export default App